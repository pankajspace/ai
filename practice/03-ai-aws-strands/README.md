# AWS Strands & Agent Workflows Practice

This directory contains standalone, single-file examples of building AI agents using AWS Bedrock, Strands (`strands-agents`), and LangGraph.

## 1. Set up AWS & Bedrock credentials

All scripts in this folder share a single `.env` file and `requirements.txt`. All `.env` files are gitignored.

To set up your keys:

```bash
cp .env.example .env    # then fill in your AWS credentials and region
```

Environment variables used:

1. `AWS_ACCESS_KEY_ID`: Your AWS access key.
2. `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
3. `AWS_SESSION_TOKEN`: Optional session token if using temporary STS credentials or SSO.
4. `AWS_DEFAULT_REGION`: AWS region where Bedrock foundation models are enabled (e.g. `us-east-1` or `us-west-2`).
5. `BEDROCK_MODEL_ID`: Foundation model ID on Bedrock (default: `amazon.nova-lite-v1:0`).
6. `BYPASS_TOOL_CONSENT`: Set to `true` to run sensitive tools unattended without interactive prompts (used in `08_multi_prebuilt_tools.py`).

## 2. Run with Docker Compose (easiest)

From the `practice/03-ai-aws-strands` folder, you can run any script with one command:

```bash
docker compose run --rm 01_hello_world_agent
```

1. All services share the same Docker image (`practice-03-ai-aws-strands`) built from the common `Dockerfile` and `requirements.txt`.
2. It automatically picks up the shared `.env` file.
3. It mounts the script (`01_hello_world_agent.py`, etc.) so changes to your code take effect immediately without rebuilding.
4. If you update `requirements.txt`, pass `--build` to rebuild:
   ```bash
   docker compose run --rm --build 01_hello_world_agent
   ```

## 3. Run with Docker directly (alternative)

From the `practice/03-ai-aws-strands` folder:

```bash
docker build -t practice-03-ai-aws-strands .
docker run --rm --env-file .env practice-03-ai-aws-strands python 01_hello_world_agent.py
```

## 4. Run locally (without Docker)

Use **Python 3.12**.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_hello_world_agent.py
```

Locally, each script finds `.env` directly in this folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The scripts take no command-line arguments. Every input lives in the **"Sample Inputs"** step near the top of each `.py` script: a default value plus commented-out samples. To see a different output, change the value or uncomment another line, then run again.

```python
prompt = "Hello! Tell me a fun fact about AI agents."
# prompt = "What are the key differences between an LLM and an AI agent?"
```

## 6. Scripts Overview

1. `01_hello_world_agent.py`: Simplest possible agent using Strands and Amazon Bedrock Nova Lite.
2. `02_hello_world_langgraph.py`: Minimal tool-enabled ReAct agent using LangGraph and Bedrock Converse.
3. `03_function_to_tool.py`: Converting a plain Python function into an agent tool with `@tool`, type hints, and docstrings.
4. `04_tip_calculator.py`: Tool-enabled agent demonstrating intent recognition over keyword matching.
5. `05_multi_tool_sales.py`: Multi-tool orchestration where the agent plans query -> analysis -> email steps.
6. `06_custom_tool_inventory.py`: Building custom domain-specific tools with mock data stores.
7. `07_prebuilt_tools.py`: Leveraging pre-built community tools (`strands_tools.calculator`) and setting system prompts.
8. `08_multi_prebuilt_tools.py`: Chaining multiple prebuilt tools (HTTP request, calculator, file writer) and handling unattended tool consent.
9. `09_use_aws.py`: Natural language AWS operations using the `use_aws` multi-service tool.
10. `10_class_based_tools.py`: Class-based tools sharing state and resources across calls.
11. `11_async_tools.py`: Parallel async tool execution for high throughput and reduced latency.
12. `12_travel_assistant.py`: Capstone travel assistant combining multi-step planning, weather forecasts, packing recommendations, budget estimation, and calculator tools.
