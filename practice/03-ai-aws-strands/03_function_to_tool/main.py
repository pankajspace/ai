"""Module 2 · Lesson 1 — Converting a Plain Function into an Agent Tool.

Demonstrates the three ingredients required to expose any Python function as a Strands tool:
1. `@tool` decorator: registers the function in the agent's tool catalog.
2. Type hints (`server_url: str -> str`): defines the parameter and return schema for the LLM.
3. Docstring: instructs the LLM on WHEN and HOW to invoke `check_server_status`.
4. Live HTTP health check: performs a GET request and feeds the status code back to the agent.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 03_function_to_tool .
    docker run --rm --env-file .env 03_function_to_tool
"""

import os

from dotenv import find_dotenv, load_dotenv
import requests
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Select a question to ask; uncomment another line to try a different query
question = "Is the staging server running? Check https://httpbin.org/get"
# question = "Can you verify if https://httpbin.org/status/200 is healthy?"
# question = "Check if https://invalid-domain-that-does-not-exist.test is online."
# question = "What is the status of https://httpbin.org/status/500?"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ---------------------------------------------------------------------------
# Tool Definitions
# ---------------------------------------------------------------------------
@tool                                              # 1. decorator: exposes function to the agent
def check_server_status(server_url: str) -> str:   # 2. type hints: defines parameter & return types
    """Check if a server is responding by making an HTTP request.

    Args:
        server_url: The URL of the server to check

    Returns:
        A message indicating whether the server is up or down
    """                                            # 3. docstring: guides the LLM on when to call it
    try:
        # ① Send an HTTP GET request with a 5-second timeout and report the status code
        response = requests.get(server_url, timeout=5)
        return f"Server is up. Status code: {response.status_code}"
    except requests.exceptions.RequestException:
        # ② Catch network or HTTP errors and return a readable diagnostic message
        return "Server is down or unreachable"


# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the Strands Agent with BedrockModel and the check_server_status tool
agent = Agent(model=BedrockModel(model_id=model_id), tools=[check_server_status])

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Run the agent on the user question and print the synthesized health report
print(f"Question: {question}\n" + "-" * 50)
response = agent(question)
print(response)

# ---------------------------------------------------------------------------
# TRY THIS EXPERIMENT (the best 2 minutes in this whole module):
# Change the docstring above to just  """Does a thing."""  and re-run.
# The agent will often STOP calling the tool.
# Why? The docstring is not a comment — it is the manual the MODEL reads
# to decide whether your tool is relevant. Vague docstring = unreliable agent.
# ---------------------------------------------------------------------------
