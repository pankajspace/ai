"""Module 2 · Lesson 6 — Chaining Multiple Pre-Built Tools (`http_request`, `calculator`, `file_write`).

Demonstrates combining multiple pre-built tools and configuring unattended tool consent:
1. Equips the agent with three community tools: `http_request`, `calculator`, and `file_write`.
2. Sets `BYPASS_TOOL_CONSENT="true"` so sensitive tools (`file_write`) run unattended without interactive prompts.
3. Executes a multi-step pipeline: Fetch external JSON data -> Calculate average -> Write summary file.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 08_multi_prebuilt_tools .
    docker run --rm --env-file .env 08_multi_prebuilt_tools
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator, file_write, http_request

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Define the multi-step data pipeline task; uncomment another block to try a different task
task = (
    "Fetch stock data from https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d, "
    "extract the latest closing prices, "
    "calculate the average price over the period, "
    "and save the results to stock_summary.txt"
)
# task = (
#     "Fetch crypto data from https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?interval=1d&range=3d, "
#     "compute the average closing price, and write a summary to btc_summary.txt"
# )
# task = (
#     "Query https://httpbin.org/json, extract the slideshow author, "
#     "and save it to author_info.txt"
# )

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

# ④ Disable interactive tool consent prompts so file_write runs unattended
os.environ["BYPASS_TOOL_CONSENT"] = os.getenv("BYPASS_TOOL_CONSENT", "true")

# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ⑤ Initialize the Strands Agent with http_request, calculator, and file_write
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[http_request, calculator, file_write],
    system_prompt="You help with data analysis tasks.",
)

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑥ Execute the multi-step pipeline: fetch HTTP data -> compute average -> save artifact file
print(f"Task: {task}\n" + "-" * 50)
response = agent(task)
print(response)
