"""MCP Agent Evaluation Suite Service.

Runs unit-test style evaluation assertions against the MCP-enabled cricket agent (service 31):
1. Tool routing assertion: verifies the LLM chooses the expected MCP tool (`get_live_score`, `get_player_stats`, or none).
2. Ground-truth verification: checks whether required factual tokens appear in the agent's final answer.
3. Suite scoring: aggregates pass/fail counts and overall accuracy percentage across all test cases.
"""

import importlib.util
import sys
from pathlib import Path
from typing import Optional

from pydantic import BaseModel

# ① Reuse the MCP agent loop from 02_mcp_agent.py in this folder
if "services.mcp_agent" in sys.modules:
    mcp_agent = sys.modules["services.mcp_agent"]
else:
    _spec = importlib.util.spec_from_file_location("mcp_agent", Path(__file__).with_name("02_mcp_agent.py"))
    mcp_agent = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(mcp_agent)


class TestCaseEvalResult(BaseModel):
    prompt: str
    expected_tool: Optional[str]
    tools_used: list[str]
    tool_routing_passed: bool
    answer_verified: bool
    overall_passed: bool


class McpEvalsResponse(BaseModel):
    """Output payload from MCP Evals Suite."""

    total_cases: int
    passed_cases: int
    accuracy_percentage: int
    results: list[TestCaseEvalResult]


# ② Evaluation test suite: question, expected tool (None = no tool) and facts the answer must contain
TEST_CASES = [
    {"q": "What's the live score of India vs West Indies?", "tool": "get_live_score", "must_contain": ["287"]},
    {"q": "How many runs does West Indies need to win?", "tool": "get_live_score", "must_contain": ["90"]},
    {"q": "How many runs has Shubman Gill scored this series?", "tool": "get_player_stats", "must_contain": ["164"]},
    {"q": "Shai Hope's highest score in the series?", "tool": "get_player_stats", "must_contain": ["78"]},
    {"q": "What is 2 + 2?", "tool": None, "must_contain": ["4"]},
]


async def run_mcp_evals_suite() -> dict:
    """Execute the complete MCP evaluation suite."""
    results = []
    passed = 0

    # ③ Run every test case in turn: run the agent on one test case and apply both assertions
    for case in TEST_CASES:
        result = await mcp_agent.run_mcp_agent(case["q"])
        tools_used = [step["tool"] for step in result["trace"]]
        answer = result["answer"] or ""

        # ④ Assertion 1 (Tool Routing): the agent picked the expected tool (or no tool at all)
        tool_ok = (case["tool"] in tools_used) if case["tool"] else (tools_used == [])
        # ⑤ Assertion 2 (Ground Truth): the final answer contains every required fact
        answer_ok = all(word.lower() in answer.lower() for word in case["must_contain"])

        # ⑥ Combine both assertions into the per-case result
        ok = tool_ok and answer_ok
        passed += ok
        results.append({
            "prompt": case["q"],
            "expected_tool": case["tool"],
            "tools_used": tools_used,
            "tool_routing_passed": tool_ok,
            "answer_verified": answer_ok,
            "overall_passed": ok,
        })

    # ⑦ Compute the final suite score
    return {
        "total_cases": len(TEST_CASES),
        "passed_cases": passed,
        "accuracy_percentage": 100 * passed // len(TEST_CASES),
        "results": results,
    }
