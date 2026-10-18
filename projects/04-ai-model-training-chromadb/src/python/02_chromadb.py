"""ScalerGPT — Document Ingestion & RAG over Markdown Notes with ChromaDB.

This service demonstrates a complete Retrieval-Augmented Generation (RAG) workflow over markdown notes:
1. Connects to ChromaDB (`chromadb.HttpClient` when `CHROMA_HOST` is configured, or an in-memory
   `chromadb.EphemeralClient` inside the Flask server).
2. Reads `.md` and `.txt` notes from `docs/`, splits them into paragraph chunks, embeds them with OpenAI's
   `text-embedding-3-small`, and upserts them into the `"notes"` Chroma collection.
3. Executes the 3-stage RAG pipeline (Retrieve -> Augment -> Generate): queries top-3 relevant chunks from
   ChromaDB, injects them into a grounded system prompt, and generates a factual answer with `gpt-4o-mini`.
"""

import os
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv(find_dotenv())

DOCS_DIR = Path(__file__).with_name("docs")
_chroma_client = None


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class ChromaDbRequest(BaseModel):
    """Input payload for ScalerGPT ChromaDB RAG query."""

    question: str = "Why should I copy requirements.txt before the rest of my code?"


class ChromaDbSource(BaseModel):
    """A retrieved document chunk with its source filename."""

    source: str
    content: str


class ChromaDbResponse(BaseModel):
    """Output payload containing grounded answer, indexed chunk count, and retrieved sources."""

    question: str
    answer: str
    docs_indexed: int
    sources: list[ChromaDbSource]


# ---------------------------------------------------------------------------
# ChromaDB Connection & Markdown Note Ingestion
# ---------------------------------------------------------------------------
def _get_collection():
    """Return the 'notes' Chroma collection, ingesting markdown files from docs/ if empty."""
    global _chroma_client
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured in environment.")

    # ① Connect to Chroma server if CHROMA_HOST is set; otherwise use in-memory EphemeralClient
    if _chroma_client is None:
        chroma_host = os.getenv("CHROMA_HOST", "").strip()
        chroma_port = int(os.getenv("CHROMA_PORT", "8000"))
        if chroma_host:
            _chroma_client = chromadb.HttpClient(host=chroma_host, port=chroma_port)
        else:
            _chroma_client = chromadb.EphemeralClient()

    # ② Configure OpenAI text-embedding-3-small for the collection
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=api_key,
        model_name="text-embedding-3-small",
    )
    collection = _chroma_client.get_or_create_collection(
        name="notes",
        embedding_function=openai_ef,
    )

    # ③ Ingest markdown/text notes from docs/ on first query
    if collection.count() == 0:
        files = sorted(list(DOCS_DIR.glob("*.txt")) + list(DOCS_DIR.glob("*.md")))
        ids, documents, metadatas = [], [], []
        for path in files:
            text = path.read_text(encoding="utf-8").strip()
            chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 40]
            for i, chunk in enumerate(chunks):
                ids.append(f"{path.name}::{i}")
                documents.append(chunk)
                metadatas.append({"source": path.name})
        if documents:
            collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

    return collection


# ---------------------------------------------------------------------------
# Core Service Logic (Retrieve -> Augment -> Generate)
# ---------------------------------------------------------------------------
def ask_chromadb_notes(question: str) -> dict:
    """Query indexed markdown notes in ChromaDB and synthesize a grounded answer."""
    collection = _get_collection()

    # ④ RETRIEVE: Find the top-3 most relevant chunks from ChromaDB
    hits = collection.query(query_texts=[question], n_results=3)
    retrieved_docs = (hits.get("documents") or [[]])[0]
    retrieved_metas = (hits.get("metadatas") or [[]])[0]
    context = "\n\n---\n\n".join(retrieved_docs)

    # ⑤ AUGMENT: Build the strictly grounded ScalerGPT system prompt
    system_prompt = (
        "You are ScalerGPT, a helpful teaching assistant. "
        "Answer the user's question using ONLY the context below. "
        "If the context does not contain the answer, say you don't know.\n\n"
        f"CONTEXT:\n{context}"
    )

    # ⑥ GENERATE: Synthesize the final answer with OpenAI
    llm = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        timeout=20.0,
    )
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    resp = llm.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
    )

    sources = [
        {
            "source": (meta.get("source", "notes") if isinstance(meta, dict) else "notes"),
            "content": doc,
        }
        for doc, meta in zip(retrieved_docs, retrieved_metas)
    ]

    return {
        "question": question,
        "answer": (resp.choices[0].message.content or "").strip(),
        "docs_indexed": collection.count(),
        "sources": sources,
    }

