"""Unit tests for tools, session aggregation, and escalation logic."""

import unittest
import sys
from pathlib import Path

src_dir = Path(__file__).resolve().parent.parent / "src"
sys.path.insert(0, str(src_dir))

from tools import (
    calculate_delay_compensation,
    calculate_damage_compensation,
    calculate_lost_compensation,
    calculate_unknown_compensation,
)
from session import clear_session, log_exception, generate_daily_summary
from pipeline import evaluate_escalation


class TestTools(unittest.TestCase):
    def test_delay_compensation(self):
        # Value $50 -> 20% is $10 -> minimum courtesy $15 applied
        res = calculate_delay_compensation(50.0)
        self.assertEqual(res["category"], "delayed")
        self.assertEqual(res["amount"], 15.0)

        # Value $200 -> 20% is $40 (> $15)
        res2 = calculate_delay_compensation(200.0)
        self.assertEqual(res2["amount"], 40.0)

        # Value $10 -> 20% is $2, min 15 capped at shipment value 10
        res3 = calculate_delay_compensation(10.0)
        self.assertEqual(res3["amount"], 10.0)

    def test_damage_compensation(self):
        # Partial damage (50%)
        res = calculate_damage_compensation(60.0, "partial")
        self.assertEqual(res["category"], "damaged")
        self.assertEqual(res["amount"], 30.0)

        # Severe / total damage (100%)
        res2 = calculate_damage_compensation(60.0, "total")
        self.assertEqual(res2["amount"], 60.0)

    def test_lost_compensation(self):
        # 100% full replacement
        res = calculate_lost_compensation(500.0)
        self.assertEqual(res["category"], "lost")
        self.assertEqual(res["amount"], 500.0)

    def test_unknown_compensation(self):
        res = calculate_unknown_compensation(100.0)
        self.assertEqual(res["category"], "unknown")
        self.assertEqual(res["amount"], 0.0)


class TestEscalationEvaluation(unittest.TestCase):
    def test_unknown_auto_escalates(self):
        escalated, reason = evaluate_escalation("unknown", 0.0, "standard")
        self.assertTrue(escalated)

    def test_standard_tier_threshold(self):
        # Under $100 -> auto resolved
        esc1, _ = evaluate_escalation("delayed", 30.0, "standard")
        self.assertFalse(esc1)

        # Over $100 -> escalated
        esc2, _ = evaluate_escalation("lost", 150.0, "standard")
        self.assertTrue(esc2)

    def test_premium_tier_lower_threshold(self):
        # $60 is <= $100 (standard threshold) but > $50 (premium threshold)
        esc_std, _ = evaluate_escalation("damaged", 60.0, "standard")
        self.assertFalse(esc_std)

        esc_prem, _ = evaluate_escalation("damaged", 60.0, "premium")
        self.assertTrue(esc_prem)


class TestSessionAggregation(unittest.TestCase):
    def setUp(self):
        clear_session()

    def test_aggregation_and_costliest_category(self):
        # 3 delay claims of $20 each = $60 total
        for _ in range(3):
            log_exception({
                "category": "delayed",
                "compensation_amount": 20.0,
                "escalated": False,
            })

        # 1 damage claim of $50 = $50 total
        log_exception({
            "category": "damaged",
            "compensation_amount": 50.0,
            "escalated": False,
        })

        # 1 unknown report = $0, escalated
        log_exception({
            "category": "unknown",
            "compensation_amount": 0.0,
            "escalated": True,
        })

        summary = generate_daily_summary()
        self.assertEqual(summary["total_exceptions"], 5)
        self.assertEqual(summary["total_compensation"], 110.0)
        self.assertEqual(summary["escalated_count"], 1)
        self.assertEqual(summary["resolved_count"], 4)
        self.assertEqual(summary["escalation_rate"], 20.0)

        # Costliest category: multiple small delay payouts ($60) beat single large damage ($50)
        self.assertEqual(summary["costliest_category"], "delayed")
        self.assertEqual(summary["costliest_category_amount"], 60.0)


if __name__ == "__main__":
    unittest.main()

