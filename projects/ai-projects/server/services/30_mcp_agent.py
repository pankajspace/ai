"""MCP-Enabled LLM Agent Service.

Demonstrates combining LLM intelligence with Model Context Protocol (MCP) tools:
1. Translates FastMCP tool definitions into LLM function calling schemas.
2. The LLM decides WHICH tool to invoke (`get_live_score`, `get_player_stats`) and extracts arguments.
3. Our code executes the tool against the MCP cricket server and feeds the output back.
4. Generates an accurate, factually grounded answer.

Run directly:
    python projects/ai-projects/server/services/30_mcp_agent.py
"""

import json
import os
from typing import Any, Dict, List, Optional
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

from services.cricket_server import get_live_score, get_player_stats

load_dotenv(find_dotenv())


class McpAgentRequest(BaseModel):
    """Input payload for MCP Agent."""

    question: str = Field(
        default="What is the score in India vs West Indies?",
        description="Natural language question about cricket scores or player stats",
    )


class McpAgentResponse(BaseModel):
    """Output payload from MCP Agent."""

    question: str
    response: str
    tool_called: Optional[str]
    tool_arguments: Optional[Dict[str, Any]]
    tool_result: Optional[Dict[str, Any]]
    provider: str


def run_mcp_agent(question: str = "What is the score in India vs West Indies?") -> dict:
    """Run the MCP-Enabled LLM agent."""
    # Check for Groq key first (since practice 06 used Groq), fallback to OpenAI
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if groq_key:
        client = OpenAI(api_key=groq_key, base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"))
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        provider_name = f"Groq ({model}) + FastMCP"
    else:
        client = OpenAI(api_key=openai_key, base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"))
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        provider_name = f"OpenAI ({model}) + FastMCP"

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "get_live_score",
                "description": "Get the LIVE score of a cricket match. Use this for questions about the current score, who is winning, or runs required.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "teams": {"type": "string", "description": "The two teams playing, e.g. 'India vs West Indies'"}
                    },
                    "required": ["teams"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_player_stats",
                "description": "Get a player's batting stats for the current series. Use this for questions about a specific player's runs or innings.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "player_name": {"type": "string", "description": "Full player name, e.g. 'Shubman Gill'"}
                    },
                    "required": ["player_name"],
                },
            },
        },
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a cricket assistant with access to real-time match data via FastMCP tools. Use tools when asked about scores or player stats.",
        },
        {"role": "user", "content": question},
    ]

    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools_schema,
        tool_choice="auto",
    )
    msg = resp.choices[0].message

    if not msg.tool_calls:
        return {
            "question": question,
            "response": msg.content or "",
            "tool_called": None,
            "tool_arguments": None,
            "tool_result": None,
            "provider": provider_name,
        }

    tc = msg.tool_calls[0]
    fname = tc.function.name
    args = json.loads(tc.function.arguments or "{}")

    if fname == "get_live_score":
        tool_res = get_live_score(args.get("teams", "India vs West Indies"))
    elif fname == "get_player_stats":
        tool_res = get_player_stats(args.get("player_name", "Shubman Gill"))
    else:
        tool_res = {"error": f"Unknown tool: {fname}"}

    messages.append(msg)
    messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(tool_res)})

    final_resp = client.chat.completions.create(model=model, messages=messages)
    final_text = final_resp.choices[0].message.content or ""

    return {
        "question": question,
        "response": final_text,
        "tool_called": fname,
        "tool_arguments": args,
        "tool_result": tool_res,
        "provider": provider_name,
    }


if __name__ == "__main__":
    out = run_mcp_agent()
    print("Tool Called:", out["tool_called"])
    print("Response:", out["response"])

