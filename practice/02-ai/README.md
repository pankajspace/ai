# AI Practice Scripts

## 1. Set up API keys (once)

All scripts share one `.env` file in this folder. It is gitignored.

```bash
cp .env.example .env    # then fill in your keys
```

## 2. Run with Docker (recommended)

From inside a script's folder:

```bash
cd 01_chat_openai
docker build -t 01_chat_openai .
docker run --rm --env-file ../.env 01_chat_openai          # default input
docker run --rm --env-file ../.env 01_chat_openai Paris    # your own input
```

- Anything after the image name is passed to `main.py` as arguments.
- `04_langchain_memory_chat` is interactive, so add `-it`:
  `docker run --rm -it --env-file ../.env 04_langchain_memory_chat`
- `08_chunking` and `09_embedding` need no keys, so you can drop `--env-file`.
- `09_embedding` and `10_rag` images are bigger (~2-2.5 GB vs ~250-350 MB) because they include CPU-only
  PyTorch and the embedding model. The model is downloaded at build time, so runs start quickly.

## 3. Run locally (without Docker)

Use **Python 3.12**. PyTorch (used by 09 and 10) does not support the newest Python releases yet.

```bash
cd 01_chat_openai
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Locally, the scripts find `../.env` on their own (`find_dotenv()` searches parent folders).

## 4. Switching provider (06, 07)

Change `PROVIDER = "groq"` at the top of `main.py` to `"openai"` or `"gemini"`.
Then rebuild the image (`docker build ...`) so the container picks up the change.
