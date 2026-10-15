"""MCP Agent Evaluation Suite Service.

Runs unit-test style evaluation assertions against the MCP-enabled cricket agent:
1. Tool routing assertion: verifies the LLM chooses the correct tool (`get_live_score`, `get_player_stats`, or None).
2. Ground truth verification: checks whether expected factual tokens appear in the agent's final answer.
3. Computes suite pass/fail metrics, execution latencies, and assertion details.

Run directly:
    python projects/ai-pocs/server/services/31_mcp_evals.py
"""

import json
import os
import time
from typing import Any, Dict, List, Optional
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

from services.mcp.cricket_server import get_live_score, get_player_stats

load_dotenv(find_dotenv())


class McpEvalsRequest(BaseModel):
    """Input payload for MCP Evals Suite."""

    run_all: bool = Field(
        default=True,
        description="Whether to run full evaluation suite across all cases",
    )


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


TEST_SUITE = [
    {
        "name": "Live Match Score Routing",
        "prompt": "What is the score in India vs West Indies?",
        "expected_tool": "get_live_score",
        "keywords": ["287", "198", "india", "west indies"],
    },
    {
        "name": "Player Batting Stats Routing",
        "prompt": "How many runs has Shubman Gill scored in this series?",
        "expected_tool": "get_player_stats",
        "keywords": ["164", "shubman"],
    },
    {
        "name": "Non-Tool General Query",
        "prompt": "What is the capital of France?",
        "expected_tool": None,
        "keywords": ["paris"],
    },
]


def run_single_mcp_eval_case(case: dict, client: OpenAI, model: str) -> TestCaseEvalResult:
    """Execute a single test case evaluation."""
    # ① Start timer and declare MCP tool schemas for the evaluation run
    start_t = time.perf_counter()

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "get_live_score",
                "description": "Get the LIVE score of a cricket match.",
                "parameters": {
                    "type": "object",
                    "properties": {"teams": {"type": "string"}},
                    "required": ["teams"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_player_stats",
                "description": "Get batting stats for a player in the series.",
                "parameters": {
                    "type": "object",
                    "properties": {"player_name": {"type": "string"}},
                    "required": ["player_name"],
                },
            },
        },
    ]

    messages = [
        {"role": "system", "content": "You are a cricket assistant. Answer concisely and use tools when appropriate."},
        {"role": "user", "content": case["prompt"]},
    ]

    # ② Invoke the LLM and assert tool routing accuracy against expected_tool
    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools_schema,
        tool_choice="auto",
    )
    msg = resp.choices[0].message
    actual_tool = msg.tool_calls[0].function.name if msg.tool_calls else None
    tool_routing_passed = (actual_tool == case["expected_tool"])

    # ③ Execute the MCP tool if called and synthesize the agent's final response
    if msg.tool_calls:
        tc = msg.tool_calls[0]
        args = json.loads(tc.function.arguments or "{}")
        if tc.function.name == "get_live_score":
            t_res = get_live_score(args.get("teams", "India vs West Indies"))
        else:
            t_res = get_player_stats(args.get("player_name", "Shubman Gill"))

        messages.append(msg)
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(t_res)})
        final_resp = client.chat.completions.create(model=model, messages=messages)
        answer = final_resp.choices[0].message.content or ""
    else:
        answer = msg.content or ""

    # ④ Verify ground-truth keywords in the final answer and compute overall pass/fail
    dur = time.perf_counter() - start_t
    lowered_answer = answer.lower()
    answer_verified = all(kw.lower() in lowered_answer for kw in case["keywords"])
    overall = tool_routing_passed and answer_verified

    return TestCaseEvalResult(
        case_name=case["name"],
        prompt=case["prompt"],
        expected_tool=case["expected_tool"],
        actual_tool=actual_tool,
        tool_routing_passed=tool_routing_passed,
        expected_keywords=case["keywords"],
        answer_verified=answer_verified,
        overall_passed=overall,
        agent_answer=answer,
        latency_seconds=round(dur, 3),
    )


def run_mcp_evals_suite(run_all: bool = True) -> dict:
    """Execute complete MCP evaluation suite."""
    # ① Initialize Groq or OpenAI client for the test suite
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if groq_key:
        client = OpenAI(api_key=groq_key, base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"))
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    else:
        client = OpenAI(api_key=openai_key, base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"))
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # ② Execute each test case in TEST_SUITE and collect assertion results
    results = []
    cases_to_run = TEST_SUITE if run_all else TEST_SUITE[:1]

    for c in cases_to_run:
        res = run_single_mcp_eval_case(c, client, model)
        results.append(res)

    # ③ Aggregate pass/fail counts and accuracy percentage
    total = len(results)
    passed = sum(1 for r in results if r.overall_passed)
    failed = total - passed
    pct = round((passed / total * 100), 1) if total > 0 else 0.0

    return {
        "total_cases": total,
        "passed_cases": passed,
        "failed_cases": failed,
        "accuracy_percentage": pct,
        "results": [r.model_dump() for r in results],
        "model": model,
    }


if __name__ == "__main__":
    suite_out = run_mcp_evals_suite()
    print(f"Suite: {suite_out['passed_cases']}/{suite_out['total_cases']} passed ({suite_out['accuracy_percentage']}%)")

