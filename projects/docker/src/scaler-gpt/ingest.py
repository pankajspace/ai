"""
Loads every .txt and .md file from docs/ into the Chroma vector database.

Run this AFTER the containers are up:
    docker compose exec scalergpt python ingest.py
"""
import glob
import os
import sys
import time

import chromadb
from chromadb.utils import embedding_functions

# ① validate the API key and configure the embedding model
API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
if not API_KEY or API_KEY.startswith("sk-paste"):
    sys.exit("[ingest] OPENAI_API_KEY is missing. Put a real key in .env and recreate.")

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=API_KEY,
    model_name="text-embedding-3-small",
)

# ② connect to Chroma, retrying until the service is ready
host = os.getenv("CHROMA_HOST", "localhost")
port = int(os.getenv("CHROMA_PORT", "8000"))

chroma = None
for attempt in range(10):
    try:
        chroma = chromadb.HttpClient(host=host, port=port)
        chroma.heartbeat()
        break
    except Exception:
        print(f"[ingest] waiting for chroma ({attempt + 1}/10)...", flush=True)
        time.sleep(2)
if chroma is None:
    sys.exit(f"[ingest] Could not reach chroma at {host}:{port}")

# ③ open the notes collection and find source files to ingest
collection = chroma.get_or_create_collection(name="notes", embedding_function=openai_ef)

files = sorted(glob.glob("docs/*.txt") + glob.glob("docs/*.md"))
if not files:
    sys.exit("No files found in docs/ — add some .txt or .md notes first.")

# ④ prepare containers for every chunk, document, and source label
ids, documents, metadatas = [], [], []
for path in files:
    # ⑤ read each file and split it into useful paragraph chunks
    with open(path, "r", encoding="utf-8") as f:
        text = f.read().strip()

    # Simple chunking: split on blank lines, keep chunks of reasonable size
    chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 40]

    # ⑥ attach stable ids and source metadata to every chunk
    for i, chunk in enumerate(chunks):
        ids.append(f"{os.path.basename(path)}::{i}")
        documents.append(chunk)
        metadatas.append({"source": os.path.basename(path)})

# ⑦ stop if the files did not produce any useful chunks
if not documents:
    sys.exit("Files found but no usable chunks. Make paragraphs a bit longer.")

# ⑧ upsert chunks so re-running this script refreshes the index safely
# upsert = add or overwrite, so re-running this script is safe
collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

# ⑨ report how many chunks were indexed
print(f"Ingested {len(documents)} chunks from {len(files)} file(s) ✅")
print(f"Collection now holds {collection.count()} chunks total.")
