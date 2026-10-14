"""Module 1 · Lesson 2 — Same idea in LangGraph, WITH a tool.

Strands isn't the only framework. This uses LangGraph and adds a small tool,
so you can watch the agentic loop actually loop.

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

# 1. Load AWS and Bedrock configuration from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - prompt to send; uncomment another line to try a different input
prompt = "Please greet Alice and Bob."
# prompt = "Please greet Charlie, Diana, and Edward individually."
# prompt = "Say hello to Dr. Watson."
# prompt = "Hi there, who are you and what tools do you have?"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Define a simple tool
@tool
def greet(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}! Welcome to the world of AI agents."


# 5. Initialize the LLM via Bedrock Converse
llm = init_chat_model(
    model_id,
    model_provider="bedrock_converse",
)

# 6. Create a ReAct agent with the tool
agent = create_react_agent(model=llm, tools=[greet])

# 7. Run the agent and display execution steps
print(f"Prompt: {prompt}\n" + "-" * 50)
response = agent.invoke(
    {"messages": [{"role": "user", "content": prompt}]}
)

for message in response["messages"]:
    print(f"{message.type}: {message.text}")
