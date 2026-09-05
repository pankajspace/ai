"""Compensation calculation tools for Northwind Logistics Shipment Exception Desk.

Each function calculates compensation based on policy rules and returns
a structured dictionary containing:
  - category: The exception category (delayed, damaged, lost, unknown)
  - amount: Calculated compensation dollar amount (float)
  - currency: "USD"
  - reason: Explanation of how the compensation was determined
"""

from typing import Dict, Any


def calculate_delay_compensation(
    shipment_value: float, days_delayed: int = 1
) -> Dict[str, Any]:
    """Calculate compensation for delayed shipments.

    Policy:
    - 20% of shipment value
    - Minimum courtesy credit of $15.00
    - Capped at 100% of shipment value
    """
    if shipment_value < 0:
        raise ValueError("Shipment value cannot be negative.")

    if shipment_value == 0:
        return {
            "category": "delayed",
            "amount": 0.0,
            "currency": "USD",
            "reason": "Shipment value is $0.00; no compensation issued.",
        }

    base_compensation = shipment_value * 0.20
    # Apply minimum courtesy credit, but never exceed shipment value
    compensation = max(base_compensation, 15.0)
    compensation = min(compensation, shipment_value)

    return {
        "category": "delayed",
        "amount": round(compensation, 2),
        "currency": "USD",
        "reason": (
            f"Delay compensation: 20% of ${shipment_value:.2f} "
            f"(with $15.00 minimum credit, capped at shipment value)"
        ),
    }


def calculate_damage_compensation(
    shipment_value: float, damage_severity: str = "partial"
) -> Dict[str, Any]:
    """Calculate compensation for damaged shipments.

    Policy:
    - Partial damage: 50% of shipment value
    - Total/severe damage: 100% of shipment value
    """
    if shipment_value < 0:
        raise ValueError("Shipment value cannot be negative.")

    severity = damage_severity.strip().lower()
    rate = 1.0 if severity in ("total", "severe", "complete") else 0.50
    compensation = shipment_value * rate

    return {
        "category": "damaged",
        "amount": round(compensation, 2),
        "currency": "USD",
        "reason": (
            f"Damage compensation: {int(rate * 100)}% of shipment value "
            f"(${shipment_value:.2f}) for {severity} damage"
        ),
    }


def calculate_lost_compensation(shipment_value: float) -> Dict[str, Any]:
    """Calculate compensation for lost in transit shipments.

    Policy:
    - 100% full replacement value of the shipment
    """
    if shipment_value < 0:
        raise ValueError("Shipment value cannot be negative.")

    return {
        "category": "lost",
        "amount": round(shipment_value, 2),
        "currency": "USD",
        "reason": f"Lost shipment compensation: 100% full replacement value of ${shipment_value:.2f}",
    }


def calculate_unknown_compensation(shipment_value: float) -> Dict[str, Any]:
    """Fallback compensation calculator for unclassified or garbled reports."""
    return {
        "category": "unknown",
        "amount": 0.0,
        "currency": "USD",
        "reason": "Unclassified exception: no automatic compensation calculated; routed for manual review",
    }

