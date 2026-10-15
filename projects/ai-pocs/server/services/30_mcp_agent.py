"""MCP-Enabled LLM Agent Service.

Connects an LLM to the FastMCP cricket server:
1. Starts `cricket_server.py` over stdio and discovers its tools with `tools/list`.
2. Converts the MCP tool descriptors into the OpenAI function-calling format.
3. Runs the tool-calling loop: the LLM asks for a tool, the client runs it with `tools/call`,
   and the tool output is fed back until the LLM gives a final answer.
"""

import json
import os
import re
import sys
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import OpenAI
from pydantic import BaseModel

load_dotenv(find_dotenv())


class McpAgentRequest(BaseModel):
    """Input payload for MCP Agent."""

    question: str = "What is the score in India vs West Indies?"


class McpAgentResponse(BaseModel):
    """Output payload from MCP Agent."""

    answer: str
    trace: list[dict]


# ① Model settings (Groq's OpenAI-compatible endpoint) and the MCP server to spawn over stdio
MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
server_script = str(Path(__file__).with_name("cricket_server.py"))
server = StdioServerParameters(command=sys.executable, args=[server_script])


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
    """Call the model, retrying when it tries to call a tool we never gave it."""
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
    return None, f"MODEL TRIED TO CALL A TOOL WE NEVER GAVE IT ({tool}). Try running again."


async def run_mcp_agent(question: str) -> dict:
    """Run the MCP agent loop for a single user question; returns the answer and a tool trace."""
    # ② Initialize the Groq OpenAI-compatible client
    llm = OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url=GROQ_BASE_URL)
    trace = []

    messages = [
        {
            "role": "system",
            "content": (
                "You are a cricket assistant. Use ONLY the functions provided to get live data. "
                "Do not use any browser or code tools. Be brief."
            ),
        },
        {"role": "user", "content": question},
    ]

    # ③ Connect to the FastMCP cricket server over stdio and discover its tools
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = to_openai_format((await session.list_tools()).tools)

            # ④ Run the multi-step tool-calling loop (up to 5 turns)
            for _ in range(5):
                reply, error = call_llm(llm, {"model": MODEL, "messages": messages, "tools": tools, "temperature": 0})
                if error:
                    return {"answer": f"({error})", "trace": trace}

                # No tool requested -> this is the final answer
                if not reply.tool_calls:
                    return {"answer": reply.content or "", "trace": trace}

                # ⑤ Run each requested tool on the MCP server and feed the output back to the LLM
                messages.append(
                    {
                        "role": "assistant",
                        "content": reply.content or "",
                        "tool_calls": [
                            {
                                "id": c.id,
                                "type": "function",
                                "function": {"name": c.function.name, "arguments": c.function.arguments},
                            }
                            for c in reply.tool_calls
                        ],
                    }
                )
                for call in reply.tool_calls:
                    args = json.loads(call.function.arguments)
                    result = await session.call_tool(call.function.name, args)
                    text = result.content[0].text if result.content else "(empty)"
                    trace.append({"tool": call.function.name, "args": args, "result": text})
                    messages.append({"role": "tool", "tool_call_id": call.id, "content": text})

    return {"answer": "(stopped: too many steps)", "trace": trace}
