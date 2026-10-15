"""Module 1 · Lesson 2 — LangGraph ReAct Hello World Agent with a Tool.

Demonstrates the LangGraph tool-calling ReAct agentic loop on Amazon Bedrock:
1. Defines a custom tool `greet(name: str)` decorated with `@tool`.
2. Initializes the Bedrock Converse chat model via `init_chat_model`.
3. Builds a prebuilt ReAct agent (`create_react_agent`) equipped with the tool.
4. Executes the prompt, traces each intermediate message (Reason -> Act -> Observe),
   and synthesizes the final response.

WHAT TO LOOK FOR in the output:
    human: Please greet Alice and Bob.
    ai:                                  <-- EMPTY! the model chose to use a tool
    tool: Hello, Alice! ...              <-- the tool ran
    tool: Hello, Bob! ...                <-- and ran again
    ai: Done! I've greeted both...       <-- now it answers

That empty `ai:` line is the model deciding to act instead of replying.
That IS the agentic loop.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 02_hello_world_langgraph .
    docker run --rm --env-file .env 02_hello_world_langgraph
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.prebuilt import create_react_agent

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
#   (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Select a prompt to send; uncomment another line to try a different input
prompt = "Please greet Alice and Bob."
# prompt = "Please greet Charlie, Diana, and Edward individually."
# prompt = "Say hello to Dr. Watson."
# prompt = "Hi there, who are you and what tools do you have?"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ---------------------------------------------------------------------------
# Tool Definitions
# ---------------------------------------------------------------------------
@tool
def greet(name: str) -> str:
    """Greet someone by name."""
    # ① Format and return a personalized greeting string for the given name
    return f"Hello, {name}! Welcome to the world of AI agents."


# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the LLM via Amazon Bedrock Converse provider
llm = init_chat_model(
    model_id,
    model_provider="bedrock_converse",
)

# ⑤ Create a LangGraph ReAct agent bound to the greet tool
agent = create_react_agent(model=llm, tools=[greet])

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑥ Invoke the ReAct agent loop and inspect every message turn (human, ai, tool)
print(f"Prompt: {prompt}\n" + "-" * 50)
response = agent.invoke(
    {"messages": [{"role": "user", "content": prompt}]}
)

for message in response["messages"]:
    print(f"{message.type}: {message.text}")
