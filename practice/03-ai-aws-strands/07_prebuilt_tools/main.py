"""Module 2 · Lesson 5 — Pre-Built Community Tools & System Prompts.

Demonstrates integrating ready-made `strands_tools` utilities with a standing system prompt:
1. Imports the pre-built `calculator` tool from `strands_tools` (powered by SymPy).
2. Configures a `system_prompt` ("You are a helpful math assistant.") to shape agent behavior.
3. Evaluates mathematical queries accurately via deterministic tool execution instead of LLM guessing.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 07_prebuilt_tools .
    docker run --rm --env-file .env 07_prebuilt_tools
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Select a math problem to solve; uncomment another line to try a different query
query = "What's 42 raised to the power of 9?"
# query = "Solve the equation x^2 + 5x + 6 = 0"
# query = "What's the derivative of sin(x) * cos(x)?"
# query = "Calculate the square root of 144 multiplied by 17.5"
# query = "What is 15% of 850 plus 250?"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the Strands Agent with the prebuilt calculator tool and a standing system prompt
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[calculator],
    system_prompt="You are a helpful math assistant.",
)

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Execute the math query and print the computed result
print(f"Query: {query}\n" + "-" * 50)
response = agent(query)
print(response)
