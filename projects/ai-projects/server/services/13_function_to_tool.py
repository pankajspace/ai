"""Function-to-Tool Agent Service.

Demonstrates converting a plain Python function into an LLM Agent Tool:
1. Decorator: exposes function to the agent loop.
2. Type hints: informs the agent of expected parameter and return types.
3. Docstrings: guides the agent on WHEN and HOW to call the tool.
4. Tool: `check_server_status(server_url: str)` making live HTTP checks.

Run directly:
    python projects/ai-projects/server/services/13_function_to_tool.py
"""

import json
import os
from typing import List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field
import requests

load_dotenv(find_dotenv())


class FunctionToToolRequest(BaseModel):
    """Input payload for Function-to-Tool Agent."""

    question: str = Field(
        default="Is the staging server running? Check https://httpbin.org/get",
        description="Natural language question asking to verify a URL status",
    )


class FunctionToToolResponse(BaseModel):
    """Output payload from Function-to-Tool Agent."""

    question: str
    response: str
    tool_calls: List[str]
    provider: str


def check_server_status(server_url: str) -> str:
    """Check if a server is responding by making an HTTP request.

    Args:
        server_url: The URL of the server to check
    """
    try:
        response = requests.get(server_url, timeout=5)
        return f"Server is up. Status code: {response.status_code}"
    except requests.exceptions.RequestException as e:
        return f"Server is down or unreachable: {str(e)}"


def run_function_to_tool_agent(question: str = "Is the staging server running? Check https://httpbin.org/get") -> dict:
    """Execute the Function-to-Tool agent."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_calls_recorded = []

    if aws_key and aws_secret:
        try:
            from strands import Agent, tool
            from strands.models.bedrock import BedrockModel

            @tool
            def check_server(server_url: str) -> str:
                """Check if a server is responding by making an HTTP request."""
                res = check_server_status(server_url)
                tool_calls_recorded.append(f"check_server_status('{server_url}') -> {res}")
                return res

            agent = Agent(model=BedrockModel(model_id=bedrock_model_id), tools=[check_server])
            res = agent(question)
            return {
                "question": question,
                "response": str(res),
                "tool_calls": tool_calls_recorded,
                "provider": f"Strands + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Strands Bedrock failed ({exc}), falling back to OpenAI")

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "check_server_status",
                "description": "Check if a server or URL is responding by making an HTTP request.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "server_url": {
                            "type": "string",
                            "description": "The URL to check (e.g. https://httpbin.org/get)",
                        }
                    },
                    "required": ["server_url"],
                },
            },
        }
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a DevOps agent that checks web service statuses using the check_server_status tool.",
        },
        {"role": "user", "content": question},
    ]

    for _ in range(5):
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            tools=tools_schema,
            tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return {
                "question": question,
                "response": msg.content or "",
                "tool_calls": tool_calls_recorded,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Strands Tool Pattern)",
            }

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments or "{}")
            url = args.get("server_url", "https://httpbin.org/get")
            res = check_server_status(url)
            tool_calls_recorded.append(f"check_server_status('{url}') -> {res}")
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": res})

    return {
        "question": question,
        "response": messages[-1].get("content", ""),
        "tool_calls": tool_calls_recorded,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    out = run_function_to_tool_agent()
    print("Calls:", out["tool_calls"])
    print("Response:", out["response"])

