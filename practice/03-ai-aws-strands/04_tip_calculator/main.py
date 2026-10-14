"""Module 2 · Lesson 2 — Your first tool-enabled agent: a tip calculator.

Shows that the agent understands INTENT, not keywords. All phrasings
work without any extra code — no regex, no intent classifier.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 04_tip_calculator .
    docker run --rm --env-file .env 04_tip_calculator
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - bill inquiry; uncomment another line to try a different scenario
query = "The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?"
# query = "What's a 15% tip on $42 for a solo diner?"
# query = "Bill is $120, we want to tip 18%, split between 3 people"
# query = "Calculate tip for $67.50 at 20% split among 2 people"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Tool definition
@tool
def calculate_tip(bill_amount: float, tip_percentage: float, num_people: int = 1) -> dict:
    """Calculate tip and split the bill among people.

    Args:
        bill_amount: Total bill amount in dollars
        tip_percentage: Tip percentage (e.g., 15, 18, 20)
        num_people: Number of people splitting the bill (default: 1)
    """
    tip = bill_amount * (tip_percentage / 100)
    total = bill_amount + tip
    per_person = total / num_people

    return {
        "bill": bill_amount,
        "tip": round(tip, 2),
        "total": round(total, 2),
        "per_person": round(per_person, 2),
    }


# 5. Initialize agent and execute query
agent = Agent(model=BedrockModel(model_id=model_id), tools=[calculate_tip])

print(f"Query: {query}\n" + "-" * 50)
response = agent(query)
if hasattr(response, "message") and isinstance(response.message, dict) and "content" in response.message:
    print(response.message["content"][0]["text"])
else:
    print(response)
