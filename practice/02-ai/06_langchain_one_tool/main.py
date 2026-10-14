"""LangChain Agent with One Tool.

Same idea as 05_agent_one_tool.py, but LangChain's `create_agent` does the
loop for us. It reads the tool's type hints + docstring, calls the tool when
needed (weather questions) and answers other questions directly.

To try other questions, edit the list in step 2.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 06_langchain_one_tool .
    docker run --rm --env-file ../.env 06_langchain_one_tool
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - questions to ask; uncomment more lines to try them
questions = [
    "What is the weather like in New York?",   # -> get_weather
    "What is Scaler company?",                 # -> no tool needed
    # "Should I carry an umbrella in London today?",   # -> get_weather
    # "Compare the weather in Delhi and Mumbai.",      # -> get_weather twice
    # "Write a haiku about the rain.",                 # -> no tool needed
]

# 3. Pick a provider - all three speak the OpenAI-compatible API
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


# 4. The tool: type hints say WHAT to pass, the docstring says WHEN to use it
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is too hot to handle, 28 degrees C."


# 5. Build the agent (model + tools + instructions)
agent = create_agent(
    model=llm,
    tools=[get_weather],
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)

# 6. Run the agent on every question from step 2
for q in questions:
    # 6a. Run the agent; it returns the full message list of the conversation
    messages = agent.invoke({"messages": [{"role": "user", "content": q}]})["messages"]

    # 6b. A "tool" message in the list means a tool was called
    tool_called = any(m.type == "tool" for m in messages)

    # 6c. The last message is the final answer
    print(f"\nQ: {q}")
    print(f"Tool called: {'Yes' if tool_called else 'No'}")
    print(f"A: {messages[-1].content}")
