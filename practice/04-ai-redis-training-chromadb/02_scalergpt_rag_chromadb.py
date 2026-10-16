"""ScalerGPT — Document Ingestion & RAG over Markdown Notes with ChromaDB.

This script demonstrates a complete Retrieval-Augmented Generation (RAG) workflow over markdown notes:
1. Connects to ChromaDB (`chromadb.HttpClient` when `CHROMA_HOST` is configured in Docker Compose, or an
   in-memory `chromadb.EphemeralClient` when running standalone on the host).
2. Reads `.md` and `.txt` notes from `docs/`, splits them into paragraph chunks, embeds them with OpenAI's
   `text-embedding-3-small`, and upserts them into the `"notes"` Chroma collection.
3. Executes the 3-stage RAG pipeline (Retrieve -> Augment -> Generate): queries top-3 relevant chunks from
   ChromaDB, injects them into a grounded system prompt, and generates a factual answer with `gpt-4o-mini`.

Run locally (from this folder):
    pip install -r requirements.txt
    python 02_scalergpt_rag_chromadb.py

Run with Docker Compose (from this folder):
    docker compose run --rm 02_scalergpt_rag_chromadb
"""

import os
import sys
import time
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load API keys and model configuration from .env
load_dotenv(find_dotenv())

API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
if not API_KEY or API_KEY.startswith("sk-paste"):
    sys.exit(
        "\n[ScalerGPT] OPENAI_API_KEY is missing.\n"
        "  Fix: cp .env.example .env and set your real OPENAI_API_KEY.\n"
    )

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
BASE_URL = os.getenv("OPENAI_BASE_URL") or None
CHROMA_HOST = os.getenv("CHROMA_HOST", "")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))
DOCS_DIR = Path(__file__).with_name("docs")

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Pick a question to ask over the markdown notes in `docs/` - uncomment another line to test
question = "Why should I copy requirements.txt before the rest of my code?"
# question = "What is the difference between an image and a container?"
# question = "What happens to my data when I run docker compose down?"
# question = "Why does chunk size matter in RAG?"
# question = "What is the capital of France?"  # not in docs/ -> model says it doesn't know


# ---------------------------------------------------------------------------
# Step 1: Connect to ChromaDB & Initialize Collection
# ---------------------------------------------------------------------------
def connect_to_chroma(retries: int = 20, delay: int = 2):
    """Connect to the Chroma container over HTTP (with startup retry) or fall back to local EphemeralClient."""
    # ③ When CHROMA_HOST is set (e.g. in Docker Compose), retry until the Chroma container finishes booting
    if CHROMA_HOST:
        for attempt in range(1, retries + 1):
            try:
                client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
                client.heartbeat()
                print(f"[ScalerGPT] Connected to Chroma server at {CHROMA_HOST}:{CHROMA_PORT}")
                return client
            except Exception as e:
                print(f"[ScalerGPT] Waiting for Chroma ({attempt}/{retries}): {type(e).__name__}", flush=True)
                time.sleep(delay)
        sys.exit(f"\n[ScalerGPT] Could not reach Chroma at {CHROMA_HOST}:{CHROMA_PORT}\n")

    # ④ When running standalone locally without a Chroma container, use an in-memory Chroma client
    print("[ScalerGPT] Using local in-memory ChromaDB client (set CHROMA_HOST to use a Chroma server)")
    return chromadb.EphemeralClient()


llm = OpenAI(api_key=API_KEY, base_url=BASE_URL)
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=API_KEY,
    model_name="text-embedding-3-small",
)

chroma = connect_to_chroma()
collection = chroma.get_or_create_collection(name="notes", embedding_function=openai_ef)

# ---------------------------------------------------------------------------
# Step 2: Ingest Markdown Notes from `docs/`
# ---------------------------------------------------------------------------
# ⑤ Read all .md and .txt files in docs/, split into paragraph chunks, and upsert into ChromaDB
files = sorted(list(DOCS_DIR.glob("*.txt")) + list(DOCS_DIR.glob("*.md")))
if not files:
    sys.exit(f"No files found in {DOCS_DIR} — add some .txt or .md notes first.")

ids, documents, metadatas = [], [], []
for path in files:
    text = path.read_text(encoding="utf-8").strip()
    chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 40]
    for i, chunk in enumerate(chunks):
        ids.append(f"{path.name}::{i}")
        documents.append(chunk)
        metadatas.append({"source": path.name})

collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
print(f"[ScalerGPT] Ingested {len(documents)} chunks from {len(files)} file(s) (total indexed: {collection.count()}) ✅\n")

# ---------------------------------------------------------------------------
# Step 3: Retrieve -> Augment -> Generate (RAG)
# ---------------------------------------------------------------------------
# ⑥ RETRIEVE: Find the top-3 most semantically relevant chunks from ChromaDB
hits = collection.query(query_texts=[question], n_results=3)
retrieved_docs = (hits.get("documents") or [[]])[0]
retrieved_metas = (hits.get("metadatas") or [[]])[0]
context = "\n\n---\n\n".join(retrieved_docs)

# ⑦ AUGMENT: Inject the retrieved chunks into a strictly grounded system prompt
system_prompt = (
    "You are ScalerGPT, a helpful teaching assistant. "
    "Answer the user's question using ONLY the context below. "
    "If the context does not contain the answer, say you don't know.\n\n"
    f"CONTEXT:\n{context}"
)

# ⑧ GENERATE: Ask the LLM to synthesize the final answer from the retrieved context
resp = llm.chat.completions.create(
    model=MODEL_NAME,
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": question},
    ],
)

# ---------------------------------------------------------------------------
# Output Results
# ---------------------------------------------------------------------------
print(f"Question: {question}\n")
print(f"Retrieved chunks ({len(retrieved_docs)}):")
for i, (doc, meta) in enumerate(zip(retrieved_docs, retrieved_metas), start=1):
    source = meta.get("source", "unknown") if isinstance(meta, dict) else "unknown"
    preview = doc.replace("\n", " ")
    print(f"  [{i}] ({source}) {preview[:120]}...")

print(f"\nAnswer:\n{resp.choices[0].message.content}")

