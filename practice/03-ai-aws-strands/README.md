# AWS Strands & Agent Workflows Practice

This directory contains standalone, practical examples of building AI agents using AWS Bedrock, Strands (`strands-agents`), and LangGraph.

## 1. Set up AWS & Bedrock credentials

Each project has its own separate `.env` file inside its directory. All `.env` files are gitignored.

To set up keys for a specific project:

```bash
cd 01_hello_world_agent
cp .env.example .env    # then fill in your AWS credentials and region
```

Environment variables used:

1. `AWS_ACCESS_KEY_ID`: Your AWS access key.
2. `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
3. `AWS_SESSION_TOKEN`: Optional session token if using temporary STS credentials or SSO.
4. `AWS_DEFAULT_REGION`: AWS region where Bedrock foundation models are enabled (e.g. `us-east-1` or `us-west-2`).
5. `BEDROCK_MODEL_ID`: Foundation model ID on Bedrock (default: `amazon.nova-lite-v1:0`).

## 2. Run with Docker Compose (easiest)

From the `practice/03-ai-aws-strands` root folder, you can run any script with one command:

```bash
docker compose run --rm 01_hello_world_agent
```

1. It automatically picks up the service's `.env` file.
2. It mounts `main.py` so changes to your code take effect immediately without rebuilding.
3. If you update `requirements.txt`, pass `--build` to rebuild:
   ```bash
   docker compose run --rm --build 01_hello_world_agent
   ```

## 3. Run with Docker directly (alternative)

From inside an individual script's folder:

```bash
cd 01_hello_world_agent
docker build -t 01_hello_world_agent .
docker run --rm --env-file .env 01_hello_world_agent
```

## 4. Run locally (without Docker)

Use **Python 3.12**.

```bash
cd 01_hello_world_agent
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Locally, each script finds `.env` directly in its own folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The scripts take no command-line arguments. Every input lives in the **"Inputs"** step near the top of `main.py`: a default value plus commented-out samples. To see a different output, change the value or uncomment another line, then run again.

```python
prompt = "Hello! Tell me a fun fact about AI agents."
# prompt = "What are the key differences between an LLM and an AI agent?"
```

## 6. Directory Overview

1. `01_hello_world_agent`: Simplest possible agent using Strands and Amazon Bedrock Nova Lite.
2. `02_hello_world_langgraph`: Minimal tool-enabled ReAct agent using LangGraph and Bedrock Converse.
3. `03_function_to_tool`: Converting a plain Python function into an agent tool with `@tool`, type hints, and docstrings.
4. `04_tip_calculator`: Tool-enabled agent demonstrating intent recognition over keyword matching.
5. `05_multi_tool_sales`: Multi-tool orchestration where the agent plans query -> analysis -> email steps.
6. `06_custom_tool_inventory`: Building custom domain-specific tools with mock data stores.
7. `07_prebuilt_tools`: Leveraging pre-built community tools (`strands_tools.calculator`) and setting system prompts.
8. `08_multi_prebuilt_tools`: Chaining multiple prebuilt tools (HTTP request, calculator, file writer) and handling unattended tool consent.
9. `09_use_aws`: Natural language AWS operations using the `use_aws` multi-service tool.
10. `10_class_based_tools`: Class-based tools sharing state and resources across calls.
11. `11_async_tools`: Parallel async tool execution for high throughput and reduced latency.
12. `12_travel_assistant`: Capstone travel assistant combining multi-step planning, weather forecasts, packing recommendations, budget estimation, and calculator tools.

