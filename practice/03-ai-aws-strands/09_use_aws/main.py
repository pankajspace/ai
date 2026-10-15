"""Module 2 · Lesson 7 — Natural Language Cloud Operations with `use_aws`.

Demonstrates natural language AWS management using the pre-built `use_aws` tool:
1. Translates plain-English cloud queries into AWS service API calls without hand-written `boto3` code.
2. Uses a read-only default prompt (listing S3 buckets) for safe cloud inspection.
3. Formats the raw AWS API response into a clear human-readable summary.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 09_use_aws .
    docker run --rm --env-file .env 09_use_aws
"""

import os

from dotenv import find_dotenv, load_dotenv
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import use_aws

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Select an AWS command in plain English; uncomment another line to try a different action
prompt = "List all S3 buckets in my account"
# prompt = "Show the current AWS region and account identity details"
# prompt = "Look up customer ID 12345 in the DynamoDB customers table and update their email to newemail@example.com"
# prompt = "Invoke the Lambda function 'order-processor' with order ID 67890"
# prompt = "List all DynamoDB tables available in my current AWS region"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

# ---------------------------------------------------------------------------
# Model & Agent Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the Strands Agent with the prebuilt use_aws tool and cloud assistant system prompt
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[use_aws],
    system_prompt="You are an AWS assistant that helps manage cloud resources.",
)

# ---------------------------------------------------------------------------
# Agent Execution
# ---------------------------------------------------------------------------
# ⑤ Execute the natural language AWS request and print the cloud inspection result
print(f"Prompt: {prompt}\n" + "-" * 50)
response = agent(prompt)
print(response)
