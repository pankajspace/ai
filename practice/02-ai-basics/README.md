# AI Basics Practice Scripts

## 1. Set up API keys

All scripts in this folder share a single `.env` file and `requirements.txt`. All `.env` files are gitignored.

To set up your keys:

```bash
cp .env.example .env    # then fill in your keys
```

## 2. Run with Docker Compose (easiest)

From the `practice/02-ai-basics` folder, you can run any script with one command:

```bash
docker compose run --rm 01_chat_openai
```

1. All services share the same Docker image (`practice-02-ai-basics`) built from the common `Dockerfile` and `requirements.txt`.
2. It automatically picks up the shared `.env` file.
3. It mounts the script (`01_chat_openai.py`, etc.) so changes to your code take effect immediately without rebuilding.
4. If you update `requirements.txt`, pass `--build` to rebuild:
   ```bash
   docker compose run --rm --build 01_chat_openai
   ```

## 3. Run with Docker directly (alternative)

From the `practice/02-ai-basics` folder:

```bash
docker build -t practice-02-ai-basics .
docker run --rm --env-file .env practice-02-ai-basics python 01_chat_openai.py
```

## 4. Run locally (without Docker)

Use **Python 3.12**.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_chat_openai.py
```

Locally, each script finds `.env` directly in this folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The scripts take no command-line arguments. Every input lives in the **"Sample Inputs"** step near the top of each `.py` script: a default value plus commented-out samples. To see a different output, change the value or uncomment another line, then run again.

```python
city = "Bangalore"
# city = "Paris"      <- uncomment this (and comment out the line above) to try Paris
```

In `06_langchain_one_tool.py` and `07_langchain_multi_tools.py` you can also switch the LLM: change `PROVIDER = "groq"` to `"openai"` or `"gemini"`.

## 6. Scripts Overview

1. `01_chat_openai.py`: Direct OpenAI chat completions call for a travel guide query.
2. `02_chat_groq.py`: Groq chat completions using open-weights models (e.g. Llama 3.3 70B) via OpenAI-compatible API.
3. `03_langchain_summarizer.py`: Basic LCEL chain (`prompt | model | parser`) summarizing documents into key points.
4. `04_langchain_memory_chat.py`: Stateful chat maintaining conversation history across turns.
5. `05_agent_one_tool.py`: Minimal agent implementation using raw OpenAI tool calling loop without any framework.
6. `06_langchain_one_tool.py`: LangChain agent using a single tool, with swappable model providers (Groq, OpenAI, Gemini).
7. `07_langchain_multi_tools.py`: LangChain agent coordinating multiple tools (weather, math, population) with an observable tool trace.
