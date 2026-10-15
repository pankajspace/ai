"""
Langchain Version V1 - Agents (single tool)

Teaching idea: give the agent ONE tool (get_weather), and show how LangChain's
`create_agent` automatically inspects tool signatures, triggers the tool
when needed (e.g. weather queries), and answers general queries directly.
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Configuration & Provider Selection
# ---------------------------------------------------------------------------
# Load API keys and model names from .env
load_dotenv(find_dotenv())

# Pick a provider: "groq" (free + fast), "gemini" (free tier) or "openai" (needs billing).
# Its settings are read from <PROVIDER>_MODEL / <PROVIDER>_API_KEY / <PROVIDER>_BASE_URL in .env
# (get keys at https://console.groq.com or https://aistudio.google.com)
PROVIDER = "groq"
prefix = PROVIDER.upper()


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class LangchainOneToolRequest(BaseModel):
    """Input payload for single-tool LangChain agent queries."""

    message: str = "What is the weather like in New York?"


class LangchainOneToolResponse(BaseModel):
    """Output payload containing the final response and tool call indicator."""

    message: str
    response: str
    tool_called: bool


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------
# Type hints (city: str) tell the model WHAT arguments to pass;
# the docstring tells the model WHEN to invoke this tool.
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is too hot to handle, 28 degrees C."


# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
# ① Initialize the LLM client pointed at the configured provider
#   (placeholder key avoids an import-time crash when the key is unset)
llm = ChatOpenAI(
    model=os.getenv(f"{prefix}_MODEL"),
    api_key=os.getenv(f"{prefix}_API_KEY") or "missing-key",
    base_url=os.getenv(f"{prefix}_BASE_URL") or None,
    temperature=0,
    timeout=20.0,
)

# ② Create the LangChain tool-calling agent with get_weather and system instructions
agent = create_agent(
    model=llm,
    tools=[get_weather],
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def run_langchain_one_tool(question: str = "What is the weather like in New York?") -> tuple[str, bool]:
    """Run a user question through the single-tool LangChain agent."""
    # ③ Invoke the LangChain agent with the user's question
    messages = agent.invoke({"messages": [{"role": "user", "content": question}]})["messages"]

    # ④ The agent called the tool if any message in the trace has type "tool"
    tool_called = any(m.type == "tool" for m in messages)

    # ⑤ The last message is the final assistant reply
    return messages[-1].content, tool_called
