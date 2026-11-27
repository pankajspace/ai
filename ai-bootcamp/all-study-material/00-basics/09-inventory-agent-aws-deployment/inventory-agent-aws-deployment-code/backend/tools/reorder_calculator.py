from langchain_core.tools import tool


@tool
def calculate_reorder(
    current_inventory: int,
    avg_demand: float,
    lead_time: int,
    safety_stock: int = 0,
) -> str:
    """
    Calculate whether a reorder is needed and how much to order.

    Args:
        current_inventory: Current units in stock.
        avg_demand: Average units consumed per day.
        lead_time: Days required to replenish stock.
        safety_stock: Optional buffer stock to maintain (default 0).

    Returns:
        A plain-text recommendation with reorder point and suggested quantity.
    """
    reorder_point = avg_demand * lead_time + safety_stock
    should_reorder = current_inventory <= reorder_point

    if should_reorder:
        # Order enough to cover lead-time demand + safety stock, minus what's on hand
        recommended_qty = max(0, int(reorder_point + (avg_demand * lead_time) - current_inventory))
        return (
            f"Reorder point: {reorder_point:.1f} units. "
            f"Current inventory ({current_inventory}) is AT OR BELOW the reorder point. "
            f"Recommended order quantity: {recommended_qty} units."
        )
    else:
        days_until_reorder = (current_inventory - reorder_point) / avg_demand if avg_demand > 0 else float("inf")
        return (
            f"Reorder point: {reorder_point:.1f} units. "
            f"Current inventory ({current_inventory}) is ABOVE the reorder point. "
            f"No immediate reorder needed. "
            f"Estimated {days_until_reorder:.1f} days until reorder point is reached."
        )
