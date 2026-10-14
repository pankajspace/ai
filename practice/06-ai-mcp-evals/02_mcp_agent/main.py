"""Step 2 — MCP-Enabled LLM Agent.

The LLM decides WHICH tool to call and WITH WHAT arguments.
Our code executes the actual tool call via MCP.

Uses Groq (OpenAI-compatible format).
Usage:
  python main.py
  python main.py "How many runs has Shubman Gill scored this series?"
  python main.py --no-tools

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 02_mcp_agent .
    docker run --rm --env-file .env 02_mcp_agent
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

# 1. Load configuration from .env
load_dotenv(find_dotenv())

MODEL = os.getenv("DEMO_MODEL", "openai/gpt-oss-20b")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")

# MCP Server parameters
server_script = str(Path(__file__).with_name("cricket_server.py"))
server = StdioServerParameters(command=sys.executable, args=[server_script])

# 2. Inputs - default question to ask; uncomment another line to try a different query
# Option 1: Live score query (default - triggers get_live_score)
default_question = "What is the score in India vs West Indies?"

# Option 2: Run requirement calculation (triggers get_live_score)
# default_question = "How many runs does West Indies need to win?"

# Option 3: Player series runs inquiry (triggers get_player_stats)
# default_question = "How many runs has Shubman Gill scored this series?"

# Option 4: Player highest score inquiry (triggers get_player_stats)
# default_question = "What is Shai Hope's highest score in the series?"

# Option 5: General question requiring NO tool
# default_question = "What is 2 + 2?"


def to_openai_format(mcp_tools):
    """MCP tool list -> format expected by OpenAI-compatible API."""
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
    """Call the model with error handling and retries."""
    last = None
    for _ in range(retries + 1):
        try:
            return llm.chat.completions.create(**kwargs).choices[0].message, None
        except Exception as e:
            last = str(e)
            if "tool_use_failed" not in last:
                return None, f"API ERROR: {last}"
    m = re.search(r'"name":\s*"([^"]+)"', last or "")
    tool = m.group(1) if m else "a tool"
    return None, (
        f"MODEL TRIED TO CALL A TOOL WE NEVER GAVE IT ({tool}). "
        "It knows it needs live data, but it has no way to get it. Try running again."
    )


async def run_agent(question: str, use_tools: bool = True, verbose: bool = True) -> dict:
    """Runs the MCP agent loop for a single user query."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        sys.exit(
            "GROQ_API_KEY is not set. Put it in a .env file next to this script "
            "(GROQ_API_KEY=gsk_...). Free key: https://console.groq.com/keys"
        )
    llm = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
    trace = []

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

    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = (
                to_openai_format((await session.list_tools()).tools)
                if use_tools
                else None
            )

            for _ in range(5):
                kwargs = {"model": MODEL, "messages": messages, "temperature": 0}
                if tools:
                    kwargs["tools"] = tools
                reply, error = call_llm(llm, kwargs)
                if error:
                    if verbose:
                        print(f"\n{error}")
                    return {"answer": f"({error})", "trace": trace}

                if not reply.tool_calls:
                    if verbose:
                        print(f"\nFINAL ANSWER: {reply.content}")
                    return {"answer": reply.content, "trace": trace}

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
                        {
                            "role": "tool",
                            "tool_call_id": call.id,
                            "content": text,
                        }
                    )

    return {"answer": "(stopped: too many steps)", "trace": trace}


if __name__ == "__main__":
    args = sys.argv[1:]
    use_tools = "--no-tools" not in args
    passed_q = " ".join(a for a in args if a != "--no-tools")
    question = passed_q if passed_q else default_question
    print(f"QUESTION: {question}   (tools {'ON' if use_tools else 'OFF'})")
    asyncio.run(run_agent(question, use_tools))

