"""Session tracking and daily aggregation for Northwind Logistics Shipment Exception Desk.

Aggregates session records to calculate:
- Total compensation paid across all processed exceptions
- Overall escalation rate
- Named costliest category by cumulative compensation paid
"""

from datetime import datetime
from typing import List, Dict, Any, Optional

# In-memory session ledger
_SESSION_RECORDS: List[Dict[str, Any]] = []


def log_exception(record: Dict[str, Any]) -> Dict[str, Any]:
    """Append an exception triage result to the daily session ledger."""
    entry = dict(record)
    if "timestamp" not in entry:
        entry["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    _SESSION_RECORDS.append(entry)
    return entry


def get_triage_log() -> List[Dict[str, Any]]:
    """Return all exception records logged during the current session."""
    return list(_SESSION_RECORDS)


def clear_session() -> None:
    """Clear the session ledger."""
    global _SESSION_RECORDS
    _SESSION_RECORDS.clear()


def generate_daily_summary() -> Dict[str, Any]:
    """Perform real aggregation on the session triage log.

    Calculates:
    - total_exceptions
    - total_compensation
    - escalation_rate
    - costliest_category (by total dollars, where multiple small payouts can beat a single large one)
    - detailed category breakdown
    - formatted markdown summary
    """
    total_exceptions = len(_SESSION_RECORDS)

    if total_exceptions == 0:
        return {
            "total_exceptions": 0,
            "total_compensation": 0.0,
            "escalated_count": 0,
            "resolved_count": 0,
            "escalation_rate": 0.0,
            "costliest_category": "None",
            "costliest_category_amount": 0.0,
            "category_breakdown": {},
            "markdown_summary": (
                "### Daily Triage Summary\n"
                "_No exception reports processed in this session yet._"
            ),
        }

    total_compensation = sum(
        float(r.get("compensation_amount", 0.0)) for r in _SESSION_RECORDS
    )
    escalated_count = sum(1 for r in _SESSION_RECORDS if r.get("escalated"))
    resolved_count = total_exceptions - escalated_count
    escalation_rate = (escalated_count / total_exceptions) * 100.0

    # Aggregate by category
    categories = ["delayed", "damaged", "lost", "unknown"]
    category_breakdown: Dict[str, Dict[str, Any]] = {}

    for cat in categories:
        cat_records = [r for r in _SESSION_RECORDS if r.get("category") == cat]
        count = len(cat_records)
        cat_total = sum(float(r.get("compensation_amount", 0.0)) for r in cat_records)
        escalated_cat = sum(1 for r in cat_records if r.get("escalated"))
        category_breakdown[cat] = {
            "count": count,
            "total_compensation": round(cat_total, 2),
            "escalated": escalated_cat,
        }

    # Determine costliest category by total compensation paid
    # Find category with highest cumulative payout; fallback to "None" if total is 0
    payout_per_category = {
        cat: category_breakdown[cat]["total_compensation"] for cat in categories
    }

    max_payout = max(payout_per_category.values())
    if max_payout > 0:
        costliest_category = max(
            payout_per_category, key=lambda k: payout_per_category[k]
        )
        costliest_amount = payout_per_category[costliest_category]
    else:
        # If no compensation paid anywhere, pick category with most claims or "None"
        costliest_category = "None"
        costliest_amount = 0.0

    # Build formatted Markdown summary
    summary_lines = [
        "### 📊 Northwind Logistics — Daily Triage Summary",
        f"- **Total Exceptions Processed**: {total_exceptions}",
        f"- **Total Compensation Paid**: ${total_compensation:,.2f}",
        f"- **Escalation Rate**: {escalation_rate:.1f}% ({escalated_count} escalated / {resolved_count} auto-resolved)",
        f"- **Costliest Category**: **{costliest_category.upper()}** (${costliest_amount:,.2f} total paid)",
        "",
        "#### Category Breakdown",
        "| Category | Total Claims | Total Compensation | Escalated | Payout Share |",
        "| :--- | :--- | :--- | :--- | :--- |",
    ]

    for cat in sorted(
        categories,
        key=lambda c: category_breakdown[c]["total_compensation"],
        reverse=True,
    ):
        data = category_breakdown[cat]
        share = (
            (data["total_compensation"] / total_compensation * 100.0)
            if total_compensation > 0
            else 0.0
        )
        summary_lines.append(
            f"| {cat.capitalize()} | {data['count']} | ${data['total_compensation']:,.2f} | {data['escalated']} | {share:.1f}% |"
        )

    markdown_summary = "\n".join(summary_lines)

    return {
        "total_exceptions": total_exceptions,
        "total_compensation": round(total_compensation, 2),
        "escalated_count": escalated_count,
        "resolved_count": resolved_count,
        "escalation_rate": round(escalation_rate, 2),
        "costliest_category": costliest_category,
        "costliest_category_amount": round(costliest_amount, 2),
        "category_breakdown": category_breakdown,
        "markdown_summary": markdown_summary,
    }

