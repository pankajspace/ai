"""Module 2 · Lesson 8 — Class-Based Tools (The Shared-Resource Pattern).

Demonstrates class-based tools that share state and connections across calls:
1. Architectural Problem: Standalone `@tool` functions opening separate DB connections per call can exhaust connection pools.
2. The Solution: Group related tools inside a class (`InventoryTools`) sharing a single resource (`self.products`) initialized once in `__init__`.
3. Bound Methods as Tools: Exposes `inventory.check_stock` and `inventory.update_stock` to the agent.
4. Persists state mutations across sequential tool invocations within the same session.

Run locally (from this folder):
    pip install -r requirements.txt
    python 10_class_based_tools.py

Run with Docker Compose (from this folder):
    docker compose run --rm 10_class_based_tools
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
# ② Define the sequence of inventory queries; uncomment another list to test different operations
queries = [
    "Check stock for PROD-123",
    "Update PROD-456 stock to 25 units, then confirm the new level",
]
# queries = [
#     "What is the price and quantity for PROD-789?",
#     "Update PROD-123 stock to 0 units and check its availability",
# ]
# queries = [
#     "Check stock for PROD-999",
# ]

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ---------------------------------------------------------------------------
# Tool Definitions (Class-Based Shared State)
# ---------------------------------------------------------------------------
class InventoryTools:
    """Grouped inventory tools sharing a single state."""

    def __init__(self):
        # ① Initialize the shared in-memory product store (represents a single DB connection pool)
        self.products = {
            "PROD-123": {"name": "Wireless Mouse", "quantity": 15, "price": 29.99},
            "PROD-456": {"name": "USB-C Cable",    "quantity": 0,  "price": 12.99},
            "PROD-789": {"name": "Laptop Stand",   "quantity": 8,  "price": 49.99},
        }

    @tool
    def check_stock(self, product_id: str) -> str:
        """Check the current stock level and price for a product.

        Args:
            product_id: The product ID to look up (e.g. 'PROD-123')
        """
        # ① Look up the product record in the shared self.products dictionary
        product = self.products.get(product_id)
        if not product:
            return f"Product {product_id} not found"
        return f"{product['name']}: {product['quantity']} units at ${product['price']}"

    @tool
    def update_stock(self, product_id: str, quantity: int) -> str:
        """Update product stock quantity.

        Args:
            product_id: The product ID to update
            quantity: New quantity to set
        """
        # ① Mutate the product quantity in the shared self.products store
        if product_id in self.products:
            self.products[product_id]["quantity"] = quantity
            return f"Updated {product_id} to {quantity} units"
        return f"Product {product_id} not found"


# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Instantiate InventoryTools once and bind its methods to the Strands Agent
inventory = InventoryTools()
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[inventory.check_stock, inventory.update_stock],
)

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Run each query against the shared InventoryTools instance so updates persist across turns
for q in queries:
    print(f"\nQuery: {q}\n" + "-" * 50)
    response = agent(q)
    print(response)
