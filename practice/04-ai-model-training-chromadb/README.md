# AI Model Training, ChromaDB & Redis Practice

Sequential progression from single-container ML model training (`QuickBite ETA`), to multi-container RAG with a persistent ChromaDB server (`ScalerGPT`), to a stateful tool-calling agent backed by Redis session memory (`DeskBuddy`).

## 1. Set up API keys

All scripts in this folder share a single `.env` file and `requirements.txt`. All `.env` files are gitignored.

To set up your keys:

```bash
cp .env.example .env    # configure OPENAI_API_KEY (used in 02_chromadb.py and 03_redis.py)
```

Note: `01_model_training.py` trains a local scikit-learn `RandomForestRegressor` and requires no API key.

## 2. Run with Docker Compose (Recommended)

From the `practice/04-ai-model-training-chromadb` folder, you can run any exercise with one command:

```bash
# 1. Train RandomForest ETA model and run predictions
docker compose run --rm 01_model_training

# 2. Ingest markdown docs into ChromaDB container and answer RAG queries
docker compose run --rm 02_chromadb

# 3. Run multi-turn tool-calling agent with Redis session memory
docker compose run --rm 03_redis
```

Key features:
1. All services share the same Docker image (`practice-04-ai-model-training-chromadb`) built from the common `Dockerfile` and `requirements.txt`.
2. Automatically starts supporting backing containers (`chroma` for `02_chromadb` and `redis` for `03_redis`) over the Compose service network with persistent named volumes (`chroma_data` and `agent_memory`).
3. Automatically loads the shared `.env` file.
4. Mounts each `.py` script and `docs/` directory directly into `/app/` so code and note edits take effect immediately without rebuilding.
5. If you update `requirements.txt`, pass `--build` to rebuild:
   ```bash
   docker compose run --rm --build 01_model_training
   ```
6. To stop background `chroma` and `redis` containers when finished:
   ```bash
   docker compose down       # stop containers, keep volumes
   docker compose down -v    # stop containers and wipe volumes
   ```

## 3. Run with Docker directly (alternative)

From the `practice/04-ai-model-training-chromadb` folder:

```bash
docker build -t practice-04-ai-model-training-chromadb .
docker run --rm --env-file .env practice-04-ai-model-training-chromadb python 01_model_training.py
```

Note: When run without the Compose `chroma` or `redis` service containers, `02_chromadb.py` automatically falls back to an in-memory `chromadb.EphemeralClient()` and `03_redis.py` falls back to an in-memory session store.

## 4. Run locally (without Docker)

Use **Python 3.12**.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_model_training.py
```

Locally, each script finds `.env` directly in this folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The scripts take no command-line arguments. Every input lives in the **"Sample Inputs"** step near the top of each `.py` script: a default configuration plus commented-out alternatives. To try a different scenario, change the value or uncomment another option, then run again:

```python
question = "Why should I copy requirements.txt before the rest of my code?"
# question = "What is the difference between an image and a container?"
# question = "What happens to my data when I run docker compose down?"
```

In `01_model_training.py`, you can switch `orders_to_predict` to compare sunny vs. rainy weather or rider availability. In `02_chromadb.py`, you can also add your own `.md` or `.txt` files to `docs/`. In `03_redis.py`, you can switch `conversation_turns` across different multi-turn session scenarios.

## 6. Scripts Overview

1. `01_model_training.py`: Generates 5,000 rows of synthetic food-delivery data, trains a scikit-learn `RandomForestRegressor`, serializes `eta_model.pkl` with `joblib`, and predicts delivery ETA in minutes.
2. `02_chromadb.py`: Connects to ChromaDB (with startup retry logic), ingests markdown notes from `docs/` using `text-embedding-3-small`, and answers questions grounded strictly in retrieved passages via `gpt-4o-mini`.
3. `03_redis.py`: Multi-turn tool-calling agent (`calculator` and `get_datetime` tools) with a 5-lap safety fuse and per-session conversation memory persisted in Redis (`history:{session_id}`).
