"""Module 2 · Lesson 3 — When one tool isn't enough.

"Pull last quarter's sales data and email a summary to the team" is not one
task. It's three: query, analyse, send.

You give the agent three small tools. You NEVER tell it the order.
It works out: get data -> analyse it -> email the result. That's planning.

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

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - task description; uncomment another line to test different requests
task = "Pull last quarter's sales data and email a summary to the team"
# task = "Fetch Q3 sales metrics, analyze deal performance, and email the results to leadership@company.com"
# task = "Get sales data for Q4 and send an email report to sales-team@company.com"
# task = "Retrieve sales numbers for Q2 and analyze key metrics without emailing"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Multi-tool definitions
@tool
def get_sales_data(quarter: str) -> dict:
    """Retrieve sales data for a specific quarter."""
    return {"revenue": 1250000, "deals": 47, "quarter": quarter}


@tool
def analyze_sales(revenue: int, deals: int, quarter: str) -> str:
    """Calculate key metrics from sales data."""
    avg_deal = revenue / deals
    return f"Q{quarter}: ${revenue:,} revenue, {deals} deals, ${avg_deal:,.0f} avg deal size"


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email message."""
    return f"Email sent to {to}"


# 5. Initialize agent and execute multi-step task
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[get_sales_data, analyze_sales, send_email],
)

print(f"Task: {task}\n" + "-" * 50)
response = agent(task)
print(response)

# RULE OF THUMB: build focused, single-purpose tools.
# One mega-tool that does everything is harder to maintain, harder for the
# agent to reason about, and impossible to reuse elsewhere.
