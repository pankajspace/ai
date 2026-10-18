# 03-ai-model-training-chromadb · AI Model Training, ChromaDB & Redis

Machine learning lifecycle and containerized AI storage patterns: synthetic training and serializing a scikit-learn delivery regression model, ScalerGPT document RAG over markdown files with ChromaDB, and DeskBuddy tool-calling agent with Redis session memory.

## 1. Overview and Features

1. **QuickBite Delivery ETA**: Trains a `RandomForestRegressor` on synthetic delivery telemetry, persists it as `eta_model.pkl`, and serves low-latency inference.
2. **ScalerGPT ChromaDB RAG**: Ingests markdown notes from `docs/`, embeds with `text-embedding-3-small`, and performs grounded Q&A with `gpt-4o-mini`.
3. **DeskBuddy Redis Agent**: Multi-turn tool-calling agent with tools `calculator` and `get_datetime`, backed by Redis session storage (with graceful in-memory fallback).

## 2. Project Details

1. Project folder: `projects/03-ai-model-training-chromadb`
2. Local URL: `http://localhost:8083`
3. Production URL: `https://app.techtoday.click/03-ai-model-training-chromadb/`
4. Local published port: `8083`
5. Container port: `5000`
6. EC2 host port: `5003`
7. ECR repository: `techtoday/03-ai-model-training-chromadb`
8. Production service name: `03-ai-model-training-chromadb`
9. Production path prefix: `/03-ai-model-training-chromadb`
10. Deploy workflow: `.github/workflows/deploy-03-ai-model-training-chromadb.yml`
11. Trigger path: `projects/03-ai-model-training-chromadb/**`

## 3. Environment Variables

1. `OPENAI_API_KEY`: Required for ChromaDB embedding and synthesis.
2. `OPENAI_MODEL`: Optional. Default `gpt-4o-mini`.
3. `CHROMA_HOST`: Optional. Host for external ChromaDB server (uses in-memory EphemeralClient if empty).
4. `REDIS_HOST`: Optional. Host for Redis memory store (uses in-memory session dict if unreachable).

## 4. Local Development

1. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   # fill in your OPENAI_API_KEY
   ```
2. Build and run locally:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:8083`.

## 5. Deployment and Verification

1. Automatic deployment on push when files change under `projects/03-ai-model-training-chromadb/**`.
2. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/03-ai-model-training-chromadb/
   ```
3. Rollback: pull previous image tag from `techtoday/03-ai-model-training-chromadb` ECR repository on EC2.
