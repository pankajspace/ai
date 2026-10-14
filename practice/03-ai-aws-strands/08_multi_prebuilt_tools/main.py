"""Module 2 · Lesson 6 — Combining several pre-built tools.

Fetch data from the web, do maths on it, save a file — one request, three tools.

ABOUT BYPASS_TOOL_CONSENT:
Some tools are sensitive (they write files, touch cloud resources), so Strands
PAUSES and asks your permission before running them. Setting this to "true"
turns that prompt off so the script runs unattended.

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

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - multi-step task; uncomment another line to try a different task
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

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

# 4. Turn off interactive tool consent prompts for unattended execution
os.environ["BYPASS_TOOL_CONSENT"] = os.getenv("BYPASS_TOOL_CONSENT", "true")

# 5. Initialize agent with combined prebuilt tools
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[http_request, calculator, file_write],
    system_prompt="You help with data analysis tasks.",
)

print(f"Task: {task}\n" + "-" * 50)
response = agent(task)
print(response)
