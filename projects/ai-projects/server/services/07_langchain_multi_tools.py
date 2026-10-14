"""
Langchain Version V1 - Agents (multiple tools + visible tool calls)

Teaching idea: give the agent SEVERAL tools, then SHOW what it does internally.
For each question the agent: reads the tools -> decides which to call ->
calls it -> reads the result -> writes a final answer. The step trace below
makes that loop visible so students can see the function calls happen.

NOTE on the OpenAI 429 ('insufficient_quota'): billing state, not a bug.
PROVIDER="groq" (free) keeps you teaching without OpenAI credits.

Run directly:
    python projects/ai-projects/server/services/07_langchain_multi_tools.py
"""

import os
from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Load environment / API keys
# ---------------------------------------------------------------------------
load_dotenv(find_dotenv(), override=True)

# ---------------------------------------------------------------------------
# Pick your provider here.
# ---------------------------------------------------------------------------
# "groq"   -> free + fast.  Key: https://console.groq.com      (GROQ_API_KEY)
# "gemini" -> free tier.    Key: https://aistudio.google.com   (GEMINI_API_KEY / GOOGLE_API_KEY)
# "openai" -> needs billing/credits set up.                    (OPENAI_API_KEY)
PROVIDER = "groq"

if PROVIDER == "groq":
    MODEL = os.getenv("GROQ_MODEL")
    BASE_URL = os.getenv("GROQ_BASE_URL")
    REQUIRED_KEY = os.getenv("GROQ_API_KEY")
elif PROVIDER == "gemini":
    MODEL = os.getenv("GEMINI_MODEL") or os.getenv("GOOGLE_MODEL")
    BASE_URL = os.getenv("GEMINI_BASE_URL")
    REQUIRED_KEY = os.getenv("GEMINI_API_KEY")
else:  # openai
    MODEL = os.getenv("OPENAI_MODEL")
    BASE_URL = os.getenv("OPENAI_BASE_URL")
    REQUIRED_KEY = os.getenv("OPENAI_API_KEY")


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


TOOLS = [get_weather, add, multiply, get_population]

# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
# ① Initialize the LLM client pointed at the configured provider
llm = ChatOpenAI(
    model=MODEL,
    api_key=REQUIRED_KEY,
    base_url=BASE_URL if BASE_URL else None,
    temperature=0,
    timeout=20.0,
)

# ② Create the multi-tool LangChain agent with all 4 tools registered
agent = create_agent(
    model=llm,
    tools=TOOLS,
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
    response = agent.invoke({"messages": [{"role": "user", "content": question}]})
    messages = response["messages"]
    # ② Detect whether one or more tools were executed during the turn
    tool_called = any(msg.type == "tool" for msg in messages)
    # ③ Extract and return the final synthesized answer
    final_msg = messages[-1]
    answer = str(final_msg.content) if hasattr(final_msg, "content") else str(final_msg)
    return answer, tool_called


def ask(question: str) -> None:
    answer, tool_called = run_multi_tool_agent(question)
    print(f"\nQ: {question}")
    print(f"Tool called: {'Yes' if tool_called else 'No'}")
    print(f"A: {answer}")


# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ask("What is the weather like in New York?")          # -> get_weather
    ask("What is 25 multiplied by 4?")                     # -> multiply
    ask("What is 137 plus 568?")                           # -> add
    ask("What is the population of Bangalore?")            # -> get_population
    ask("What's the weather in Tokyo, and what is 12 times 12?")  # -> two tools
    ask("Who wrote the play Romeo and Juliet?")   # -> no tool needed