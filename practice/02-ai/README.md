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
docker run --rm --env-file ../.env 01_chat_openai
```

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

## 4. Trying different inputs

The scripts take no command-line arguments. Every input lives in the **"Inputs"** step
near the top of `main.py`: a default value plus commented-out samples. To see a
different output, change the value or uncomment another line, then run again.

```python
city = "Bangalore"
# city = "Paris"      <- uncomment this (and comment out the line above) to try Paris
```

In 06 and 07 you can also switch the LLM: change `PROVIDER = "groq"` to `"openai"` or `"gemini"`.

With Docker, the script is copied in at build time, so after editing either rebuild
(`docker build ...`) or mount your edited file over it to skip the rebuild:

```bash
docker run --rm --env-file ../.env -v "$PWD/main.py:/app/main.py" 01_chat_openai
```
