"""Natural Language Cloud / AWS Agent Service.

Demonstrates `use_aws` natural language cloud operations:
1. The prebuilt `use_aws` tool from `strands_tools` exposes the whole AWS API (via boto3) to the agent.
2. The agent translates a plain-English request into service_name + operation_name + parameters.
3. Calls run against the real AWS account of the configured credentials, so give them a read-only IAM policy.
   Mutating calls and secret reads ask for confirmation, which is refused in the server (no terminal).
"""

import os

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import use_aws

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class UseAwsRequest(BaseModel):
    """Input payload for Use AWS Agent."""

    prompt: str = "List all S3 buckets in my account"


class UseAwsResponse(BaseModel):
    """Output payload from Use AWS Agent."""

    prompt: str
    response: str
    operations_executed: list[str]


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


def run_use_aws_agent(prompt: str = "List all S3 buckets in my account") -> dict:
    """Run the Use AWS Agent."""
    # ③ Initialize the Strands Agent with the prebuilt use_aws tool and cloud assistant system prompt
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[use_aws],
        system_prompt="You are an AWS assistant that helps manage cloud resources.",
    )

    # ④ Execute the natural language AWS request
    response = agent(prompt)

    # ⑤ List the AWS API operations the agent chose (service, operation, parameters)
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {"prompt": prompt, "response": str(response), "operations_executed": tool_calls}
