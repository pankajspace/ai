"""Module 2 · Lesson 5 — Pre-built community tools.

You don't have to write everything. strands_tools ships ready-made tools.
This also introduces the SYSTEM PROMPT: standing instructions that shape
the agent's behaviour on every request.

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

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - math problem to solve; uncomment another line to try a different query
query = "What's 42 raised to the power of 9?"
# query = "Solve the equation x^2 + 5x + 6 = 0"
# query = "What's the derivative of sin(x) * cos(x)?"
# query = "Calculate the square root of 144 multiplied by 17.5"
# query = "What is 15% of 850 plus 250?"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

# 4. Initialize agent with prebuilt calculator tool & system prompt
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[calculator],
    system_prompt="You are a helpful math assistant.",
)

print(f"Query: {query}\n" + "-" * 50)
response = agent(query)
print(response)
