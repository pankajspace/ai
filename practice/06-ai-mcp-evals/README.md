# AI MCP & Evals Practice

Sequential progression covering the Model Context Protocol (MCP) and agent evaluation suites.

## 1. Set up API keys

Projects 02 and 03 require a Groq API key (free from https://console.groq.com/keys).

```bash
cd 02_mcp_agent
cp .env.example .env    # configure GROQ_API_KEY
```

Note: `01_mcp_client` runs locally against the bundled FastMCP server and requires no API key.

## 2. Run with Docker Compose (Recommended)

From the `practice/06-ai-mcp-evals` root folder:

```bash
# 1. Test direct MCP plumbing
docker compose run --rm 01_mcp_client

# 2. Run the interactive MCP agent
docker compose run --rm 02_mcp_agent

# 3. Run the automated agent evaluation suite
docker compose run --rm 03_mcp_evals
```

Key features:
1. Automatically loads the appropriate `.env` file.
2. Mounts `main.py` and `cricket_server.py` directly so modifications take effect immediately without rebuilding the image.
3. Rebuild images with `--build` after changing dependencies:
   ```bash
   docker compose run --rm --build 02_mcp_agent
   ```

## 3. Run with Docker directly

From inside any project folder:

```bash
cd 01_mcp_client
docker build -t 01_mcp_client .
docker run --rm 01_mcp_client
```

## 4. Run locally (without Docker)

```bash
cd 02_mcp_agent
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Locally, each script finds `.env` directly in its own folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

Every input lives in step 2 (**"Inputs"**) near the top of `main.py`: a default configuration plus commented-out alternatives. To try a different input, change the value or uncomment another option, then run again:

```python
# Option 1: Live score query (default - triggers get_live_score)
default_question = "What is the score in India vs West Indies?"

# Option 2: Run requirement calculation (triggers get_live_score)
# default_question = "How many runs does West Indies need to win?"
```

In `01_mcp_client`, you can switch `tool_name` and `tool_args` (e.g. testing `get_player_stats` or simulated missing matches). In `02_mcp_agent`, you can also pass any custom question as a CLI argument (`python main.py "your question"` or `--no-tools`). In `03_mcp_evals`, you can select subsets of `TEST_CASES` to focus evaluations on live scores, player stats, or non-tool queries.

## 6. Directory Overview

1. `01_mcp_client`: Raw MCP protocol plumbing without an LLM. Directly connects to the FastMCP server via stdio, initializes handshake, lists tools, and calls a tool with arguments.
2. `02_mcp_agent`: LLM-enabled MCP agent using Groq/OpenAI compatible API. The LLM selects which MCP tools to invoke and formulates answers from tool results.
3. `03_mcp_evals`: Evaluation suite running unit-test style assertions on the MCP agent, validating tool choice correctness and expected answer facts.
