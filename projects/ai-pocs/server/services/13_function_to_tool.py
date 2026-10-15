"""Function-to-Tool Agent Service.

Demonstrates converting a plain Python function into an LLM Agent Tool:
1. Decorator: `@tool` exposes the function to the agent loop.
2. Type hints: inform the agent of expected parameter and return types.
3. Docstring: guides the agent on WHEN and HOW to call the tool.
4. Tool: `check_server_status(server_url: str)` making live HTTP checks.

Run directly:
    python projects/ai-pocs/server/services/13_function_to_tool.py
"""

import os
from typing import List

import requests
from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
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


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool                                              # 1. decorator: exposes function to the agent
def check_server_status(server_url: str) -> str:   # 2. type hints: defines parameter & return types
    """Check if a server is responding by making an HTTP request.

    Args:
        server_url: The URL of the server to check

    Returns:
        A message indicating whether the server is up or down
    """                                            # 3. docstring: guides the LLM on when to call it
    try:
        # Send an HTTP GET request with a 5-second timeout and report the status code
        response = requests.get(server_url, timeout=5)
        return f"Server is up. Status code: {response.status_code}"
    except requests.exceptions.RequestException:
        # Catch network or HTTP errors and return a readable diagnostic message
        return "Server is down or unreachable"


def run_function_to_tool_agent(question: str = "Is the staging server running? Check https://httpbin.org/get") -> dict:
    """Execute the Function-to-Tool agent."""
    # ③ Initialize the Strands Agent with BedrockModel and the check_server_status tool
    agent = Agent(model=BedrockModel(model_id=model_id), tools=[check_server_status])

    # ④ Run the agent on the user question
    response = agent(question)

    # ⑤ Collect every tool call the agent made from its message history
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {
        "question": question,
        "response": str(response),
        "tool_calls": tool_calls,
        "provider": f"Strands + Bedrock ({model_id})",
    }


if __name__ == "__main__":
    out = run_function_to_tool_agent()
    print("Calls:", out["tool_calls"])
    print("Response:", out["response"])
