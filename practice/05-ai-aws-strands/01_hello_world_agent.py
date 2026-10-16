"""Module 1 · Lesson 1 — Hello World Agent (AWS Strands + Amazon Bedrock).

Demonstrates the simplest possible autonomous agent:
1. Configures a foundation model (Amazon Nova Lite on Bedrock via `BedrockModel`).
2. Initializes a Strands `Agent` instance with an built-in agentic loop.
3. Calls the agent like a standard Python function (`agent(prompt)`).
4. Prints the final answer (with no tools attached, the agentic loop runs once).

Run locally (from this folder):
    pip install -r requirements.txt
    python 01_hello_world_agent.py

Run with Docker Compose (from this folder):
    docker compose run --rm 01_hello_world_agent
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent
from strands.models.bedrock import BedrockModel

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
#   (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Select a prompt to send; uncomment another line to try a different question
prompt = "Hello! Tell me a fun fact about AI agents."
# prompt = "What are the key differences between an LLM and an AI agent?"
# prompt = "Explain the concept of tool use in autonomous agents in one sentence."
# prompt = "Give me 3 practical everyday examples of AI agents in action."

# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ③ Configure the Bedrock foundation model (Amazon Nova Lite is fast and cost-effective)
model_id = os.getenv("BEDROCK_NOVA_LITE", os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0"))
model = BedrockModel(model_id=model_id)

# ④ Wrap the foundation model in a Strands Agent instance
agent = Agent(model=model)

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Execute the natural language prompt through the agentic loop and print the reply
print(f"Prompt: {prompt}\n" + "-" * 50)
response = agent(prompt)
print(response)
