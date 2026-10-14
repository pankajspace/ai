"""Module 2 · Lesson 1 — From a plain function to a tool.

THE CORE IDEA OF MODULE 2.

A normal Python function is invisible to an agent. To expose it, add 3 things:
    1. the @tool decorator   -> makes it available to agents
    2. type hints            -> tells the agent what data types to expect
    3. a proper docstring    -> tells the agent WHEN to use it

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

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - question to ask; uncomment another line to try a different query
question = "Is the staging server running? Check https://httpbin.org/get"
# question = "Can you verify if https://httpbin.org/status/200 is healthy?"
# question = "Check if https://invalid-domain-that-does-not-exist.test is online."
# question = "What is the status of https://httpbin.org/status/500?"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Tool definition
@tool                                              # 1. decorator
def check_server_status(server_url: str) -> str:   # 2. type hints
    """Check if a server is responding by making an HTTP request.

    Args:
        server_url: The URL of the server to check

    Returns:
        A message indicating whether the server is up or down
    """                                            # 3. docstring
    try:
        response = requests.get(server_url, timeout=5)
        return f"Server is up. Status code: {response.status_code}"
    except requests.exceptions.RequestException:
        return "Server is down or unreachable"


# 5. Initialize agent and execute query
agent = Agent(model=BedrockModel(model_id=model_id), tools=[check_server_status])

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
