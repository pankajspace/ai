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

## 6. Directory Overview

1. `01_chat_openai`: Direct OpenAI chat completions call for a travel guide query.
2. `02_chat_groq`: Groq chat completions using open-weights models (e.g. Llama 3.3 70B) via OpenAI-compatible API.
3. `03_langchain_summarizer`: Basic LCEL chain (`prompt | model | parser`) summarizing documents into key points.
4. `04_langchain_memory_chat`: Stateful chat maintaining conversation history across turns.
5. `05_agent_one_tool`: Minimal agent implementation using raw OpenAI tool calling loop without any framework.
6. `06_langchain_one_tool`: LangChain agent using a single tool, with swappable model providers (Groq, OpenAI, Gemini).
7. `07_langchain_multi_tools`: LangChain agent coordinating multiple tools (weather, currency, search) with an observable tool trace.
8. `08_chunking`: Text chunking using `RecursiveCharacterTextSplitter` with customizable chunk sizes and overlaps.
9. `09_embedding`: Local sentence embeddings and cosine similarity using Sentence Transformers without external APIs.
10. `10_rag`: End-to-end Retrieval-Augmented Generation (RAG) pipeline combining chunking, embeddings, similarity search, and an LLM.

