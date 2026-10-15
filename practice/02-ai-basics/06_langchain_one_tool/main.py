"""LangChain Single-Tool Agent Demonstration.

This script demonstrates building a tool-calling agent with LangChain's `create_agent`:
1. Loads API credentials and provider configuration from environment variables (.env).
2. Defines a Python tool function (`get_weather`) whose type hints and docstring guide the LLM.
3. Uses `create_agent` to automate the tool-calling decision loop (`Think -> Act -> Observe`).
4. Inspects the returned message history to detect whether the tool was invoked.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 06_langchain_one_tool .
    docker run --rm --env-file .env 06_langchain_one_tool
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
    "What is the weather like in New York?",   # -> get_weather
    "What is Scaler company?",                 # -> no tool needed
    # "Should I carry an umbrella in London today?",   # -> get_weather
    # "Compare the weather in Delhi and Mumbai.",      # -> get_weather twice
    # "Write a haiku about the rain.",                 # -> no tool needed
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
# ---------------------------------------------------------------------------
# Type hints (city: str) tell the model WHAT arguments to pass;
# the docstring tells the model WHEN to invoke this tool.
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is too hot to handle, 28 degrees C."


# ---------------------------------------------------------------------------
# Build the Agent
# ---------------------------------------------------------------------------
# ③ Create the LangChain tool-calling agent with get_weather and system instructions
agent = create_agent(
    model=llm,
    tools=[get_weather],
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)

# ---------------------------------------------------------------------------
# Agent Execution Loop
# ---------------------------------------------------------------------------
for q in questions:
    # ④ Invoke the LangChain agent with the user's question
    messages = agent.invoke({"messages": [{"role": "user", "content": q}]})["messages"]

    # ⑤ Check whether any tool message appears in the execution trace
    tool_called = any(m.type == "tool" for m in messages)

    # ⑥ Extract and print the final assistant reply alongside the tool flag
    print(f"\nQ: {q}")
    print(f"Tool called: {'Yes' if tool_called else 'No'}")
    print(f"A: {messages[-1].content}")
