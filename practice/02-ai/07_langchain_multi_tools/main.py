"""LangChain Agent with Multiple Tools (with a visible tool trace).

Give the agent several tools and watch its loop:
read the question -> pick a tool -> call it -> read the result -> answer.
Each tool call is printed so you can see what happens inside.

Tip: an OpenAI 429 'insufficient_quota' error is a billing issue, not a bug -
keep PROVIDER = "groq" (free) to practise without OpenAI credits.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py   # runs six demo questions
    python main.py "What is 7 times 6?"

Run with Docker (from this folder):
    docker build -t 07_langchain_multi_tools .
    docker run --rm --env-file ../.env 07_langchain_multi_tools   # runs six demo questions
    docker run --rm --env-file ../.env 07_langchain_multi_tools "What is 7 times 6?"
"""

import os
import sys

from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Pick a provider - all three speak the OpenAI-compatible API
#    "groq"   -> free + fast   (GROQ_API_KEY,   https://console.groq.com)
#    "gemini" -> free tier     (GEMINI_API_KEY, https://aistudio.google.com)
#    "openai" -> needs billing (OPENAI_API_KEY)
PROVIDER = "groq"
prefix = PROVIDER.upper()

llm = ChatOpenAI(
    model=os.getenv(f"{prefix}_MODEL"),
    api_key=os.getenv(f"{prefix}_API_KEY"),
    base_url=os.getenv(f"{prefix}_BASE_URL") or None,
    temperature=0,
    timeout=20.0,
)


# 3. The tools: type hints say WHAT to pass, docstrings say WHEN to use them
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


# 4. Build the agent (model + tools + instructions)
#    The prompt asks for a clear final result so answers aren't vague.
agent = create_agent(
    model=llm,
    tools=[get_weather, add, multiply, get_population],
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)

# 5. Ask the CLI question, or six demo questions
questions = sys.argv[1:] or [
    "What is the weather like in New York?",                    # -> get_weather
    "What is 25 multiplied by 4?",                              # -> multiply
    "What is 137 plus 568?",                                    # -> add
    "What is the population of Bangalore?",                     # -> get_population
    "What's the weather in Tokyo, and what is 12 times 12?",    # -> two tools
    "Who wrote the play Romeo and Juliet?",                     # -> no tool needed
]
for q in questions:
    print(f"\nQ: {q}")

    # 5a. Run the agent; it returns the full message list of the conversation
    messages = agent.invoke({"messages": [{"role": "user", "content": q}]})["messages"]

    # 5b. Print the trace: every tool the model asked for, and what it got back
    for m in messages:
        for call in getattr(m, "tool_calls", None) or []:
            print(f"   🔧 call   {call['name']}({call['args']})")
        if m.type == "tool":
            print(f"   📦 result {m.name} -> {m.content}")

    # 5c. The last message is the final answer
    print(f"A: {messages[-1].content}")
