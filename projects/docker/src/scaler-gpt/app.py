"""
ScalerGPT - A RAG chatbot over your own notes.

Architecture:
  [ you ] --> app (FastAPI, this file) --> chroma (vector DB, separate container)
                     |
                     +--> OpenAI API (embeddings + chat completion)
"""
import os
import sys
import time

import chromadb
from chromadb.utils import embedding_functions
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI(title="ScalerGPT", description="RAG over your course notes")

# --- Fail loudly and clearly if the API key is missing ---------------------
API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
if not API_KEY or API_KEY.startswith("sk-paste"):
    sys.exit(
        "\n[ScalerGPT] OPENAI_API_KEY is missing.\n"
        "  Fix: cp .env.example .env, put your real key in it, then\n"
        "       docker compose up -d --force-recreate\n"
    )

llm = OpenAI(api_key=API_KEY)

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=API_KEY,
    model_name="text-embedding-3-small",
)

CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))


def connect_to_chroma(retries: int = 30, delay: int = 2):
    """
    Chroma's container takes a few seconds to boot. `depends_on` only waits for
    the container to START, not to be READY - so we retry here instead of
    crashing on the first refused connection.
    """
    # ① try to create a Chroma client and prove it is ready
    for attempt in range(1, retries + 1):
        try:
            client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
            client.heartbeat()
            print(f"[ScalerGPT] Connected to chroma at {CHROMA_HOST}:{CHROMA_PORT}")
            return client
        except Exception as e:
            # ② wait before retrying while Chroma finishes booting
            print(
                f"[ScalerGPT] Waiting for chroma "
                f"({attempt}/{retries}): {type(e).__name__}",
                flush=True,
            )
            time.sleep(delay)
    # ③ stop the service with a clear message after all retries fail
    sys.exit(f"\n[ScalerGPT] Could not reach chroma at {CHROMA_HOST}:{CHROMA_PORT}\n")


chroma = connect_to_chroma()
collection = chroma.get_or_create_collection(name="notes", embedding_function=openai_ef)


class Question(BaseModel):
    query: str


@app.get("/")
def health():
    return {
        "status": "ScalerGPT is live 📚",
        "docs_indexed": collection.count(),
        "chroma_host": CHROMA_HOST,
        "chroma_port": CHROMA_PORT,
    }


@app.post("/ask")
def ask(q: Question):
    # ① reject questions until the vector index has documents
    if collection.count() == 0:
        raise HTTPException(
            status_code=400,
            detail="No documents indexed yet. Run: docker compose exec scalergpt python ingest.py",
        )

    # ② RETRIEVE - find the most relevant chunks from the vector DB
    hits = collection.query(query_texts=[q.query], n_results=3)
    documents = hits.get("documents") or [[]]
    context = "\n\n---\n\n".join(documents[0])

    # ③ AUGMENT - stuff that context into the prompt
    system_prompt = (
        "You are ScalerGPT, a helpful teaching assistant. "
        "Answer the user's question using ONLY the context below. "
        "If the context does not contain the answer, say you don't know.\n\n"
        f"CONTEXT:\n{context}"
    )

    # ④ GENERATE - let the LLM write the final answer
    resp = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": q.query},
        ],
    )

    # ⑤ return the answer and how many source chunks were used
    return {
        "question": q.query,
        "answer": resp.choices[0].message.content,
        "sources_used": len(documents[0]),
    }
