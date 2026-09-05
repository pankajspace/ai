"""Command-line interface runner for Northwind Logistics Shipment Exception Desk.

Allows quick terminal testing of single exception reports or running demo presets.
"""

import sys
import argparse
from pathlib import Path

src_dir = Path(__file__).resolve().parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from pipeline import process_exception
from session import generate_daily_summary, get_triage_log


def print_result(res: dict) -> None:
    print("\n" + "=" * 65)
    print("NORTHWIND LOGISTICS — EXCEPTION TRIAGE RESULT")
    print("=" * 65)
    print(f"Report Snippet     : {res['report_text'][:80]}...")
    print(f"Shipment Value     : ${res['shipment_value']:.2f}")
    print(f"Customer Tier      : {res['customer_tier'].capitalize()}")
    print("-" * 65)
    print(f"Classified Category: {res['category'].upper()}")
    print(f"Compensation Amount: ${res['compensation_amount']:.2f}")
    print(f"Compensation Reason: {res['compensation'].get('reason', 'N/A')}")
    print(f"Escalation Status  : {'[ESCALATED]' if res['escalated'] else '[AUTO-RESOLVED]'}")
    print(f"Escalation Details : {res['escalation_reason']}")
    print("-" * 65)
    print("Decision Trail:")
    for step in res["steps"]:
        print(f"  • {step}")
    print("-" * 65)
    action_label = (
        "INTERNAL MANAGER ESCALATION BRIEFING"
        if res["escalated"]
        else "CUSTOMER RESOLUTION EMAIL DRAFT"
    )
    print(f"Generated Draft ({action_label}):\n")
    print(res["draft"])
    print("=" * 65 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Northwind Logistics Shipment Exception Desk CLI"
    )
    parser.add_argument(
        "--report",
        type=str,
        help="Exception report text submitted by customer",
    )
    parser.add_argument(
        "--value",
        type=float,
        default=100.0,
        help="Shipment monetary value in USD (default: 100.0)",
    )
    parser.add_argument(
        "--tier",
        type=str,
        choices=["standard", "premium"],
        default="standard",
        help="Customer account tier (standard or premium, default: standard)",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run a standard delay demo scenario",
    )

    args = parser.parse_args()

    if args.report:
        report_text = args.report
        value = args.value
        tier = args.tier
    elif args.demo or len(sys.argv) == 1:
        # Default demo
        print("Running demo exception report...")
        report_text = (
            "Hi, my package was supposed to arrive 3 days ago. "
            "Tracking has been stuck on 'In Transit - Weather Delay' with no updates."
        )
        value = 120.0
        tier = "standard"
    else:
        report_text = input("Enter shipment exception report: ").strip()
        val_input = input("Enter shipment value in USD (default 100): ").strip()
        value = float(val_input) if val_input else 100.0
        tier_input = input("Enter customer tier (standard/premium, default standard): ").strip()
        tier = tier_input.lower() if tier_input in ["standard", "premium"] else "standard"

    res = process_exception(
        report_text=report_text,
        shipment_value=value,
        customer_tier=tier,
        log_to_session=True,
    )
    print_result(res)


if __name__ == "__main__":
    main()

