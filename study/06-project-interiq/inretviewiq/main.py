"""Command-Line Interface (CLI) for InterviewIQ.

Allows running an interactive mock interview in the terminal, evaluating answers
with tools in real time, querying the coach with mid-session meta-questions,
and generating final aggregated performance reports.
"""

import sys
from agent import EvaluatorAgent, InterviewSessionMemory
from interview_bank import QUESTIONS, get_all_questions


def print_banner() -> None:
    print("=" * 75)
    print(" 🚀 InterviewIQ: AI-Powered Mock Interview Coach (CLI)")
    print("=" * 75)
    print("Commands:")
    print("  [Type answer] -> Submit answer for real-time tool evaluation & coaching")
    print("  'strong'      -> Use the question's sample strong answer")
    print("  'weak'        -> Use the question's sample weak answer")
    print("  'coach <q>'   -> Ask a mid-session meta-question (e.g. 'coach how am I doing?')")
    print("  'scorecard'   -> View current live session scorecard")
    print("  'report'      -> Generate final aggregated assessment report and finish")
    print("  'skip'        -> Skip to the next question")
    print("  'exit' / 'q'  -> Exit interview session")
    print("=" * 75 + "\n")


def display_turn_result(result: dict) -> None:
    turn = result["turn"]
    filler_res = result["filler_evaluation"]
    star_res = result["star_evaluation"]
    rel_res = result["relevance_evaluation"]

    print("\n" + "-" * 75)
    print(f"📊 EVALUATION RESULTS FOR QUESTION #{turn['turn_id']} ({turn['category']})")
    print("-" * 75)
    print(f"• Relevance Score: {rel_res.get('score', 0)}/100 ({rel_res.get('quality', '')})")
    print(f"  - Matched Concepts: {', '.join(rel_res.get('matched_keywords', [])) or 'None'}")
    if rel_res.get("unmatched_keywords"):
        print(f"  - Missing Concepts: {', '.join(rel_res.get('unmatched_keywords', [])[:4])}")

    print(f"\n• STAR Framework Score: {star_res.get('star_score', 0)}%")
    covered_str = ", ".join(star_res.get("covered_components", [])) or "None"
    missing_str = ", ".join(star_res.get("missing_components", [])) or "None"
    print(f"  - Covered: {covered_str} | Missing: {missing_str}")

    print(f"\n• Filler Words: {filler_res.get('total_filler_count', 0)} total")
    if filler_res.get("detected_fillers"):
        print(f"  - Detected: {filler_res.get('detected_fillers')}")

    print(f"\n💬 Coach Feedback:\n{result['feedback']}")
    print(f"\n📈 Current Session Average Relevance: {result['session_avg_relevance']}/100")
    print("-" * 75 + "\n")


def main() -> None:
    print_banner()
    memory = InterviewSessionMemory()
    agent = EvaluatorAgent(memory=memory)
    questions = get_all_questions()

    for idx, q_data in enumerate(questions, 1):
        print(f"\n[{idx}/{len(questions)}] Category: {q_data['category']}")
        print(f"Question: \"{q_data['question']}\"")
        print(f"Expected Core Concepts: {', '.join(q_data['expected_keywords'][:5])}...")

        while True:
            try:
                user_input = input("\nYour Answer (or command): ").strip()
            except (KeyboardInterrupt, EOFError):
                print("\n\nSession terminated by user.")
                return

            if not user_input:
                print("Please enter an answer or command.")
                continue

            cmd_lower = user_input.lower()

            if cmd_lower in ["exit", "q", "quit"]:
                print("\nExiting InterviewIQ. Generating summary before exit...")
                report = memory.generate_final_report()
                print("\n" + report["report_text"])
                return

            if cmd_lower == "skip":
                print("Skipped question.")
                break

            if cmd_lower == "scorecard":
                card = memory.get_scorecard()
                if not card:
                    print("No questions answered yet.")
                else:
                    print("\n--- Live Scorecard ---")
                    for row in card:
                        print(f"Turn {row['Turn']} | {row['Category']} | Rel: {row['Relevance Score']} | STAR: {row['STAR Score']} | Fillers: {row['Fillers']}")
                    print(f"Cumulative Average Relevance: {memory.get_average_relevance()}/100\n")
                continue

            if cmd_lower.startswith("coach") or cmd_lower.startswith("ask"):
                coach_query = user_input[5:].strip() if cmd_lower.startswith("coach") else user_input[3:].strip()
                if not coach_query:
                    coach_query = "How am I doing so far?"
                print(f"\n🤖 Asking Coach: \"{coach_query}\"")
                answer = agent.ask_agent(coach_query)
                print(f"\nCoach: {answer}\n")
                continue

            if cmd_lower == "report":
                report = memory.generate_final_report()
                print("\n" + report["report_text"])
                return

            # Determine answer text
            if cmd_lower == "strong":
                answer_text = q_data.get("sample_strong_answer", "")
                print(f"\nUsing Sample Strong Answer:\n\"{answer_text}\"")
            elif cmd_lower == "weak":
                answer_text = q_data.get("sample_weak_answer", "")
                print(f"\nUsing Sample Weak Answer:\n\"{answer_text}\"")
            else:
                answer_text = user_input

            # Evaluate answer
            result = agent.evaluate_answer(q_data, answer_text)
            display_turn_result(result)
            break

    # After answering all questions, generate final report
    print("\n" + "=" * 75)
    print("🏁 Interview Complete! Generating Final Aggregated Report...")
    print("=" * 75)
    report = memory.generate_final_report()
    print("\n" + report["report_text"])


if __name__ == "__main__":
    main()
