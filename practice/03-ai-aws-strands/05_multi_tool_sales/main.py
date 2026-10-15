"""Module 2 · Lesson 3 — Multi-Tool Sales Pipeline Orchestration.

Demonstrates autonomous multi-tool planning and chained execution:
1. Registers three single-purpose tools without specifying an execution order:
   - `get_sales_data(quarter: str)`
   - `analyze_sales(revenue: int, deals: int, quarter: str)`
   - `send_email(to: str, subject: str, body: str)`
2. The agent autonomously plans the workflow: Fetch Data -> Compute Analysis -> Dispatch Email.
3. Passes the output of each tool directly as inputs into the next step of the agentic loop.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 05_multi_tool_sales .
    docker run --rm --env-file .env 05_multi_tool_sales
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Select a business workflow task; uncomment another line to test different requests
task = "Pull last quarter's sales data and email a summary to the team"
# task = "Fetch Q3 sales metrics, analyze deal performance, and email the results to leadership@company.com"
# task = "Get sales data for Q4 and send an email report to sales-team@company.com"
# task = "Retrieve sales numbers for Q2 and analyze key metrics without emailing"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ---------------------------------------------------------------------------
# Tool Definitions
# ---------------------------------------------------------------------------
@tool
def get_sales_data(quarter: str) -> dict:
    """Retrieve sales data for a specific quarter."""
    # ① Return mock quarterly revenue and closed deal count
    return {"revenue": 1250000, "deals": 47, "quarter": quarter}


@tool
def analyze_sales(revenue: int, deals: int, quarter: str) -> str:
    """Calculate key metrics from sales data."""
    # ① Compute average deal size and format the executive summary string
    avg_deal = revenue / deals
    return f"Q{quarter}: ${revenue:,} revenue, {deals} deals, ${avg_deal:,.0f} avg deal size"


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email message."""
    # ① Simulate dispatching the summary email to the target recipient
    return f"Email sent to {to}"


# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the Strands Agent with all three sales pipeline tools
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[get_sales_data, analyze_sales, send_email],
)

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Execute the multi-step task (get_sales_data -> analyze_sales -> send_email)
print(f"Task: {task}\n" + "-" * 50)
response = agent(task)
print(response)

# RULE OF THUMB: build focused, single-purpose tools.
# One mega-tool that does everything is harder to maintain, harder for the
# agent to reason about, and impossible to reuse elsewhere.
