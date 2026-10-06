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
        # ① create one shared product store for every stock tool
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
        # ① look up the product in the shared in-memory store
        product = self.products.get(product_id)
        # ② stop early if the requested product does not exist
        if not product:
            return f"Product {product_id} not found"
        # ③ return the current quantity and price for found products
        return f"{product['name']}: {product['quantity']} units at ${product['price']}"

    @tool
    def update_stock(self, product_id: str, quantity: int) -> str:
        """Update product stock quantity.

        Args:
            product_id: The product ID to update
            quantity: New quantity to set
        """
        # ① check whether this product exists before mutating the store
        if product_id in self.products:
            # ② save the new quantity in the shared store
            self.products[product_id]["quantity"] = quantity
            # ③ confirm the update so the agent can report success
            return f"Updated {product_id} to {quantity} units"
        # ④ explain that missing products cannot be updated
        return f"Product {product_id} not found"


# ① keep one tool instance so stock changes persist across requests
# One shared instance — state persists across web requests.
_inventory = InventoryTools()


def manage(question: str) -> str:
    """Answer a stock request with the class-based, stateful inventory tools."""
    # ① create an agent that can check and update the shared inventory
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[_inventory.check_stock, _inventory.update_stock],
        callback_handler=None,
    )
    # ② send the request and return the agent's final stock answer
    return agent_text(agent(question))
