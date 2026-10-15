"""Custom Inventory Tool Agent Service.

Demonstrates building domain-specific custom tools:
1. Simulates an internal proprietary system or inventory database.
2. Custom tool `check_inventory(product_id: str)` with strict typing & docstrings.
3. Natural language query resolution against mock product inventory.

Run directly:
    python projects/ai-pocs/server/services/16_custom_tool_inventory.py
"""

import os
from typing import List

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class CustomInventoryRequest(BaseModel):
    """Input payload for Custom Inventory Agent."""

    question: str = Field(
        default="Is PROD-123 in stock?",
        description="Natural language question about product availability",
    )


class CustomInventoryResponse(BaseModel):
    """Output payload from Custom Inventory Agent."""

    question: str
    response: str
    tool_calls: List[str]
    provider: str


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool
def check_inventory(product_id: str) -> str:
    """Check if a product is in stock.

    Args:
        product_id: The product ID to check (e.g., "PROD-123")
    """
    # Define the mock product inventory catalog (replace with a real DB query in production)
    inventory = {
        "PROD-123": 15,
        "PROD-456": 0,
        "PROD-789": 8,
    }

    # Look up the available unit count for the requested SKU
    quantity = inventory.get(product_id, 0)

    # Return a human-readable stock status message
    if quantity > 0:
        return f"Product {product_id} is in stock. We have {quantity} units available."
    else:
        return f"Product {product_id} is currently out of stock."


def run_custom_inventory_agent(question: str = "Is PROD-123 in stock?") -> dict:
    """Run the Custom Inventory Agent."""
    # ③ Initialize the Strands Agent with BedrockModel and the custom check_inventory tool
    agent = Agent(model=BedrockModel(model_id=model_id), tools=[check_inventory])

    # ④ Run the agent on the inventory question
    response = agent(question)

    # ⑤ Collect every tool call the agent made from its message history
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {
        "question": question,
        "response": str(response),
        "tool_calls": tool_calls,
        "provider": f"Strands + Bedrock ({model_id})",
    }


if __name__ == "__main__":
    res = run_custom_inventory_agent()
    print("Tool calls:", res["tool_calls"])
    print("Response:", res["response"])
