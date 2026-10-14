"""Module 2 · Lesson 8 — Class-based tools (the shared-resource pattern).

THE PROBLEM:
Your DBA messages you: "Why is your agent opening 50 database connections
per minute?" Each @tool function opened its own connection. Five tools =
five connections per request. Multiply by concurrent users -> the DB drowns.

THE FIX:
Group related tools in a class. They share ONE connection (here, one dict)
via self, created once in __init__.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 10_class_based_tools .
    docker run --rm --env-file .env 10_class_based_tools
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - queries to execute; uncomment another list to test different operations
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

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Class-based tools sharing state
class InventoryTools:
    """Grouped inventory tools sharing a single state."""

    def __init__(self):
        # Shared state: in production this is a single DB connection or pool
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
        if product_id in self.products:
            self.products[product_id]["quantity"] = quantity
            return f"Updated {product_id} to {quantity} units"
        return f"Product {product_id} not found"


# 5. One instance, shared state, multiple tools
inventory = InventoryTools()
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[inventory.check_stock, inventory.update_stock],
)

for q in queries:
    print(f"\nQuery: {q}\n" + "-" * 50)
    response = agent(q)
    print(response)
