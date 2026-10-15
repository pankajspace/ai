"""MCP Agent Evaluation Suite Service.

Runs unit-test style evaluation assertions against the MCP-enabled cricket agent (service 30):
1. Tool routing assertion: verifies the LLM chooses the expected MCP tool (`get_live_score`, `get_player_stats`, or none).
2. Ground-truth verification: checks whether required factual tokens appear in the agent's final answer.
3. Suite scoring: aggregates pass/fail counts and overall accuracy percentage across all test cases.

Run directly:
    python projects/ai-pocs/server/services/31_mcp_evals.py
"""

import asyncio
import importlib
import time
from typing import List, Optional

from pydantic import BaseModel

# ① Reuse the MCP agent loop from 30_mcp_agent.py (importlib, because the file name starts with a digit)
mcp_agent = importlib.import_module(f"{__package__}.30_mcp_agent" if __package__ else "30_mcp_agent")


class TestCaseEvalResult(BaseModel):
    case_name: str
    prompt: str
    expected_tool: Optional[str]
    actual_tool: Optional[str]
    tool_routing_passed: bool
    expected_keywords: List[str]
    answer_verified: bool
    overall_passed: bool
    agent_answer: str
    latency_seconds: float


class McpEvalsResponse(BaseModel):
    """Output payload from MCP Evals Suite."""

    total_cases: int
    passed_cases: int
    failed_cases: int
    accuracy_percentage: float
    results: List[TestCaseEvalResult]
    model: str


# ② Evaluation test suite: question, expected tool (None = no tool) and facts the answer must contain
TEST_CASES = [
    {"q": "What's the live score of India vs West Indies?", "tool": "get_live_score", "must_contain": ["287"]},
    {"q": "How many runs does West Indies need to win?", "tool": "get_live_score", "must_contain": ["90"]},
    {"q": "How many runs has Shubman Gill scored this series?", "tool": "get_player_stats", "must_contain": ["164"]},
    {"q": "Shai Hope's highest score in the series?", "tool": "get_player_stats", "must_contain": ["78"]},
    {"q": "What is 2 + 2?", "tool": None, "must_contain": ["4"]},
]


async def run_case(i: int, case: dict) -> dict:
    """Run the agent on one test case and apply both assertions."""
    start = time.perf_counter()
    result = await mcp_agent.run_agent(case["q"])
    tools_used = [step["tool"] for step in result["trace"]]
    answer = result["answer"] or ""

    # ③ Assertion 1 (Tool Routing): the agent picked the expected tool (or no tool at all)
    tool_ok = (case["tool"] in tools_used) if case["tool"] else (tools_used == [])
    # ④ Assertion 2 (Ground Truth): the final answer contains every required fact
    answer_ok = all(word.lower() in answer.lower() for word in case["must_contain"])

    return {
        "case_name": f"Test {i}",
        "prompt": case["q"],
        "expected_tool": case["tool"],
        "actual_tool": ", ".join(tools_used) or None,
        "tool_routing_passed": tool_ok,
        "expected_keywords": case["must_contain"],
        "answer_verified": answer_ok,
        "overall_passed": tool_ok and answer_ok,
        "agent_answer": answer,
        "latency_seconds": round(time.perf_counter() - start, 2),
    }


async def run_mcp_evals_suite() -> dict:
    """Execute the complete MCP evaluation suite."""
    # ⑤ Run every test case in turn
    results = [await run_case(i, case) for i, case in enumerate(TEST_CASES, 1)]

    # ⑥ Compute the final suite score
    passed = sum(r["overall_passed"] for r in results)
    return {
        "total_cases": len(results),
        "passed_cases": passed,
        "failed_cases": len(results) - passed,
        "accuracy_percentage": round(100 * passed / len(results), 1),
        "results": results,
        "model": mcp_agent.MODEL,
    }


if __name__ == "__main__":
    out = asyncio.run(run_mcp_evals_suite())
    for r in out["results"]:
        print(f"{r['case_name']}: {'PASS' if r['overall_passed'] else 'FAIL'} | {r['prompt']} | tools: {r['actual_tool']}")
    print(f"==== SCORE: {out['passed_cases']}/{out['total_cases']} passed ({out['accuracy_percentage']}%) ====")
