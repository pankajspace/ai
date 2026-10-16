# AI RAG & Chroma Practice Scripts

Sequential progression covering document chunking, local sentence embeddings, and end-to-end Retrieval-Augmented Generation (RAG) with Chroma.

## 1. Set up API keys

All scripts in this folder share a single `.env` file and `requirements.txt`. All `.env` files are gitignored.

To set up your keys:

```bash
cp .env.example .env    # configure OPENAI_API_KEY (used in 03_rag.py)
```

Note: `01_chunking.py` and `02_embedding.py` run entirely locally and require no external API keys.

## 2. Run with Docker Compose (easiest)

From the `practice/03-ai-rag-chroma` folder, you can run any script with one command:

```bash
docker compose run --rm 01_chunking
docker compose run --rm 02_embedding
docker compose run --rm 03_rag
```

1. All services share the same Docker image (`practice-03-ai-rag-chroma`) built from the common `Dockerfile` and `requirements.txt`.
2. The shared image includes CPU-only PyTorch and pre-downloads the `all-MiniLM-L6-v2` embedding model at build time, so runs start quickly.
3. It automatically picks up the shared `.env` file.
4. It mounts each script (`01_chunking.py`, etc.) so changes to your code take effect immediately without rebuilding.
5. If you update `requirements.txt`, pass `--build` to rebuild:
   ```bash
   docker compose run --rm --build 03_rag
   ```

## 3. Run with Docker directly (alternative)

From the `practice/03-ai-rag-chroma` folder:

```bash
docker build -t practice-03-ai-rag-chroma .
docker run --rm --env-file .env practice-03-ai-rag-chroma python 03_rag.py
```

## 4. Run locally (without Docker)

Use **Python 3.12**. PyTorch (used by `02_embedding.py` and `03_rag.py`) does not support the newest Python releases yet.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_chunking.py
```

Locally, each script finds `.env` directly in this folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The scripts take no command-line arguments. Every input lives in the **"Sample Inputs"** step near the top of each `.py` script: a default value plus commented-out samples. To see a different output, change the value or uncomment another line, then run again.

```python
question = "How long do I have to return something?"
# question = "How long does a refund take?"
```

In `01_chunking.py` you can also adjust `CHUNK_SIZE` and `CHUNK_OVERLAP` or switch `text` between `TEXT_RAG` and `TEXT_PARAGRAPHS`.

## 6. Scripts Overview

1. `01_chunking.py`: Text chunking using `RecursiveCharacterTextSplitter` with customizable chunk sizes and overlaps.
2. `02_embedding.py`: Local sentence embeddings (`all-MiniLM-L6-v2`) and cosine similarity using Sentence Transformers without external APIs.
3. `03_rag.py`: End-to-end Retrieval-Augmented Generation (RAG) pipeline combining chunking, local embeddings, Chroma similarity search, and an LLM.

