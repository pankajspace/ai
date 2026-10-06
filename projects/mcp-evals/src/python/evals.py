"""Step 3 — a tiny eval suite for the cricket agent.

Same idea as unit tests: a list of cases + checks + a pass rate. Each case
checks two things: did the agent pick the expected tool (or no tool), and does
the final answer contain the key fact? Adapted from ``step3_evals.py``.
"""

import sys

from agent import run_agent_sync
from config import parallel_map

# Each test case: the question, which tool we EXPECT, and words the answer must contain.
TEST_CASES = [
    {"q": "What's the live score of India vs West Indies?",    "tool": "get_live_score",   "must_contain": ["287"]},
    {"q": "How many runs does West Indies need to win?",        "tool": "get_live_score",   "must_contain": ["90"]},
    {"q": "How many runs has Shubman Gill scored this series?", "tool": "get_player_stats", "must_contain": ["164"]},
    {"q": "Shai Hope's highest score in the series?",           "tool": "get_player_stats", "must_contain": ["78"]},
    {"q": "What is 2 + 2?",                                     "tool": None,               "must_contain": ["4"]},
]

# "all" runs the whole suite (the class default); "1".."5" runs one case.
CASE_CHOICES = ("all",) + tuple(str(i) for i in range(1, len(TEST_CASES) + 1))

# Which agent to evaluate: with MCP tools (class default), without, or both.
AGENT_CHOICES = ("on", "off", "both")


def grade(case: dict, result: dict) -> dict:
    """Apply the two code checks to one agent run."""
    tools_used = [step["tool"] for step in result["trace"]]
    answer = result["answer"] or ""
    # ① did it pick the right tool (or no tool when none is needed)?
    tool_ok = (case["tool"] in tools_used) if case["tool"] else (tools_used == [])
    # ② does the answer contain the key fact?
    answer_ok = all(word.lower() in answer.lower() for word in case["must_contain"])
    return {"tools_used": tools_used, "answer": answer, "tool_ok": tool_ok, "answer_ok": answer_ok,
            "ok": tool_ok and answer_ok}


def run_evals(case: str = "all", agent: str = "on", temperature: float = 0.0) -> str:
    """Run the selected test cases against the selected agent(s); return a text report."""
    # ① pick the cases and agent modes to run
    numbered = list(enumerate(TEST_CASES, 1))
    if case != "all":
        numbered = [numbered[int(case) - 1]]
    modes = {"on": [True], "off": [False], "both": [True, False]}[agent]

    # ② run every (mode, case) pair in parallel: each run starts its own MCP server
    jobs = [(use, i, c) for use in modes for i, c in numbered]
    results = parallel_map(lambda job: run_agent_sync(job[2]["q"], job[0], temperature), jobs)

    # ③ grade each run and print it like the class script
    sections, scores = [], {}
    for use in modes:
        lines = [f"AGENT: tools {'ON' if use else 'OFF'}"]
        passed = total = 0
        for (job_use, i, c), result in zip(jobs, results):
            if job_use != use:
                continue
            g = grade(c, result)
            passed += g["ok"]
            total += 1
            lines.append(f"\nTest {i}: {'PASS' if g['ok'] else 'FAIL'}  |  {c['q']}")
            lines.append(f"   tools used: {g['tools_used'] or 'none'}   (expected: {c['tool'] or 'none'})"
                         f"  -> {'ok' if g['tool_ok'] else 'WRONG'}")
            lines.append(f"   answer: {' '.join(g['answer'].split())[:120]}  -> "
                         f"{'ok' if g['answer_ok'] else 'missing ' + str(c['must_contain'])}")
        lines.append(f"\n==== SCORE: {passed}/{total} passed ({100 * passed // total}%) ====")
        scores[use] = (passed, total)
        sections.append("\n".join(lines))

    # ④ compare both agents only when both ran
    report = ("\n\n" + "─" * 40 + "\n\n").join(sections)
    if len(modes) == 2:
        (on_p, n), (off_p, _) = scores[True], scores[False]
        report += f"\n\nWith MCP tools: {on_p}/{n}  ·  Without tools: {off_p}/{n}"
    else:
        report += "\n\nTip: pick 'Both' to score the agent with and without MCP tools side by side."
    return report


if __name__ == "__main__":
    # docker compose run --rm evals          -> the full suite, tools ON
    print(run_evals(sys.argv[1] if len(sys.argv) > 1 else "all"))
