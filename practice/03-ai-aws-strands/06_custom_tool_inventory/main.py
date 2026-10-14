"""Module 2 · Lesson 4 — Building a custom tool.

When community tools don't fit (internal API, proprietary database), you
write your own. Here: an online store checking stock.

The mock dictionary stands in for a real database. The agent-facing part —
decorator, type hints, docstring — is identical either way.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 06_custom_tool_inventory .
    docker run --rm --env-file .env 06_custom_tool_inventory
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - question to ask; uncomment another line to test different questions
question = "Is PROD-123 in stock?"
# question = "Do we have PROD-456 available in our inventory?"
# question = "Check inventory for PROD-789"
# question = "Can I order 5 units of PROD-123 right now?"
# question = "Is PROD-999 currently available?"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Custom tool definition
@tool
def check_inventory(product_id: str) -> str:
    """Check if a product is in stock.

    Args:
        product_id: The product ID to check (e.g., "PROD-123")
    """
    # In production you'd query your real database here.
    inventory = {
        "PROD-123": 15,
        "PROD-456": 0,
        "PROD-789": 8,
    }

    quantity = inventory.get(product_id, 0)

    if quantity > 0:
        return f"Product {product_id} is in stock. We have {quantity} units available."
    else:
        return f"Product {product_id} is currently out of stock."


# 5. Initialize agent and execute query
agent = Agent(model=BedrockModel(model_id=model_id), tools=[check_inventory])

print(f"Question: {question}\n" + "-" * 50)
response = agent(question)
print(response)
