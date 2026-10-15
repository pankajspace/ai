"""Module 2 · Lesson 4 — Building a Custom Domain Tool (Inventory Lookup).

Demonstrates building domain-specific custom tools for internal systems:
1. Simulates an internal proprietary inventory database using a product SKU catalog.
2. Exposes `check_inventory(product_id: str)` with strict type annotations and docstring.
3. Resolves natural language stock availability questions against the product catalog.

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

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Select a product availability question; uncomment another line to test different queries
question = "Is PROD-123 in stock?"
# question = "Do we have PROD-456 available in our inventory?"
# question = "Check inventory for PROD-789"
# question = "Can I order 5 units of PROD-123 right now?"
# question = "Is PROD-999 currently available?"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ---------------------------------------------------------------------------
# Tool Definitions
# ---------------------------------------------------------------------------
@tool
def check_inventory(product_id: str) -> str:
    """Check if a product is in stock.

    Args:
        product_id: The product ID to check (e.g., "PROD-123")
    """
    # ① Define the mock product inventory catalog (replace with a real DB query in production)
    inventory = {
        "PROD-123": 15,
        "PROD-456": 0,
        "PROD-789": 8,
    }

    # ② Look up the available unit count for the requested SKU
    quantity = inventory.get(product_id, 0)

    # ③ Return a human-readable stock status message
    if quantity > 0:
        return f"Product {product_id} is in stock. We have {quantity} units available."
    else:
        return f"Product {product_id} is currently out of stock."


# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the Strands Agent with BedrockModel and the custom check_inventory tool
agent = Agent(model=BedrockModel(model_id=model_id), tools=[check_inventory])

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Run the agent on the inventory question and print the response
print(f"Question: {question}\n" + "-" * 50)
response = agent(question)
print(response)
