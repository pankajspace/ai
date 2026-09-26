"""Chain-of-Thought vs. Direct Answer: CoT as a reliability lever.

Adapted from ``study/09-ai-reliability/cot-vs-direct-answer.py``. One preset
multi-step reasoning problem runs N times under two prompts at temperature
0.7, and only the final line of each response is scored, so a CoT trace is
not credited for a candidate answer it raised and then rejected.
"""

import time

from config import CHAT_MODEL, bar, get_openai_client, parallel_map

RUNS_PER_STRATEGY = 5
TEMPERATURE = 0.7
TAIL_LINES = 1

STRATEGY_CHOICES = ("both", "direct", "cot")

PROBLEMS = {
    "grid": {
        "title": "Spatial Navigation (Grid)",
        "question": (
            "Start at origin (0,0) facing North (+Y direction). "
            "Move forward 3 units. Turn right 90 degrees. Move forward 2 units. "
            "Turn right 90 degrees. Move forward 5 units. "
            "Turn left 90 degrees. Move backward 2 units. "
            "What are your exact final (X,Y) coordinates? Format as (X, Y)."
        ),
        "correct_answers": ["(0, -2)", "(0,-2)"],
        "explanation": "N: (0,3) → E: (2,3) → S: (2,-2) → E, backwards 2: (0,-2).",
    },
    "family": {
        "title": "Relational Logic (Family Tree)",
        "question": (
            "Alice is the sister of Bob. Bob is the father of Charlie. "
            "Charlie is the brother of Diana. Diana is the mother of Eve. "
            "What is the exact biological relationship of Alice to Eve?"
        ),
        "correct_answers": ["great-aunt", "great aunt", "grand-aunt", "grand aunt"],
        "explanation": "Alice is Diana's aunt; Diana is Eve's mother, so Alice is Eve's great-aunt.",
    },
    "schedule": {
        "title": "Temporal Scheduling",
        "question": (
            "Five speakers (A, B, C, D, E) present one after another. "
            "E must speak exactly third. B must speak immediately after D. "
            "D cannot be the first speaker. C must speak at some point before A. "
            "What is the exact sequence of the 5 speakers from first to last? "
            "Format as a comma-separated list."
        ),
        "correct_answers": ["c, a, e, d, b", "c,a,e,d,b"],
        "explanation": "E is 3rd; the D-B block must be 4-5; C before A fills 1-2 → C, A, E, D, B.",
    },
    "inventory": {
        "title": "Inventory State Tracking",
        "question": (
            "An empty box is given to you. You put in an Apple, a Banana, and a Carrot. "
            "You remove the Apple and add a Date. You remove the Carrot and put the Apple back in. "
            "You swap the Banana for an Eggplant. Finally, you take out the Date. "
            "List exactly the items currently in the box."
        ),
        "correct_answers": ["apple, eggplant", "eggplant, apple", "apple and eggplant", "eggplant and apple"],
        "explanation": "[A,B,C] → [B,C,D] → [A,B,D] → [A,D,E] → [A,E].",
    },
    "boxes": {
        "title": "Logic Puzzle (Truth-Tellers)",
        "question": (
            "There are three boxes: X, Y, and Z. Exactly one contains a diamond. "
            "Box X says: 'The diamond is in Box Y.' "
            "Box Y says: 'The diamond is not in Box Y.' "
            "Box Z says: 'The diamond is not in Box X.' "
            "Exactly one box's statement is true. Which box contains the diamond? "
            "Answer with the exact phrase 'Box X', 'Box Y', or 'Box Z'."
        ),
        "correct_answers": ["box x"],
        "explanation": "Diamond in X: X false, Y true, Z false - exactly one true statement.",
    },
}


def direct_prompt(question: str) -> str:
    return f"{question}\n\nAnswer in one short sentence only. Do not show any working or reasoning."


def cot_prompt(question: str) -> str:
    return (
        f"{question}\n\n"
        "Think step by step. Show each step of your reasoning clearly, "
        "then state your final answer on the last line."
    )


def ask(prompt: str, temperature: float = TEMPERATURE) -> tuple[str, float]:
    """Return (response_text, elapsed_seconds); failures become 'Error: ...'."""
    start = time.perf_counter()
    try:
        response = get_openai_client().chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
        )
        text = (response.choices[0].message.content or "").strip()
    except Exception as e:
        text = f"Error: {e}"
    return text, time.perf_counter() - start


def is_correct(response: str, correct_answers: list[str]) -> bool:
    """Score only the final non-empty line(s) against the accepted answers."""
    if response.startswith("Error:"):
        return False
    lines = [ln for ln in response.splitlines() if ln.strip()]
    if not lines:
        return False
    tail = "\n".join(lines[-TAIL_LINES:]).lower()
    return any(ans.lower() in tail for ans in correct_answers)


def run_cot(problem_key: str, strategy: str = "both", temperature: float = TEMPERATURE) -> str:
    """Run Direct and/or CoT on one preset problem and return a text report."""
    problem = PROBLEMS[problem_key]
    strategies = [("direct", "Direct", direct_prompt), ("cot", "CoT   ", cot_prompt)]
    if strategy != "both":
        strategies = [s for s in strategies if s[0] == strategy]

    prompts = [fn(problem["question"]) for _, _, fn in strategies for _ in range(RUNS_PER_STRATEGY)]
    outputs = parallel_map(lambda p: ask(p, temperature), prompts)

    def last_line(text: str) -> str:
        lines = [ln for ln in text.splitlines() if ln.strip()]
        return (lines[-1] if lines else text)[:200]

    lines = [
        f"{problem['title']} · {RUNS_PER_STRATEGY} runs per strategy · {CHAT_MODEL} · temperature {temperature}",
        f"Correct answer: {problem['correct_answers'][0]}",
        f"Why: {problem['explanation']}",
        "",
    ]
    stats = {}
    for i, (key, label, _) in enumerate(strategies):
        runs = outputs[i * RUNS_PER_STRATEGY:(i + 1) * RUNS_PER_STRATEGY]
        ok = sum(is_correct(r, problem["correct_answers"]) for r, _ in runs)
        avg_t = sum(t for _, t in runs) / len(runs)
        stats[key] = (ok, avg_t)
        lines.append(f"{label}  {bar(ok, RUNS_PER_STRATEGY)} · avg {avg_t:.1f}s")
        lines.append(f"  sample final line: {last_line(runs[0][0])}")

    lines.append("")
    if len(stats) == 2:
        (d_ok, d_t), (c_ok, c_t) = stats["direct"], stats["cot"]
        lift = (c_ok - d_ok) / RUNS_PER_STRATEGY * 100
        latency = (c_t / d_t - 1) * 100 if d_t else 0
        lines.append(f"Trade-off: CoT bought {lift:+.0f}pp accuracy for {latency:+.0f}% latency.")
    else:
        lines.append("Tip: pick 'Both' to see the accuracy-for-latency trade-off.")
    return "\n".join(lines)


if __name__ == "__main__":
    for key in PROBLEMS:
        print(run_cot(key), end="\n\n")
