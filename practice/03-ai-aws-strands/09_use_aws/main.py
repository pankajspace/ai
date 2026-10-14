"""Module 2 · Lesson 7 — AWS integration with use_aws.

One tool, many services. use_aws translates plain English into AWS API calls.
You don't write boto3 code, don't handle AWS responses, and don't even
specify which operation to use. The agent works it out.

SAFETY: this script only does a READ-ONLY request (listing S3 buckets).
An empty list is a valid result, not an error.

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

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - AWS command in plain English; uncomment another line to try a different action
prompt = "List all S3 buckets in my account"
# prompt = "Show the current AWS region and account identity details"
# prompt = "Look up customer ID 12345 in the DynamoDB customers table and update their email to newemail@example.com"
# prompt = "Invoke the Lambda function 'order-processor' with order ID 67890"
# prompt = "List all DynamoDB tables available in my current AWS region"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

# 4. Initialize agent with use_aws tool
agent = Agent(
    model=BedrockModel(model_id=model_id),
    tools=[use_aws],
    system_prompt="You are an AWS assistant that helps manage cloud resources.",
)

print(f"Prompt: {prompt}\n" + "-" * 50)
response = agent(prompt)
print(response)
