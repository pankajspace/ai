"""Unit tests for tools.py evaluation functions."""

import unittest
from tools import check_star_structure, detect_filler_words, score_relevance


class TestInterviewTools(unittest.TestCase):

    def test_detect_filler_words_empty(self):
        res = detect_filler_words("")
        self.assertEqual(res["total_filler_count"], 0)
        self.assertFalse(res["has_fillers"])

    def test_detect_filler_words_multiple(self):
        text = "Um, basically I like was trying to, you know, fix the bug. Literally it was hard."
        res = detect_filler_words(text)
        self.assertTrue(res["has_fillers"])
        self.assertGreaterEqual(res["total_filler_count"], 4)
        self.assertIn("um", res["detected_fillers"])
        self.assertIn("basically", res["detected_fillers"])
        self.assertIn("you know", res["detected_fillers"])
        self.assertIn("literally", res["detected_fillers"])

    def test_detect_filler_words_no_false_positives(self):
        text = "The umbrella was brightly colored and meaningful."
        res = detect_filler_words(text)
        # Should not match 'um' in umbrella or 'right' in brightly or 'mean' in meaningful
        self.assertEqual(res["total_filler_count"], 0)

    def test_check_star_structure_complete(self):
        text = (
            "When I was at Acme Corp in my previous role, we faced a major outage. "
            "My task was to lead the incident recovery team. "
            "I decided to isolate the faulty microservice and rollback the release. "
            "As a result, we successfully restored service in 10 minutes and reduced downtime by 50%."
        )
        res = check_star_structure(text)
        self.assertTrue(res["situation"])
        self.assertTrue(res["task"])
        self.assertTrue(res["action"])
        self.assertTrue(res["result"])
        self.assertTrue(res["is_star_complete"])
        self.assertEqual(res["star_score"], 100.0)

    def test_check_star_structure_incomplete(self):
        text = "I wrote some python code to fix a bug."
        res = check_star_structure(text)
        self.assertFalse(res["is_star_complete"])
        self.assertIn("Situation", res["missing_components"])
        self.assertIn("Result", res["missing_components"])

    def test_score_relevance_high(self):
        keywords = ["kafka", "microservices", "api gateway", "resilience", "database"]
        answer = "We used Kafka for event streaming between microservices, routed via an API gateway with database per service for resilience."
        res = score_relevance(answer, keywords)
        self.assertGreaterEqual(res["score"], 80)
        self.assertEqual(len(res["matched_keywords"]), 5)

    def test_score_relevance_low(self):
        keywords = ["kafka", "microservices", "api gateway", "resilience", "database"]
        answer = "I like apples and bananas."
        res = score_relevance(answer, keywords)
        self.assertEqual(res["score"], 0)
        self.assertEqual(len(res["matched_keywords"]), 0)


if __name__ == "__main__":
    unittest.main()
