"""Pre-built Calculator Tool Agent Service.

Demonstrates integrating pre-built community tools with system prompts:
1. Standing System Prompt: "You are a helpful math assistant."
2. Prebuilt `calculator` tool from the `strands_tools` package (no tool code to write).
3. Evaluates complex mathematical queries with precise computation.
"""

import os

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class PrebuiltCalculatorRequest(BaseModel):
    """Input payload for Prebuilt Calculator Agent."""

    query: str = "What's 42 raised to the power of 9?"


class PrebuiltCalculatorResponse(BaseModel):
    """Output payload from Prebuilt Calculator Agent."""

    query: str
    response: str
    tool_calls: list[str]


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


def run_prebuilt_calculator_agent(query: str = "What's 42 raised to the power of 9?") -> dict:
    """Run the Prebuilt Calculator Agent."""
    # ③ Initialize the Strands Agent with the prebuilt calculator tool and a standing system prompt
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[calculator],
        system_prompt="You are a helpful math assistant.",
    )

    # ④ Execute the math query
    response = agent(query)

    # ⑤ Collect every tool call the agent made from its message history
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {"query": query, "response": str(response), "tool_calls": tool_calls}
