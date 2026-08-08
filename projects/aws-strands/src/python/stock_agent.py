"""Module 2 demo — class-based tools (the shared-resource pattern).

Grouping related tools in a class lets them share ONE resource (here, a single
``self.products`` store) instead of each tool opening its own. A module-level
instance keeps the state alive across requests, so an update made in one call
is visible to the next — check, update, then re-check and watch it persist.
"""

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from config import MODEL_ID, agent_text


class InventoryTools:
    def __init__(self):
        # Shared resource: all tools access the same data store.
        # In production: self.db = connect_to_database()   <-- opened ONCE
        self.products = {
            "PROD-123": {"name": "Wireless Mouse", "quantity": 15, "price": 29.99},
            "PROD-456": {"name": "USB-C Hub", "quantity": 0, "price": 49.99},
            "PROD-789": {"name": "Mechanical Keyboard", "quantity": 8, "price": 89.99},
        }

    @tool
    def check_stock(self, product_id: str) -> str:
        """Check product stock level.

        Args:
            product_id: The product ID to check
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


# One shared instance — state persists across web requests.
_inventory = InventoryTools()


def manage(question: str) -> str:
    """Answer a stock request with the class-based, stateful inventory tools."""
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[_inventory.check_stock, _inventory.update_stock],
        callback_handler=None,
    )
    return agent_text(agent(question))
