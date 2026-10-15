"""LangGraph ReAct Hello World Agent Service.

Demonstrates the LangGraph tool-calling ReAct agentic loop on Amazon Bedrock:
1. Defines a tool `greet(name: str)`.
2. Passes the prompt to a LangGraph ReAct agent backed by Bedrock Converse.
3. Observes tool execution steps (calling greet for each person).
4. Synthesizes the final response.

Run directly:
    python projects/ai-pocs/server/services/12_hello_world_langgraph.py
"""

import os
from typing import List

from dotenv import find_dotenv, load_dotenv
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.prebuilt import create_react_agent
from pydantic import BaseModel, Field

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class LangGraphAgentRequest(BaseModel):
    """Input payload for LangGraph Hello World Agent."""

    prompt: str = Field(
        default="Please greet Alice and Bob.",
        description="User request for greeting individuals",
    )


class LangGraphAgentResponse(BaseModel):
    """Output payload from LangGraph Hello World Agent."""

    prompt: str
    response: str
    tool_calls: List[str]
    provider: str


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool
def greet(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}! Welcome to the world of AI agents."


# ③ Initialize the LLM via the Amazon Bedrock Converse provider
llm = init_chat_model(model_id, model_provider="bedrock_converse")

# ④ Create a LangGraph ReAct agent bound to the greet tool
agent = create_react_agent(model=llm, tools=[greet])


def run_langgraph_agent(prompt: str = "Please greet Alice and Bob.") -> dict:
    """Run the LangGraph tool-enabled ReAct agent."""
    # ⑤ Invoke the ReAct agent loop (Reason -> Act -> Observe)
    response = agent.invoke({"messages": [{"role": "user", "content": prompt}]})
    messages = response["messages"]

    # ⑥ Every "tool" message is the observation from one greet() call
    tool_calls = [f"{m.name} -> {m.content}" for m in messages if m.type == "tool"]

    return {
        "prompt": prompt,
        "response": messages[-1].text,
        "tool_calls": tool_calls,
        "provider": f"LangGraph + Bedrock Converse ({model_id})",
    }


if __name__ == "__main__":
    res = run_langgraph_agent()
    print("Tool calls:", res["tool_calls"])
    print("Response:", res["response"])
