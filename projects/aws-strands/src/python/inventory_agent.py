"""Module 2 demo — a custom tool: an online-store inventory check.

When community tools don't fit (internal API, proprietary database) you write
your own. The mock dictionary stands in for a real database; the agent-facing
part — decorator, type hints, docstring — is identical either way.
"""

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from config import MODEL_ID, agent_text


@tool
def check_inventory(product_id: str) -> str:
    """Check if a product is in stock.

    Args:
        product_id: The product ID to check (e.g., "PROD-123")
    """
    # ① use mock stock data in place of a real inventory database
    # In production you'd query your real database here.
    inventory = {"PROD-123": 15, "PROD-456": 0, "PROD-789": 8}
    # ② look up the requested product and default missing items to zero
    quantity = inventory.get(product_id, 0)
    # ③ return the in-stock message with the available quantity
    if quantity > 0:
        return f"Product {product_id} is in stock. We have {quantity} units available."
    # ④ fall back to an out-of-stock message when nothing is available
    return f"Product {product_id} is currently out of stock."


def check(question: str) -> str:
    """Answer a stock question using the check_inventory custom tool."""
    # ① create an agent with the custom inventory tool attached
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[check_inventory],
        callback_handler=None,
    )
    # ② send the question so the agent can decide when to call the tool
    return agent_text(agent(question))
