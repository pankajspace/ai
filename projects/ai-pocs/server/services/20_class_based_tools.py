"""Class-Based Tools (Shared-Resource Pattern) Agent Service.

Demonstrates class-based tools that share state and resources across calls:
1. Architectural Problem: Individual tool functions opening separate DB connections flood databases.
2. The Solution: Group related tools in a class instance sharing single state/connection pool.
3. Class `InventoryTools`:
   - `check_stock(product_id: str)`
   - `update_stock(product_id: str, quantity: int)`
4. Handles multi-step state mutations within a single conversation session.

Run directly:
    python projects/ai-pocs/server/services/20_class_based_tools.py
"""

import os
from typing import Dict, List

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class ClassBasedToolsRequest(BaseModel):
    """Input payload for Class-Based Tools Agent."""

    query: str = Field(
        default="Update PROD-456 stock to 25 units, then confirm the new level",
        description="Query requesting inventory check or state modification",
    )


class ClassBasedToolsResponse(BaseModel):
    """Output payload from Class-Based Tools Agent."""

    query: str
    response: str
    tool_calls: List[str]
    current_inventory: Dict[str, int]
    provider: str


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


class InventoryTools:
    """Grouped inventory tools sharing a single state."""

    def __init__(self):
        # Initialize the shared in-memory product store (represents a single DB connection pool)
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
        # Look up the product record in the shared self.products dictionary
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
        # Mutate the product quantity in the shared self.products store
        if product_id in self.products:
            self.products[product_id]["quantity"] = quantity
            return f"Updated {product_id} to {quantity} units"
        return f"Product {product_id} not found"


# ③ Instantiate InventoryTools once so stock updates persist across requests
inventory = InventoryTools()


def run_class_based_tools_agent(
    query: str = "Update PROD-456 stock to 25 units, then confirm the new level",
) -> dict:
    """Run the Class-Based Tools Agent."""
    # ④ Bind the shared instance's methods to the Strands Agent
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[inventory.check_stock, inventory.update_stock],
    )

    # ⑤ Run the query against the shared InventoryTools instance
    response = agent(query)

    # ⑥ Collect every tool call the agent made from its message history
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {
        "query": query,
        "response": str(response),
        "tool_calls": tool_calls,
        "current_inventory": {pid: p["quantity"] for pid, p in inventory.products.items()},
        "provider": f"Strands Class-Based + Bedrock ({model_id})",
    }


if __name__ == "__main__":
    for q in ["Check stock for PROD-123", "Update PROD-456 stock to 25 units, then confirm the new level"]:
        out = run_class_based_tools_agent(q)
        print("Calls:", out["tool_calls"])
        print("Inventory:", out["current_inventory"])
        print("Response:", out["response"])
