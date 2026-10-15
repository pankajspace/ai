"""
Langchain Version V1 - Agents (multiple tools + visible tool calls)

Teaching idea: give the agent SEVERAL tools, then SHOW what it does internally.
For each question the agent: reads the tools -> decides which to call ->
calls it -> reads the result -> writes a final answer. The step trace below
makes that loop visible so students can see the function calls happen.

NOTE on the OpenAI 429 ('insufficient_quota'): billing state, not a bug.
PROVIDER="groq" (free) keeps you teaching without OpenAI credits.

Run directly:
    python projects/ai-pocs/server/services/07_langchain_multi_tools.py
"""

import os
from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration & Provider Selection
# ---------------------------------------------------------------------------
load_dotenv(find_dotenv())

# Pick a provider: "groq" (free + fast), "gemini" (free tier) or "openai" (needs billing).
# Its settings are read from <PROVIDER>_MODEL / <PROVIDER>_API_KEY / <PROVIDER>_BASE_URL in .env
PROVIDER = "groq"
prefix = PROVIDER.upper()


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class MultiToolAgentRequest(BaseModel):
    """Input payload for multi-tool LangChain agent queries."""

    message: str = Field(
        default="What's the weather in Tokyo, and what is 12 times 12?",
        description="Question for the multi-tool LangChain agent",
    )


class MultiToolAgentResponse(BaseModel):
    """Output payload containing the final response and tool call indicator."""

    message: str
    response: str
    tool_called: bool = False


# ---------------------------------------------------------------------------
# Tools
#   1. Type hints (city: str)  -> tell the model what arguments to pass
#   2. The docstring           -> tells the model WHEN to use this tool
# ---------------------------------------------------------------------------
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is sunny, 28 degrees C."


def add(a: float, b: float) -> float:
    """Add two numbers together."""
    return a + b


def multiply(a: float, b: float) -> float:
    """Multiply two numbers together."""
    return a * b


def get_population(city: str) -> str:
    """Get the approximate population of a major city."""
    data = {
        "new york": "8.5 million",
        "london": "9 million",
        "bangalore": "13 million",
        "tokyo": "14 million",
    }
    return data.get(city.lower(), f"Sorry, I don't have population data for {city}.")


# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
# ① Initialize the LLM client pointed at the configured provider
llm = ChatOpenAI(
    model=os.getenv(f"{prefix}_MODEL"),
    api_key=os.getenv(f"{prefix}_API_KEY") or "missing-key",
    base_url=os.getenv(f"{prefix}_BASE_URL") or None,
    temperature=0,
    timeout=20.0,
)

# ② Create the multi-tool LangChain agent with all 4 tools registered
agent = create_agent(
    model=llm,
    tools=[get_weather, add, multiply, get_population],
    # Tighter prompt: force the model to actually state the result so we don't
    # get vague answers like "that's the current weather".
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def run_multi_tool_agent(
    question: str = "What's the weather in Tokyo, and what is 12 times 12?",
) -> tuple[str, bool]:
    """Run a user question through the multi-tool LangChain agent."""
    # ① Invoke the multi-tool agent with the user's question
    messages = agent.invoke({"messages": [{"role": "user", "content": question}]})["messages"]

    # ② Detect whether one or more tools were executed during the turn
    tool_called = any(m.type == "tool" for m in messages)

    # ③ The last message is the final synthesized answer
    return messages[-1].content, tool_called


# ---------------------------------------------------------------------------
# Standalone CLI Verification
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    for q in [
        "What is the weather like in New York?",                  # -> get_weather
        "What is 25 multiplied by 4?",                            # -> multiply
        "What is 137 plus 568?",                                  # -> add
        "What is the population of Bangalore?",                   # -> get_population
        "What's the weather in Tokyo, and what is 12 times 12?",  # -> two tools
        "Who wrote the play Romeo and Juliet?",                   # -> no tool needed
    ]:
        answer, tool_called = run_multi_tool_agent(q)
        print(f"\nQ: {q}")
        print(f"Tool called: {'Yes' if tool_called else 'No'}")
        print(f"A: {answer}")
