"""Step 3 — MCP Agent Evaluation Suite.

Runs unit-test style evaluation assertions against the MCP-enabled cricket agent:
1. Tool routing assertion: verifies the LLM chooses the expected MCP tool (`get_live_score`, `get_player_stats`, or `None`).
2. Ground-truth verification: checks whether required factual tokens appear in the agent's final response.
3. Suite scoring: aggregates pass/fail metrics and overall accuracy percentage across all test cases.

Run locally (from this folder):
    pip install -r requirements.txt
    python 03_mcp_evals.py

Run with Docker Compose (from this folder):
    docker compose run --rm 03_mcp_evals
"""

import asyncio
import json
import os
import re
import sys
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import OpenAI

# ---------------------------------------------------------------------------
# Configuration & MCP Server Setup
# ---------------------------------------------------------------------------
load_dotenv(find_dotenv())

MODEL = os.getenv("DEMO_MODEL", "openai/gpt-oss-20b")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

# Spawn cricket_server.py over stdio using the current Python interpreter
server_script = str(Path(__file__).with_name("cricket_server.py"))
server = StdioServerParameters(command=sys.executable, args=[server_script])

# ---------------------------------------------------------------------------
# Sample Inputs / Evaluation Test Suite
# ---------------------------------------------------------------------------
# Uncomment another option below to run different evaluation test subsets:

# Option 1: Full evaluation test suite (default - 5 cases testing both tools + no-tool fallback)
TEST_CASES = [
    {
        "q": "What's the live score of India vs West Indies?",
        "tool": "get_live_score",
        "must_contain": ["287"],
    },
    {
        "q": "How many runs does West Indies need to win?",
        "tool": "get_live_score",
        "must_contain": ["90"],
    },
    {
        "q": "How many runs has Shubman Gill scored this series?",
        "tool": "get_player_stats",
        "must_contain": ["164"],
    },
    {
        "q": "Shai Hope's highest score in the series?",
        "tool": "get_player_stats",
        "must_contain": ["78"],
    },
    {
        "q": "What is 2 + 2?",
        "tool": None,
        "must_contain": ["4"],
    },
]

# Option 2: Live match queries only
# TEST_CASES = [
#     {"q": "What's the live score of India vs West Indies?", "tool": "get_live_score", "must_contain": ["287"]},
#     {"q": "How many runs does West Indies need to win?", "tool": "get_live_score", "must_contain": ["90"]},
# ]

# Option 3: Player statistics queries only
# TEST_CASES = [
#     {"q": "How many runs has Shubman Gill scored this series?", "tool": "get_player_stats", "must_contain": ["164"]},
#     {"q": "Shai Hope's highest score in the series?", "tool": "get_player_stats", "must_contain": ["78"]},
# ]

# Option 4: Non-tool queries only (tests restraint / avoiding unneeded tool calls)
# TEST_CASES = [
#     {"q": "What is 2 + 2?", "tool": None, "must_contain": ["4"]},
# ]


# ---------------------------------------------------------------------------
# Helper & Bridge Functions
# ---------------------------------------------------------------------------
def to_openai_format(mcp_tools):
    """MCP tool list -> format expected by OpenAI-compatible API."""
    # ① Convert each MCP tool descriptor into an OpenAI function-calling schema
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description or "",
                "parameters": t.inputSchema,
            },
        }
        for t in mcp_tools
    ]


def call_llm(llm, kwargs, retries=2):
    """Calls the model with error handling and retries."""
    # ① Attempt LLM completion with automatic retry on transient tool-use failures
    last = None
    for _ in range(retries + 1):
        try:
            return llm.chat.completions.create(**kwargs).choices[0].message, None
        except Exception as e:
            last = str(e)
            if "tool_use_failed" not in last:
                return None, f"API ERROR: {last}"
    # ② Extract hallucinated tool name if the model tried calling an unavailable tool
    m = re.search(r'"name":\s*"([^"]+)"', last or "")
    tool = m.group(1) if m else "a tool"
    return None, (
        f"MODEL TRIED TO CALL A TOOL WE NEVER GAVE IT ({tool}). "
        "It knows it needs live data, but it has no way to get it. Try running again."
    )


# ---------------------------------------------------------------------------
# Core MCP Agent & Evaluation Suite Runner
# ---------------------------------------------------------------------------
async def run_agent(question: str, use_tools: bool = True, verbose: bool = True) -> dict:
    """Agent loop interacting with MCP server and LLM."""
    # ① Validate API key and initialize the Groq OpenAI-compatible client
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        sys.exit(
            "GROQ_API_KEY is not set. Put it in a .env file next to this script "
            "(GROQ_API_KEY=gsk_...). Free key: https://console.groq.com/keys"
        )
    llm = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
    trace = []

    # ② Build the system prompt and initial conversation history
    if use_tools:
        system = (
            "You are a cricket assistant. Use ONLY the functions provided to get live data. "
            "Do not use any browser or code tools. Be brief."
        )
    else:
        system = (
            "You are a cricket assistant. You have NO tools, NO browser and NO internet access. "
            "Never try to call a tool. Answer only from your own knowledge, in 1-2 sentences."
        )
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": question},
    ]

    # ③ Connect to the FastMCP cricket server over stdio and discover tools
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = (
                to_openai_format((await session.list_tools()).tools)
                if use_tools
                else None
            )

            # ④ Run the multi-step tool-calling loop (up to 5 turns)
            for _ in range(5):
                kwargs = {"model": MODEL, "messages": messages, "temperature": 0}
                if tools:
                    kwargs["tools"] = tools
                reply, error = call_llm(llm, kwargs)
                if error:
                    if verbose:
                        print(f"\n{error}")
                    return {"answer": f"({error})", "trace": trace}

                # If no tool call was requested, return the final answer and recorded trace
                if not reply.tool_calls:
                    if verbose:
                        print(f"\nFINAL ANSWER: {reply.content}")
                    return {"answer": reply.content, "trace": trace}

                # ⑤ Execute each requested MCP tool call and feed the result back into the conversation
                messages.append(
                    {
                        "role": "assistant",
                        "content": reply.content or "",
                        "tool_calls": [
                            {
                                "id": c.id,
                                "type": "function",
                                "function": {
                                    "name": c.function.name,
                                    "arguments": c.function.arguments,
                                },
                            }
                            for c in reply.tool_calls
                        ],
                    }
                )
                for call in reply.tool_calls:
                    args = json.loads(call.function.arguments)
                    trace.append({"tool": call.function.name, "args": args})
                    if verbose:
                        print(
                            f"\nLLM SAYS: please call {call.function.name} with {args}"
                        )
                    result = await session.call_tool(call.function.name, args)
                    text = result.content[0].text if result.content else "(empty)"
                    if verbose:
                        print(f"TOOL RETURNED: {text}")
                    messages.append(
                        {"role": "tool", "tool_call_id": call.id, "content": text}
                    )

    return {"answer": "(stopped: too many steps)", "trace": trace}


async def main():
    """Run all test cases in TEST_CASES and compute tool-routing and ground-truth accuracy."""
    print(f"Running evaluation suite ({len(TEST_CASES)} cases)...")
    passed = 0

    # ① Iterate through each evaluation test case and run the MCP agent silently
    for i, case in enumerate(TEST_CASES, 1):
        result = await run_agent(case["q"], verbose=False)
        tools_used = [step["tool"] for step in result["trace"]]
        answer = result["answer"] or ""

        # ② Assertion 1 (Tool Routing): verify the agent picked the expected tool (or None)
        tool_ok = (case["tool"] in tools_used) if case["tool"] else (tools_used == [])
        # ③ Assertion 2 (Ground Truth): verify the final answer contains all required facts
        answer_ok = all(
            word.lower() in answer.lower() for word in case["must_contain"]
        )

        # ④ Combine assertions and print per-case diagnostic report
        ok = tool_ok and answer_ok
        passed += ok
        print(f"\nTest {i}: {'PASS' if ok else 'FAIL'}  |  {case['q']}")
        print(
            f"   tools used: {tools_used or 'none'}   (expected: {case['tool'] or 'none'})  -> {'ok' if tool_ok else 'WRONG'}"
        )
        print(
            f"   answer: {answer[:120]}  -> {'ok' if answer_ok else 'missing ' + str(case['must_contain'])}"
        )

    # ⑤ Compute and display the final evaluation suite score percentage
    score_pct = 100 * passed // len(TEST_CASES) if TEST_CASES else 0
    print(f"\n==== SCORE: {passed}/{len(TEST_CASES)} passed ({score_pct}%) ====")


if __name__ == "__main__":
    asyncio.run(main())


