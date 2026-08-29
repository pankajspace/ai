"""Memory and Recency-Bias Verification Check for InterviewIQ.

Validates:
1. Multi-turn session memory accumulates answers, tool results, and scores.
2. The agent correctly aggregates session metrics (average score, weakest area).
3. Recency bias is strictly eliminated: the weakest area identified is the
   question with the lowest relevance score, NOT the most recent question asked.
"""

import sys
from agent import EvaluatorAgent, InterviewSessionMemory
from interview_bank import QUESTIONS


def run_memory_verification() -> bool:
    print("=" * 70)
    print("🧪 InterviewIQ Memory & Aggregation Verification Check")
    print("=" * 70)

    memory = InterviewSessionMemory()
    agent = EvaluatorAgent(memory=memory)

    # 1. Turn 1: Strong Answer on Question 1 (Behavioral)
    q1 = QUESTIONS[0]
    strong_ans_1 = q1["sample_strong_answer"]
    print(f"\n[Turn 1] Evaluating Question 1 ({q1['category']}) with STRONG answer...")
    res1 = agent.evaluate_answer(q1, strong_ans_1)
    score1 = res1["turn"]["relevance_score"]
    print(f" -> Turn 1 Relevance Score: {score1}/100 | STAR Score: {res1['turn']['star_score']}%")

    # 2. Turn 2: Deliberately WEAK Answer on Question 2 (Technical)
    q2 = QUESTIONS[1]
    weak_ans_2 = q2["sample_weak_answer"]
    print(f"\n[Turn 2] Evaluating Question 2 ({q2['category']}) with DELIBERATELY WEAK answer...")
    res2 = agent.evaluate_answer(q2, weak_ans_2)
    score2 = res2["turn"]["relevance_score"]
    print(f" -> Turn 2 Relevance Score: {score2}/100 | STAR Score: {res2['turn']['star_score']}%")

    # 3. Turn 3: Strong Answer on Question 3 (Problem-Solving) -> Tests Recency Bias!
    q3 = QUESTIONS[2]
    strong_ans_3 = q3["sample_strong_answer"]
    print(f"\n[Turn 3] Evaluating Question 3 ({q3['category']}) with STRONG answer...")
    res3 = agent.evaluate_answer(q3, strong_ans_3)
    score3 = res3["turn"]["relevance_score"]
    print(f" -> Turn 3 Relevance Score: {score3}/100 | STAR Score: {res3['turn']['star_score']}%")

    # Verification Step 1: Check Memory Accumulation
    print("\n" + "-" * 70)
    print("📋 Checking Memory State & Aggregations:")
    total_turns = memory.get_total_questions()
    avg_relevance = memory.get_average_relevance()
    weakest = memory.get_weakest_area()
    strongest = memory.get_strongest_area()

    expected_avg = round((score1 + score2 + score3) / 3, 1)

    print(f" - Total Turns in Memory: {total_turns} (Expected: 3)")
    print(f" - Average Relevance: {avg_relevance} (Expected: {expected_avg})")
    print(f" - Identified Weakest Area: Question #{weakest['turn_id']} - {weakest['category']} (Score: {weakest['relevance_score']})")
    print(f" - Identified Strongest Area: Question #{strongest['turn_id']} - {strongest['category']} (Score: {strongest['relevance_score']})")

    assert total_turns == 3, f"Memory failed: expected 3 turns, got {total_turns}"
    assert avg_relevance == expected_avg, f"Aggregation failed: expected avg {expected_avg}, got {avg_relevance}"

    # Verification Step 2: Ensure Weakest Area is Turn 2 (NOT Turn 3 / Recency bias)
    assert weakest["turn_id"] == 2, (
        f"Recency Bias / Memory Bug: Weakest turn identified as #{weakest['turn_id']} "
        f"instead of Turn #2 ({q2['category']})"
    )
    assert weakest["relevance_score"] == score2, "Weakest score mismatch"

    print("\n" + "-" * 70)
    print("🤖 Testing Mid-Session Meta-Question: 'What is my weakest area so far?'")
    meta_response = agent.ask_agent("What is my weakest area so far?")
    print(f"Coach Response:\n{meta_response}\n")

    # Verify that the response mentions the weak category or question 2
    weak_cat_lower = q2["category"].lower()
    resp_lower = meta_response.lower()

    if weak_cat_lower in resp_lower or "question #2" in resp_lower or "question 2" in resp_lower or str(score2) in resp_lower:
        print("✅ Meta-Question correctly identified the weak area (Question 2 / Technical)!")
    else:
        print("⚠️ Warning: Meta-question response did not explicitly mention Question 2 / category.")

    # Verification Step 3: Final Report Aggregation Check
    print("-" * 70)
    print("📊 Testing Final Report Generation...")
    report = memory.generate_final_report()
    assert report["total_questions"] == 3
    assert report["average_relevance"] == expected_avg
    assert report["weakest_area"]["turn_id"] == 2
    print("✅ Final Report generated successfully with full aggregation.")

    print("\n" + "=" * 70)
    print("🎉 ALL MEMORY & RECENCY-BIAS CHECKS PASSED SUCCESSFULLY!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    try:
        success = run_memory_verification()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ MEMORY CHECK FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
