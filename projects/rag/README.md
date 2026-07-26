# RAG Lab

A collection of Retrieval-Augmented Generation demos that show the core building blocks of RAG : **embeddings**, **chunking**, **vector stores**, **retrieval-augmented generation**, **reranking**, and **PDF text chat** — using **LangChain**, **Chroma**, **HuggingFace** sentence-transformers, and **OpenAI** (GPT-4o mini), served through a Flask web UI running in a Docker container.

This project mirrors the architecture of the AI Playground (basic) and LangChain Lab (langchain) projects: each feature lives in its own module (`embeddings.py`, `chunk.py`, `index.py`, `rag.py`, `rerank.py`, `pdf_chat.py`) and is exposed through a thin Flask endpoint. This makes it easy to add, remove, or modify individual features without touching unrelated code.

---

## Development and Deployment

### Prerequisites and First Run

Complete the one-time setup in [../SETUP.md](../SETUP.md), start Docker, and
verify the daemon with `docker info`. Then run from the repository root:

```bash
cd projects/rag
cp .env.example .env
# Add OPENAI_API_KEY to .env. Never commit this file.
docker compose build web
docker compose up web
```

Open http://localhost:8082. The first image build can take longer because it
downloads the local embedding and reranking dependencies. Source files under
`src/` are mounted into the container. Rebuild only after changing `Dockerfile`
or `requirements.txt`.

Run individual features from the command line when needed:

```bash
docker compose run --build --rm embeddings
docker compose run --build --rm chunk
docker compose run --build --rm index
docker compose run --build --rm rag
docker compose run --build --rm rerank
docker compose run --build --rm pdf-chat
```

Useful local commands:

```bash
docker compose logs -f web
docker compose run --rm web bash
docker compose ps
docker compose build web
docker compose down
```

On Linux, start Docker with `sudo systemctl start docker`. On macOS or Windows,
start Docker Desktop and wait until Docker reports that it is running.

### Commit and Automatic Deployment

Create a feature branch and commit only this project from the repository root:

```bash
git checkout main && git pull origin main
git checkout -b feat/rag-short-description
git add projects/rag/
git commit -m "feat(rag): short description"
git push -u origin feat/rag-short-description
```

Open a pull request and squash-merge it into `main`. Changes under
`projects/rag/**` trigger `.github/workflows/deploy-rag.yml`, which pushes the
image to `techtoday/rag` in ECR and restarts only the `rag` service on EC2. The
production Compose service maps EC2 host port `5002` to container port `5000`.

```bash
curl -I https://app.techtoday.click/rag/
```

### Production Troubleshooting

For a `502 Bad Gateway`, run on EC2:

```bash
docker compose -f ~/docker-compose.yml ps
docker compose -f ~/docker-compose.yml logs --tail=50 rag
grep -A12 "^  rag:" ~/docker-compose.yml
```

The service must use `command: python src/python/app.py`. After correcting the
production Compose file, validate and restart only this project:

```bash
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/docker-compose.yml up -d --no-deps rag
```

### Rollback

List previous tags locally, then connect to EC2 and promote the chosen tag:

```bash
aws ecr describe-images --repository-name techtoday/rag --region us-east-1 \
    --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table
ssh -i techtoday.pem ec2-user@44.193.134.238

ACCOUNT_ID=<your-aws-account-id>
ROLLBACK_TAG=<build-tag>
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker pull $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/rag:$ROLLBACK_TAG
docker tag $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/rag:$ROLLBACK_TAG \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/rag:latest
docker compose -f ~/docker-compose.yml up -d --no-deps rag
curl -I https://app.techtoday.click/rag/
```

The next successful deployment to `main` replaces the `latest` tag.

### Manual Deployment

Use this only when GitHub Actions is unavailable. Build and push locally:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
cd projects/rag
docker build --platform linux/amd64 -t techtoday/rag .
docker tag techtoday/rag:latest \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/rag:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/rag:latest
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2:

```bash
docker compose -f ~/docker-compose.yml pull rag
docker compose -f ~/docker-compose.yml up -d --no-deps rag
```

If the pull reports `no space left on device`, run `docker system df`, then
remove unused data with `docker container prune -f`, `docker builder prune -af`,
and `docker image prune -af` before retrying the two commands above.

---

## Features

### 🧠 Embeddings
Encodes two sentences into 384-dimensional vectors using the `all-MiniLM-L6-v2` sentence-transformer model, then computes their cosine similarity. Runs entirely locally — no API key needed. This is the foundation of semantic search: similar meanings → similar vectors → high cosine score.

### 📄 Chunking
Splits a long document into overlapping chunks using LangChain's `RecursiveCharacterTextSplitter`. Adjacent chunks share a configurable overlap ("context glue") so meaning at chunk boundaries is never lost. This is the preprocessing step that makes large documents searchable.

### 🗂️ Vector Indexing
Takes raw text documents, chunks them, embeds the chunks with a local sentence-transformer, and persists the vectors into a Chroma database on disk. This is step 1 of the RAG pipeline — building the knowledge base that retrieval will search.

### 🔍 RAG Q&A
Answers questions from a user-provided knowledge base. Enter your facts (one per line), then ask a question. The text is chunked, embedded into an in-memory Chroma vector store, and the top 3 most relevant chunks are injected into a prompt for GPT-4o mini — so the answer is grounded in your data, not a guess.

### 🔀 Reranking
Refines retrieval results with a cross-encoder (`cross-encoder/ms-marco-MiniLM-L6-v2`). Enter your knowledge base and a question — candidates are first retrieved with the fast bi-encoder, then reranked by the cross-encoder for higher accuracy. The trick: retrieve many cheap candidates, then rerank the top ones.

### 📄 PDF Text Chat
Paste up to 1000 characters copied from a PDF, and the system chunks the text, builds an in-memory vector index, and answers questions from that pasted content. This keeps the server from storing uploaded files while still showing the full RAG pipeline on real document text.

---

## Architecture

```
projects/rag/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service + one-off CLI services per feature
├── requirements.txt        # langchain, chroma, sentence-transformers, flask, ...
├── .env.example            # OPENAI_API_KEY placeholder
└── src/
    ├── python/
    │   ├── app.py          # Flask server: Blueprint + PATH_PREFIX routing
    │   ├── config.py       # loads .env; builds LangChain + embedding clients
    │   ├── embeddings.py   # cosine similarity between two texts
    │   ├── chunk.py        # text splitting with overlap
    │   ├── index.py        # build Chroma vector store from documents
    │   ├── rag.py          # retrieve + generate answer from vector store
    │   ├── rerank.py       # cross-encoder reranking of retrieval results
    │   └── pdf_chat.py     # pasted PDF text indexing and Q&A
    ├── index.html          # single-page UI (served by Flask)
    ├── css/style.css       # dark theme (shares TechToday design tokens)
    └── js/main.js          # front-end behavior, no frameworks
```

### Backend layout

1. `config.py` is the single place that knows about API keys and model names. Every other module calls `get_chat_model()` (LangChain `ChatOpenAI`) or `get_embedder()` (HuggingFace embeddings) instead of constructing a client itself.
2. `embeddings.py` demonstrates the embedding + cosine similarity foundation — no LLM or API key required.
3. `index.py` and `rag.py` form the two-step RAG pipeline: build an in-memory vector store from user-provided text, then query it with an LLM.
4. `rerank.py` shows how to improve retrieval accuracy with a cross-encoder as a second-stage ranker.
5. `pdf_chat.py` applies the full pipeline to pasted PDF text without storing uploaded files.
6. `app.py` attaches every route to a Blueprint and registers it once under a runtime `PATH_PREFIX`, so the same code runs at `/` locally and under `/rag/` in production.

All textarea-backed demos accept at most 1000 characters. The browser prevents longer input with `maxlength`, and Flask enforces the same limit for `/chunk`, `/rag`, `/rerank`, and `/pdf-index`.

### Path prefix routing

Because Nginx forwards the full path (e.g. `/rag/embeddings`) to the container, Flask mounts routes under a `PATH_PREFIX` env var via a Blueprint:

```python
# src/python/app.py (abbreviated)
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")  # /rag in prod, empty locally
app.register_blueprint(bp, url_prefix=PATH_PREFIX)
```

1. **Locally:** `PATH_PREFIX` unset → routes are `/`, `/embeddings`, `/chunk`, `/rag`, `/rerank`, `/pdf-index`, `/pdf-chat`.
2. **On EC2:** `PATH_PREFIX=/rag` → routes are `/rag/`, `/rag/embeddings`, `/rag/chunk`, `/rag/rag`, `/rag/rerank`, `/rag/pdf-index`, `/rag/pdf-chat`.

The served `index.html` also needs the prefix so its `fetch()` calls hit the right endpoint. The `index` route injects it by rewriting the page's `data-api-base=""` attribute with the current `PATH_PREFIX` value before returning the HTML.

---

## API Endpoints

1. `POST /embeddings` — body `{ "text_a": "<text>", "text_b": "<text>" }` → `{ "result": { "similarity": 0.87 } }`
2. `POST /chunk` — body `{ "text": "<long text>" }` → `{ "result": { "chunks": [...], "count": 3 } }`
3. `POST /rag` — body `{ "knowledge_base": "<text>", "question": "<text>" }` → `{ "result": "<answer>" }`
4. `POST /rerank` — body `{ "knowledge_base": "<text>", "question": "<text>" }` → `{ "result": { "results": ["...", ...] } }`
5. `POST /pdf-index` — body `{ "pdf_text": "<text copied from a PDF>" }` → `{ "result": "PDF text indexed..." }`
6. `POST /pdf-chat` — body `{ "question": "<text>" }` → `{ "result": "<answer>" }`

All endpoints return `{ "error": "<message>" }` with an HTTP 400 (missing input) or 500 (API error) on failure.

---

## Environment Variables

1. `OPENAI_API_KEY` — used by RAG Q&A and PDF Text Chat (GPT-4o mini). Get it from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. `PATH_PREFIX` — optional, set by the deployment environment (e.g. `"/rag"`). Controls the URL prefix the Flask Blueprint is mounted under. Leave it unset for local development.

Variables are loaded from `.env` at runtime via `python-dotenv`. See `.env.example` for the expected format.
