"""Test harness for Northwind Logistics Shipment Exception Desk.

Exercises the 4 required canned scenarios:
1. Mild delay -> category: delayed, escalated: False (Auto-Resolved)
2. High-value loss -> category: lost, escalated: True (Escalated to Manager)
3. Minor damage claim -> category: damaged, escalated: False (Auto-Resolved)
4. Garbled unclassifiable report -> category: unknown, escalated: True (Auto-Escalated)

Also validates session aggregation and costliest-category calculation.
"""

import sys
from pathlib import Path

# Ensure src directory is in python path
src_dir = Path(__file__).resolve().parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from pipeline import process_exception
from session import clear_session, generate_daily_summary, get_triage_log

# Canned test scenarios
SCENARIOS = [
    {
        "name": "Scenario 1: Mild delay",
        "report_text": (
            "My shipment was scheduled for delivery yesterday afternoon. "
            "Tracking now indicates a weather delay at the regional depot "
            "and delivery is rescheduled for tomorrow."
        ),
        "shipment_value": 50.00,
        "customer_tier": "standard",
        "expected_category": "delayed",
        "expected_escalated": False,
    },
    {
        "name": "Scenario 2: High-value loss",
        "report_text": (
            "Our pallet of high-end consumer electronics was marked delivered, "
            "but our warehouse never received it. The carrier has officially confirmed "
            "the cargo was lost in transit."
        ),
        "shipment_value": 500.00,
        "customer_tier": "standard",
        "expected_category": "lost",
        "expected_escalated": True,
    },
    {
        "name": "Scenario 3: Minor damage claim",
        "report_text": (
            "The parcel arrived on time, but the exterior box was crushed "
            "and one of the glass items inside is cracked."
        ),
        "shipment_value": 60.00,
        "customer_tier": "standard",
        "expected_category": "damaged",
        "expected_escalated": False,
    },
    {
        "name": "Scenario 4: Garbled unclassifiable report",
        "report_text": "asdf1234 !!@@##$$ order ?? xx zz 998234 lkjasdf",
        "shipment_value": 10.00,
        "customer_tier": "standard",
        "expected_category": "unknown",
        "expected_escalated": True,
    },
]


def run_checks() -> bool:
    print("=" * 70)
    print("NORTHWIND LOGISTICS — TRIAGE PIPELINE VERIFICATION")
    print("=" * 70)

    clear_session()
    all_passed = True

    for i, s in enumerate(SCENARIOS, 1):
        print(f"\n[{i}/4] Testing: {s['name']}")
        print(f"    Value: ${s['shipment_value']:.2f} | Tier: {s['customer_tier']}")
        print(f"    Report: \"{s['report_text'][:60]}...\"")

        res = process_exception(
            report_text=s["report_text"],
            shipment_value=s["shipment_value"],
            customer_tier=s["customer_tier"],
            log_to_session=True,
        )

        cat_match = res["category"] == s["expected_category"]
        esc_match = res["escalated"] == s["expected_escalated"]

        print(f"    Result Category  : {res['category']} (Expected: {s['expected_category']}) -> {'✓' if cat_match else '✗'}")
        print(f"    Result Escalated : {res['escalated']} (Expected: {s['expected_escalated']}) -> {'✓' if esc_match else '✗'}")
        print(f"    Compensation     : ${res['compensation_amount']:.2f}")
        print(f"    Action Taken     : {res['action_taken']}")
        print(f"    Draft Preview    :\n      {res['draft'].strip().splitlines()[0]}")

        if not (cat_match and esc_match):
            all_passed = False
            print("    >>> FAILED SCENARIO <<<")

    print("\n" + "=" * 70)
    print("VERIFYING DAILY SESSION AGGREGATION")
    print("=" * 70)

    summary = generate_daily_summary()
    total_exceptions = summary["total_exceptions"]
    total_comp = summary["total_compensation"]
    escalation_rate = summary["escalation_rate"]
    costliest_category = summary["costliest_category"]

    print(f"Total Exceptions Processed : {total_exceptions} (Expected: 4)")
    print(f"Total Compensation Paid    : ${total_comp:,.2f}")
    print(f"Escalation Rate            : {escalation_rate:.1f}% (Expected: 50.0%)")
    print(f"Costliest Category         : {costliest_category} (Expected: lost)")

    if total_exceptions != 4:
        all_passed = False
        print("✗ Session total exceptions mismatch!")
    if escalation_rate != 50.0:
        all_passed = False
        print("✗ Escalation rate mismatch!")
    if costliest_category != "lost":
        all_passed = False
        print("✗ Costliest category mismatch!")

    print("\n" + "=" * 70)
    if all_passed:
        print("🎉 ALL 4 SCENARIOS & SESSION AGGREGATIONS PASSED SUCCESSFULLY!")
        print("=" * 70)
        return True
    else:
        print("❌ SOME CHECKS FAILED. Please review the errors above.")
        print("=" * 70)
        return False


if __name__ == "__main__":
    success = run_checks()
    sys.exit(0 if success else 1)

