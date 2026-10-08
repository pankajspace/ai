"""run_multi_agent.py — Ask 4 (bonus): two agents, one orchestrator.

A small orchestrator loop that hands work between two specialised agents:

- ``InterviewerAgent.choose_next`` (interviewer_agent.py) decides WHICH
  category to ask next, based on the session so far.
- ``EvaluatorAgent.evaluate_answer`` (agent.py — the agent from Asks 1–3,
  completely unchanged) scores the answer and records it in session memory.

Both agents share one ``InterviewSessionMemory``: the Evaluator writes to it,
the Interviewer reads from it.

Usage (from ``src/python``, or ``docker compose run --rm web python
src/python/run_multi_agent.py``)::

    python run_multi_agent.py                 # type your own answers
    python run_multi_agent.py --auto mixed    # replay bank sample answers
    python run_multi_agent.py --turns 5 --auto weak
"""

import argparse

from agent import EvaluatorAgent, InterviewSessionMemory
from config import GROQ_API_KEY, OPENAI_API_KEY
from interviewer_agent import InterviewerAgent

NUM_TURNS = 3  # keep it short — this is a bonus demo, not the full bank


def pick_sample_answer(question: dict, mode: str, turn: int) -> str:
    """Return a bank sample answer for ``--auto`` mode."""
    # ① "mixed" alternates strong / weak so the Interviewer sees both cases
    if mode == "mixed":
        mode = "strong" if turn % 2 == 1 else "weak"
    return question[f"sample_{mode}_answer"]


def read_answer() -> str | None:
    """Prompt until a non-empty answer is typed; ``None`` on Ctrl-D."""
    while True:
        try:
            answer = input("Your answer: ").strip()
        except EOFError:
            return None
        if answer:
            return answer
        print("(Please type an answer, or press Ctrl-D to stop.)")


def main() -> None:
    parser = argparse.ArgumentParser(description="InterviewIQ two-agent mode")
    parser.add_argument("--turns", type=int, default=NUM_TURNS,
                        help=f"number of questions to ask (default {NUM_TURNS})")
    parser.add_argument("--auto", choices=["strong", "weak", "mixed"],
                        help="answer automatically with the bank's sample answers")
    args = parser.parse_args()

    # ① one shared memory: the Evaluator writes it, the Interviewer reads it
    memory = InterviewSessionMemory()
    evaluator = EvaluatorAgent(memory=memory)
    interviewer = InterviewerAgent()

    print("=== InterviewIQ — Two-Agent Mode (Interviewer + Evaluator) ===")
    if not (GROQ_API_KEY or OPENAI_API_KEY):
        print("(No API key found — both agents run in deterministic mode.)")
    print()

    for turn in range(1, args.turns + 1):
        # ② hand-off 1: the Interviewer decides what to ask next
        pick = interviewer.choose_next(memory)
        if pick is None:
            print("Every question in the bank has been answered — ending early.")
            break
        q = pick["question"]
        print(f"[Interviewer → {pick['category']} ({pick['source']})] {pick['reason']}")
        print(f"Q{turn}: {q['question']}")

        if args.auto:
            answer = pick_sample_answer(q, args.auto, turn)
            print(f"Your answer: {answer}")
        else:
            answer = read_answer()
            if answer is None:
                print("\nStopping early.")
                break

        # ③ hand-off 2: the Evaluator scores the answer and updates memory
        result = evaluator.evaluate_answer(q, answer)
        score = result["relevance_evaluation"].get("score", 0)
        print(f"\nCoach (relevance {score}/100): {result['feedback']}\n")
        print("-" * 60)

    # ④ the Evaluator's aggregated report covers every turn of the session
    print("\n=== Final Report ===")
    print(evaluator.generate_final_report())


if __name__ == "__main__":
    main()
