from langchain_core.tools import tool
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import db_client


@tool
def lookup_inventory(sku_id: str) -> str:
    """
    Look up current inventory data for a given SKU ID from the database.

    Args:
        sku_id: The unique product identifier (e.g., 'SKU001').

    Returns:
        Inventory details as a formatted string, or a not-found message.
    """
    row = db_client.get_inventory(sku_id.upper())
    if not row:
        return f"No inventory record found for SKU '{sku_id}'."

    return (
        f"SKU: {row['sku_id']} | Name: {row['name']} | "
        f"Current Inventory: {row['current_inventory']} units | "
        f"Avg Demand: {row['avg_demand']} units/day | "
        f"Lead Time: {row['lead_time']} days | "
        f"Safety Stock: {row['safety_stock']} units"
    )
