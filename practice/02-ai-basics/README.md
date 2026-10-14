# AI Practice Scripts

## 1. Set up API keys

Each project has its own separate `.env` file inside its directory. All `.env` files are gitignored.

To set up keys for a specific project:

```bash
cd 01_chat_openai
cp .env.example .env    # then fill in your keys
```

## 2. Run with Docker Compose (easiest)

From the `practice/02-ai-basics` root folder, you can run any script with one command:

```bash
docker compose run --rm 01_chat_openai
```

1. It automatically picks up the service's `.env` file.
2. It mounts `main.py` so changes to your code take effect immediately without rebuilding.
3. If you update `requirements.txt`, pass `--build` to rebuild:
   ```bash
   docker compose run --rm --build 01_chat_openai
   ```

## 3. Run with Docker directly (alternative)

From inside an individual script's folder:

```bash
cd 01_chat_openai
docker build -t 01_chat_openai .
docker run --rm --env-file .env 01_chat_openai
```

Notes:

1. `08_chunking` and `09_embedding` require no external API keys (their `.env` files can remain empty).
2. `09_embedding` and `10_rag` images are bigger (~2-2.5 GB vs ~250-350 MB) because they include CPU-only PyTorch and the embedding model. The model is downloaded at build time, so runs start quickly.

## 4. Run locally (without Docker)

Use **Python 3.12**. PyTorch (used by 09 and 10) does not support the newest Python releases yet.

```bash
cd 01_chat_openai
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Locally, each script finds `.env` directly in its own folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The scripts take no command-line arguments. Every input lives in the **"Inputs"** step near the top of `main.py`: a default value plus commented-out samples. To see a different output, change the value or uncomment another line, then run again.

```python
city = "Bangalore"
# city = "Paris"      <- uncomment this (and comment out the line above) to try Paris
```

In 06 and 07 you can also switch the LLM: change `PROVIDER = "groq"` to `"openai"` or `"gemini"`.
