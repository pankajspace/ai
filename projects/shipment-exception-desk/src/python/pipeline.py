"""Triage pipeline for Northwind Logistics Shipment Exception Desk.

Coordinates:
1. LLM classification of incoming exception report
2. Rule-based compensation calculation
3. Tier-based escalation evaluation (lower threshold for premium clients, auto-escalation for unknown)
4. LLM drafting of internal manager briefing (if escalated) or customer email (if resolved)
5. Session logging for daily aggregation
"""

from typing import Dict, Any, List

try:
    from .chains import classify_chain, escalate_chain, draft_email_chain
    from .tools import (
        calculate_delay_compensation,
        calculate_damage_compensation,
        calculate_lost_compensation,
        calculate_unknown_compensation,
    )
    from .session import log_exception
except ImportError:
    from chains import classify_chain, escalate_chain, draft_email_chain
    from tools import (
        calculate_delay_compensation,
        calculate_damage_compensation,
        calculate_lost_compensation,
        calculate_unknown_compensation,
    )
    from session import log_exception

# Compensation escalation thresholds
# Premium customers receive manager intervention at a lower dollar threshold ($50 vs $100)
ESCALATION_THRESHOLDS = {
    "standard": 100.0,
    "premium": 50.0,
}


def evaluate_escalation(
    category: str,
    compensation_amount: float,
    customer_tier: str,
) -> tuple[bool, str]:
    """Evaluate whether an exception requires manager escalation.

    Rules:
    - Unknown or unclassifiable exceptions escalate automatically regardless of value.
    - Escalates if compensation exceeds tier threshold (Standard: $100, Premium: $50).
    """
    tier_normalized = customer_tier.strip().lower()
    threshold = ESCALATION_THRESHOLDS.get(tier_normalized, 100.0)

    if category == "unknown":
        return True, "Unclassifiable or garbled report requires manual operations review."

    if compensation_amount > threshold:
        return (
            True,
            f"Compensation amount (${compensation_amount:.2f}) exceeds {tier_normalized.capitalize()} tier threshold (${threshold:.2f}).",
        )

    return (
        False,
        f"Compensation (${compensation_amount:.2f}) is within {tier_normalized.capitalize()} tier auto-approval limit (${threshold:.2f}).",
    )


def process_exception(
    report_text: str,
    shipment_value: float,
    customer_tier: str = "standard",
    log_to_session: bool = True,
) -> Dict[str, Any]:
    """Process an incoming shipment exception report through the full triage pipeline."""
    steps: List[str] = []
    customer_tier = customer_tier.strip().lower()
    shipment_value = float(shipment_value)

    # 1. Classify Report
    category = classify_chain.invoke({"report_text": report_text})
    steps.append(f"Step 1 [Classify]: Report classified as '{category.upper()}' via LLM.")

    # 2. Route to Compensation Calculator
    if category == "delayed":
        comp_result = calculate_delay_compensation(shipment_value)
    elif category == "damaged":
        comp_result = calculate_damage_compensation(shipment_value)
    elif category == "lost":
        comp_result = calculate_lost_compensation(shipment_value)
    else:
        comp_result = calculate_unknown_compensation(shipment_value)

    comp_amount = float(comp_result.get("amount", 0.0))
    comp_reason = comp_result.get("reason", "")
    steps.append(
        f"Step 2 [Compensate]: Calculated compensation ${comp_amount:.2f} ({comp_reason})."
    )

    # 3. Escalation Decision
    escalated, escalation_reason = evaluate_escalation(
        category=category,
        compensation_amount=comp_amount,
        customer_tier=customer_tier,
    )
    action_taken = "Escalated to Manager" if escalated else "Auto-Resolved"
    steps.append(f"Step 3 [Escalation Check]: {action_taken} — {escalation_reason}")

    # 4. Draft Appropriate Message
    if escalated:
        draft = escalate_chain.invoke(
            {
                "customer_tier": customer_tier.capitalize(),
                "shipment_value": f"{shipment_value:.2f}",
                "category": category,
                "compensation_amount": f"{comp_amount:.2f}",
                "escalation_reason": escalation_reason,
                "report_text": report_text,
            }
        )
        steps.append("Step 4 [Draft]: Generated internal Manager Escalation Briefing.")
    else:
        draft = draft_email_chain.invoke(
            {
                "customer_tier": customer_tier.capitalize(),
                "shipment_value": f"{shipment_value:.2f}",
                "category": category,
                "compensation_amount": f"{comp_amount:.2f}",
                "compensation_reason": comp_reason,
                "report_text": report_text,
            }
        )
        steps.append("Step 4 [Draft]: Generated customer resolution & apology email.")

    result = {
        "report_text": report_text,
        "shipment_value": shipment_value,
        "customer_tier": customer_tier,
        "category": category,
        "compensation": comp_result,
        "compensation_amount": comp_amount,
        "escalated": escalated,
        "escalation_reason": escalation_reason,
        "action_taken": action_taken,
        "draft": draft,
        "steps": steps,
    }

    # 5. Log to session
    if log_to_session:
        log_exception(result)
        steps.append("Step 5 [Session]: Exception logged into daily triage ledger.")

    return result

