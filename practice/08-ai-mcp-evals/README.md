# AI MCP & Evals Practice

Sequential progression covering the Model Context Protocol (MCP) and agent evaluation suites.

## 1. Set up API keys

All scripts in this folder share a single `.env` file, `requirements.txt`, and `cricket_server.py`. Scripts `02_mcp_agent.py` and `03_mcp_evals.py` require a Groq API key (free from https://console.groq.com/keys).

```bash
cp .env.example .env    # configure GROQ_API_KEY
```

Note: `01_mcp_client.py` runs locally against the bundled FastMCP server (`cricket_server.py`) and requires no API key.

## 2. Run with Docker Compose (Recommended)

From the `practice/08-ai-mcp-evals` folder:

```bash
# 1. Test direct MCP plumbing
docker compose run --rm 01_mcp_client

# 2. Run the interactive MCP agent
docker compose run --rm 02_mcp_agent

# 3. Run the automated agent evaluation suite
docker compose run --rm 03_mcp_evals
```

Key features:
1. All services share the same Docker image (`practice-08-ai-mcp-evals`) built from the common `Dockerfile` and `requirements.txt`.
2. Automatically loads the shared `.env` file.
3. Mounts each `.py` script and `cricket_server.py` directly so modifications take effect immediately without rebuilding the image.
4. Rebuild the image with `--build` after changing dependencies:
   ```bash
   docker compose run --rm --build 02_mcp_agent
   ```

## 3. Run with Docker directly

From the `practice/08-ai-mcp-evals` folder:

```bash
docker build -t practice-08-ai-mcp-evals .
docker run --rm --env-file .env practice-08-ai-mcp-evals python 01_mcp_client.py
```

## 4. Run locally (without Docker)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 02_mcp_agent.py
```

Locally, each script finds `.env` directly in this folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

Every input lives in step 2 (**"Sample Inputs"**) near the top of each `.py` script: a default configuration plus commented-out alternatives. To try a different input, change the value or uncomment another option, then run again:

```python
# Option 1: Live score query (default - triggers get_live_score)
default_question = "What is the score in India vs West Indies?"

# Option 2: Run requirement calculation (triggers get_live_score)
# default_question = "How many runs does West Indies need to win?"
```

In `01_mcp_client.py`, you can switch `tool_name` and `tool_args` (e.g. testing `get_player_stats` or simulated missing matches). In `02_mcp_agent.py`, you can also pass any custom question as a CLI argument (`python 02_mcp_agent.py "your question"` or `--no-tools`). In `03_mcp_evals.py`, you can select subsets of `TEST_CASES` to focus evaluations on live scores, player stats, or non-tool queries.

## 6. Scripts Overview

1. `cricket_server.py`: Shared FastMCP server exposing `get_live_score` and `get_player_stats` tools over stdio.
2. `01_mcp_client.py`: Raw MCP protocol plumbing without an LLM. Directly connects to the FastMCP server via stdio, initializes handshake, lists tools, and calls a tool with arguments.
3. `02_mcp_agent.py`: LLM-enabled MCP agent using Groq/OpenAI compatible API. The LLM selects which MCP tools to invoke and formulates answers from tool results.
4. `03_mcp_evals.py`: Evaluation suite running unit-test style assertions on the MCP agent, validating tool choice correctness and expected answer facts.
