"""LangChain Multi-Tool Agent Demonstration (with Visible Tool Call Trace).

This script demonstrates how a LangChain agent selects and orchestrates multiple tools:
1. Registers four distinct tools (`get_weather`, `add`, `multiply`, `get_population`).
2. For each user query, the agent inspects tool schemas and docstrings to decide which
   tool(s) to invoke—or answers directly if no tool is needed.
3. Prints a step-by-step trace of every tool call (`call`) and tool output (`result`)
   before displaying the final synthesized response.

NOTE on OpenAI 429 ('insufficient_quota'): that is a billing state, not a code bug.
Keeping `PROVIDER = "groq"` (free) lets you run without OpenAI credits.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 07_langchain_multi_tools .
    docker run --rm --env-file .env 07_langchain_multi_tools
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load API keys and model names from .env
#   (in Docker, environment variables are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# Questions to ask the agent - uncomment additional lines to test different scenarios
questions = [
    "What is the weather like in New York?",                    # -> get_weather
    "What is 25 multiplied by 4?",                              # -> multiply
    "What is 137 plus 568?",                                    # -> add
    "What is the population of Bangalore?",                     # -> get_population
    "What's the weather in Tokyo, and what is 12 times 12?",    # -> two tools
    "Who wrote the play Romeo and Juliet?",                     # -> no tool needed
    # "What is (3 + 4) times 5?",                               # -> may skip tools: easy math done "in its head"
    # "What is the combined population of London and Tokyo?",   # -> get_population x2
    # "What is the population of Paris?",                       # -> tool has no data; model falls back on own knowledge
]

# ---------------------------------------------------------------------------
# Provider & LLM Initialization
# ---------------------------------------------------------------------------
# Pick your provider here - all three speak the OpenAI-compatible API:
#   "groq"   -> free + fast   (GROQ_API_KEY,   https://console.groq.com)
#   "gemini" -> free tier     (GEMINI_API_KEY, https://aistudio.google.com)
#   "openai" -> needs billing (OPENAI_API_KEY)
PROVIDER = "groq"
prefix = PROVIDER.upper()

# ② Initialize the LLM client pointed at the configured provider
llm = ChatOpenAI(
    model=os.getenv(f"{prefix}_MODEL"),
    api_key=os.getenv(f"{prefix}_API_KEY"),
    base_url=os.getenv(f"{prefix}_BASE_URL") or None,
    temperature=0,
    timeout=20.0,
)


# ---------------------------------------------------------------------------
# Tool Definitions
#   1. Type hints (city: str) -> tell the model WHAT arguments to pass
#   2. The docstring          -> tells the model WHEN to use this tool
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
# Build the Agent
# ---------------------------------------------------------------------------
# ③ Create the multi-tool LangChain agent with all 4 tools registered.
#   The system prompt instructs the model to state the final result clearly.
agent = create_agent(
    model=llm,
    tools=[get_weather, add, multiply, get_population],
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)

# ---------------------------------------------------------------------------
# Agent Execution Loop & Trace Inspection
# ---------------------------------------------------------------------------
for q in questions:
    print(f"\nQ: {q}")

    # ④ Invoke the multi-tool agent; returns the full conversation message list
    messages = agent.invoke({"messages": [{"role": "user", "content": q}]})["messages"]

    # ⑤ Print the execution trace: every tool the model requested and the result it received
    for m in messages:
        for call in getattr(m, "tool_calls", None) or []:
            print(f"   🔧 call   {call['name']}({call['args']})")
        if m.type == "tool":
            print(f"   📦 result {m.name} -> {m.content}")

    # ⑥ Extract and print the final synthesized answer
    print(f"A: {messages[-1].content}")
