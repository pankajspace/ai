"""Module 2 · Lesson 2 — Intent-Driven Tool Invocation: Tip Calculator Agent.

Demonstrates intent-driven tool calling over brittle keyword or regex matching:
1. Understands natural language dining requests regardless of phrasing.
2. Automatically extracts numeric parameters (`bill_amount`, `tip_percentage`, `num_people`).
3. Invokes `calculate_tip(bill_amount, tip_percentage, num_people)` with default parameter support.
4. Returns rounded tip, total bill, and per-person split amounts.

Run locally (from this folder):
    pip install -r requirements.txt
    python 04_tip_calculator.py

Run with Docker Compose (from this folder):
    docker compose run --rm 04_tip_calculator
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
# ② Select a bill inquiry; uncomment another line to try a different scenario
query = "The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?"
# query = "What's a 15% tip on $42 for a solo diner?"
# query = "Bill is $120, we want to tip 18%, split between 3 people"
# query = "Calculate tip for $67.50 at 20% split among 2 people"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ---------------------------------------------------------------------------
# Tool Definitions
# ---------------------------------------------------------------------------
@tool
def calculate_tip(bill_amount: float, tip_percentage: float, num_people: int = 1) -> dict:
    """Calculate tip and split the bill among people.

    Args:
        bill_amount: Total bill amount in dollars
        tip_percentage: Tip percentage (e.g., 15, 18, 20)
        num_people: Number of people splitting the bill (default: 1)
    """
    # ① Compute the tip amount, combined total, and per-person share
    tip = bill_amount * (tip_percentage / 100)
    total = bill_amount + tip
    per_person = total / num_people

    # ② Return a dictionary with rounded monetary values
    return {
        "bill": bill_amount,
        "tip": round(tip, 2),
        "total": round(total, 2),
        "per_person": round(per_person, 2),
    }


# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the Strands Agent with BedrockModel and the calculate_tip tool
agent = Agent(model=BedrockModel(model_id=model_id), tools=[calculate_tip])

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Execute the query and print the extracted text response
print(f"Query: {query}\n" + "-" * 50)
response = agent(query)
if hasattr(response, "message") and isinstance(response.message, dict) and "content" in response.message:
    print(response.message["content"][0]["text"])
else:
    print(response)
