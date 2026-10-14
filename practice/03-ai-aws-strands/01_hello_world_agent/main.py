"""Module 1 · Lesson 1 — The simplest possible agent (Strands + Bedrock).

Four lines is a whole agent:
  1. choose a model
  2. wrap it in an Agent
  3. call the agent like a function
  4. print the answer

There are no tools here, so the agentic loop runs exactly once.
This is the "before" picture for Module 2.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 01_hello_world_agent .
    docker run --rm --env-file .env 01_hello_world_agent
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent
from strands.models.bedrock import BedrockModel

# 1. Load AWS and Bedrock configuration from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - prompt to send; uncomment another line to try a different question
prompt = "Hello! Tell me a fun fact about AI agents."
# prompt = "What are the key differences between an LLM and an AI agent?"
# prompt = "Explain the concept of tool use in autonomous agents in one sentence."
# prompt = "Give me 3 practical everyday examples of AI agents in action."

# 3. Model configuration - Amazon Nova Lite is fast and cost-effective
model_id = os.getenv("BEDROCK_NOVA_LITE", os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0"))
model = BedrockModel(model_id=model_id)

# 4. Initialize agent and execute prompt
agent = Agent(model=model)

print(f"Prompt: {prompt}\n" + "-" * 50)
response = agent(prompt)
print(response)
