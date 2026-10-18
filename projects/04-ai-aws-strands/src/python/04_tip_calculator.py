"""Tip Calculator Agent Service.

Demonstrates intent-driven tool invocation over keyword matching:
1. Agent understands natural language intent regardless of phrasing.
2. Extracts numeric parameters: bill amount, tip percentage, and number of people.
3. Invokes `calculate_tip(bill_amount, tip_percentage, num_people)`.
4. Returns computed totals and split amounts.
"""

import os

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class TipCalculatorRequest(BaseModel):
    """Input payload for Tip Calculator Agent."""

    query: str = "The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?"


class TipCalculatorResponse(BaseModel):
    """Output payload from Tip Calculator Agent."""

    query: str
    response: str
    tool_calls: list[str]


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool
def calculate_tip(bill_amount: float, tip_percentage: float, num_people: int = 1) -> dict:
    """Calculate tip and split the bill among people.

    Args:
        bill_amount: Total bill amount in dollars
        tip_percentage: Tip percentage (e.g., 15, 18, 20)
        num_people: Number of people splitting the bill (default: 1)
    """
    # Compute the tip amount, combined total, and per-person share
    tip = bill_amount * (tip_percentage / 100)
    total = bill_amount + tip
    per_person = total / num_people

    # Return a dictionary with rounded monetary values
    return {
        "bill": bill_amount,
        "tip": round(tip, 2),
        "total": round(total, 2),
        "per_person": round(per_person, 2),
    }


def run_tip_calculator_agent(
    query: str = "The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?",
) -> dict:
    """Run the Tip Calculator Agent."""
    # ③ Initialize the Strands Agent with BedrockModel and the calculate_tip tool
    agent = Agent(model=BedrockModel(model_id=model_id), tools=[calculate_tip])

    # ④ The agent extracts bill, tip % and group size from plain English and calls the tool
    response = agent(query)

    # ⑤ Collect every tool call (toolUse) from the message history
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {"query": query, "response": str(response), "tool_calls": tool_calls}
