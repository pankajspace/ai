"""Multi-Agent InterviewIQ Orchestrator (Bonus Component).

Coordinates two specialized agents cooperating in a continuous interview loop:
1. Interviewer Agent: Selects next question based on candidate's performance history and category coverage.
2. Evaluator Agent: Executes evaluation tools, provides actionable coaching feedback, and updates session memory.
"""

from __future__ import annotations

import argparse
import sys
from agent import EvaluatorAgent, InterviewSessionMemory
from interviewer_agent import InterviewerAgent


def run_multi_agent_interview(test_mode: bool = False) -> bool:
    print("=" * 75)
    print("🤝 Multi-Agent InterviewIQ Orchestrator Loop")
    print("   Interviewer Agent ⇆ Candidate ⇆ Evaluator Agent")
    print("=" * 75 + "\n")

    memory = InterviewSessionMemory()
    evaluator = EvaluatorAgent(memory=memory)
    interviewer = InterviewerAgent(memory=memory)

    answered_ids: set[int] = set()
    turn_num = 1
    max_turns = 3 if test_mode else 5

    while turn_num <= max_turns:
        # Step 1: Interviewer Agent selects the next question
        question_data, interviewer_intro = interviewer.select_next_question(answered_ids)
        if not question_data:
            print("\n🎉 Interviewer Agent: All selected questions have been covered!")
            break

        answered_ids.add(question_data["id"])

        print(f"\n[Turn {turn_num}] 🎙️ Interviewer Agent:")
        print(f"  \"{interviewer_intro}\"")
        print(f"  Question: \"{question_data['question']}\"")
        print(f"  Category: {question_data['category']}")

        # Step 2: Candidate provides answer
        if test_mode:
            # Alternate strong, weak, strong answers in test mode
            if turn_num % 2 == 1:
                answer = question_data.get("sample_strong_answer", "")
                print(f"\nCandidate (Automated Strong Answer): \"{answer[:80]}...\"")
            else:
                answer = question_data.get("sample_weak_answer", "")
                print(f"\nCandidate (Automated Weak Answer): \"{answer[:80]}...\"")
        else:
            try:
                user_input = input("\nCandidate Answer (or 'coach <q>', 'strong', 'weak', 'exit'): ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\nSession ended by user.")
                break

            if user_input.lower() in ["exit", "q", "quit"]:
                break

            if user_input.lower().startswith("coach"):
                query = user_input[5:].strip() or "How am I doing so far?"
                print(f"\n🤖 Meta-Question to Coach: \"{query}\"")
                coach_ans = evaluator.ask_agent(query)
                print(f"Coach: {coach_ans}\n")
                continue

            if user_input.lower() == "strong":
                answer = question_data.get("sample_strong_answer", "")
            elif user_input.lower() == "weak":
                answer = question_data.get("sample_weak_answer", "")
            else:
                answer = user_input

        # Step 3: Evaluator Agent evaluates answer and updates session memory
        print("\n🔍 Evaluator Agent (Executing tools and logging memory)...")
        eval_result = evaluator.evaluate_answer(question_data, answer)
        rel_score = eval_result["turn"]["relevance_score"]
        star_score = eval_result["turn"]["star_score"]
        fillers = eval_result["turn"]["filler_count"]

        print(f"  ✓ Relevance: {rel_score}/100 | STAR: {star_score}% | Fillers: {fillers}")
        print(f"  ✓ Evaluator Feedback: {eval_result['feedback']}")
        print(f"  ✓ Cumulative Session Avg: {eval_result['session_avg_relevance']}/100")

        turn_num += 1

    # Step 4: Final Aggregated Report
    print("\n" + "=" * 75)
    print("🏆 Multi-Agent Interview Concluded: Final Aggregated Report")
    print("=" * 75)
    report = memory.generate_final_report()
    print("\n" + report["report_text"])

    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Multi-Agent InterviewIQ")
    parser.add_argument("--test-mode", action="store_true", help="Run automated test simulation")
    args = parser.parse_args()

    success = run_multi_agent_interview(test_mode=args.test_mode)
    sys.exit(0 if success else 1)
