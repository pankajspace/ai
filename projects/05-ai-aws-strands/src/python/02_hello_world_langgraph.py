"""LangGraph ReAct Hello World Agent Service.

Demonstrates the LangGraph tool-calling ReAct agentic loop on Amazon Bedrock:
1. Defines a tool `greet(name: str)`.
2. Passes the prompt to a LangGraph ReAct agent backed by Bedrock Converse.
3. Observes tool execution steps (calling greet for each person).
4. Synthesizes the final response.
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())

# Ensure default AWS region is configured if not provided in environment
if "AWS_REGION" not in os.environ:
    os.environ["AWS_REGION"] = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
if "AWS_DEFAULT_REGION" not in os.environ:
    os.environ["AWS_DEFAULT_REGION"] = os.environ["AWS_REGION"]


class LangGraphAgentRequest(BaseModel):
    """Input payload for LangGraph Hello World Agent."""

    prompt: str = "Please greet Alice and Bob."


class LangGraphAgentResponse(BaseModel):
    """Output payload from LangGraph Hello World Agent."""

    prompt: str
    response: str
    tool_calls: list[str]


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool
def greet(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}! Welcome to the world of AI agents."


_agent = None


def _get_agent():
    """Lazily initialize the Bedrock Converse chat model and LangGraph ReAct agent."""
    global _agent
    if _agent is None:
        region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        llm = init_chat_model(model_id, model_provider="bedrock_converse", region_name=region)
        _agent = create_react_agent(model=llm, tools=[greet])
    return _agent


def run_langgraph_agent(prompt: str = "Please greet Alice and Bob.") -> dict:
    """Run the LangGraph tool-enabled ReAct agent."""
    agent = _get_agent()
    # ⑤ Invoke the ReAct agent loop (Reason -> Act -> Observe)
    response = agent.invoke({"messages": [{"role": "user", "content": prompt}]})
    messages = response["messages"]

    # ⑥ Every "tool" message is the observation from one greet() call
    tool_calls = [f"{m.name} -> {m.content}" for m in messages if m.type == "tool"]

    return {"prompt": prompt, "response": messages[-1].text, "tool_calls": tool_calls}

