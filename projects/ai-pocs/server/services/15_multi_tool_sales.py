"""Multi-Tool Sales Pipeline Agent Service.

Demonstrates autonomous multi-tool planning and chained orchestration:
1. Three tools provided without explicit execution order:
   - `get_sales_data(quarter: str)`
   - `analyze_sales(revenue: int, deals: int, quarter: str)`
   - `send_email(to: str, subject: str, body: str)`
2. The agent plans the workflow: Fetch Data -> Compute Analysis -> Dispatch Email.
3. Passes the output of each tool directly as inputs into the next step of the agentic loop.

Run directly:
    python projects/ai-pocs/server/services/15_multi_tool_sales.py
"""

import os
from typing import List

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class MultiToolSalesRequest(BaseModel):
    """Input payload for Multi-Tool Sales Agent."""

    task: str = Field(
        default="Pull last quarter's sales data and email a summary to the team",
        description="Business workflow task requiring multi-tool orchestration",
    )


class MultiToolSalesResponse(BaseModel):
    """Output payload from Multi-Tool Sales Agent."""

    task: str
    response: str
    tool_sequence: List[str]
    provider: str


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool
def get_sales_data(quarter: str) -> dict:
    """Retrieve sales data for a specific quarter."""
    # Return mock quarterly revenue and closed deal count
    return {"revenue": 1250000, "deals": 47, "quarter": quarter}


@tool
def analyze_sales(revenue: int, deals: int, quarter: str) -> str:
    """Calculate key metrics from sales data."""
    # Compute average deal size and format the executive summary string
    avg_deal = revenue / deals
    return f"Q{quarter}: ${revenue:,} revenue, {deals} deals, ${avg_deal:,.0f} avg deal size"


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email message."""
    # Simulate dispatching the summary email to the target recipient
    return f"Email sent to {to}"


def run_multi_tool_sales_agent(
    task: str = "Pull last quarter's sales data and email a summary to the team",
) -> dict:
    """Run the Multi-Tool Sales Agent."""
    # ③ Initialize the Strands Agent with all three sales pipeline tools (no order given)
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[get_sales_data, analyze_sales, send_email],
    )

    # ④ Execute the multi-step task (get_sales_data -> analyze_sales -> send_email)
    response = agent(task)

    # ⑤ Collect the tool calls in the order the agent made them
    tool_sequence = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {
        "task": task,
        "response": str(response),
        "tool_sequence": tool_sequence,
        "provider": f"Strands Multi-Tool + Bedrock ({model_id})",
    }


# RULE OF THUMB: build focused, single-purpose tools.
# One mega-tool that does everything is harder to maintain, harder for the
# agent to reason about, and impossible to reuse elsewhere.

if __name__ == "__main__":
    res = run_multi_tool_sales_agent()
    print("Sequence:", res["tool_sequence"])
    print("Response:", res["response"])
