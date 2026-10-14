"""Natural Language Cloud / AWS Agent Service.

Demonstrates `use_aws` natural language cloud operations:
1. Translates natural language requests into AWS API operations.
2. Read-only safety guardrails (S3 bucket listing, caller identity, DynamoDB tables).
3. Connects to real AWS if credentials are configured; otherwise provides realistic cloud infrastructure simulation.

Run directly:
    python projects/ai-projects/server/services/19_use_aws.py
"""

import json
import os
from typing import Any, Dict, List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class UseAwsRequest(BaseModel):
    """Input payload for AWS Cloud Agent."""

    prompt: str = Field(
        default="List all S3 buckets in my account",
        description="Natural language instruction for AWS cloud management",
    )


class UseAwsResponse(BaseModel):
    """Output payload from AWS Cloud Agent."""

    prompt: str
    response: str
    operations_executed: List[str]
    cloud_data: Dict[str, Any]
    provider: str


MOCK_AWS_STATE = {
    "buckets": ["prod-ai-models-2026", "analytics-data-lake-raw", "techtoday-static-assets", "backups-us-east-1"],
    "region": "us-east-1",
    "account_id": "987654321098",
    "arn": "arn:aws:iam::987654321098:user/ai-projects-agent",
    "dynamodb_tables": ["Customers", "Orders", "AgentSessions"],
}


def execute_aws_operation(operation: str, params: dict = None) -> dict:
    """Execute an AWS operation via boto3 or fallback to simulated infrastructure."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    if aws_key and aws_secret:
        try:
            import boto3

            if operation == "list_s3_buckets":
                s3 = boto3.client("s3", region_name=region)
                resp = s3.list_buckets()
                buckets = [b["Name"] for b in resp.get("Buckets", [])]
                return {"status": "success", "buckets": buckets, "count": len(buckets), "live": True}
            elif operation == "get_caller_identity":
                sts = boto3.client("sts", region_name=region)
                ident = sts.get_caller_identity()
                return {"status": "success", "identity": ident, "live": True}
            elif operation == "list_dynamodb_tables":
                ddb = boto3.client("dynamodb", region_name=region)
                tables = ddb.list_tables().get("TableNames", [])
                return {"status": "success", "tables": tables, "live": True}
        except Exception as exc:
            print(f"Live AWS operation {operation} failed ({exc}), falling back to simulation")

    # Simulated AWS environment
    if operation == "list_s3_buckets":
        return {"status": "success", "buckets": MOCK_AWS_STATE["buckets"], "count": len(MOCK_AWS_STATE["buckets"]), "live": False}
    elif operation == "get_caller_identity":
        return {
            "status": "success",
            "identity": {
                "Account": MOCK_AWS_STATE["account_id"],
                "Arn": MOCK_AWS_STATE["arn"],
                "Region": MOCK_AWS_STATE["region"],
            },
            "live": False,
        }
    elif operation == "list_dynamodb_tables":
        return {"status": "success", "tables": MOCK_AWS_STATE["dynamodb_tables"], "live": False}
    return {"status": "success", "message": f"Simulated {operation} completed.", "live": False}


def run_use_aws_agent(prompt: str = "List all S3 buckets in my account") -> dict:
    """Run the natural language AWS agent."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    ops_recorded = []
    collected_data = {}

    if aws_key and aws_secret:
        try:
            from strands import Agent
            from strands.models.bedrock import BedrockModel
            from strands_tools import use_aws

            agent = Agent(
                model=BedrockModel(model_id=bedrock_model_id),
                tools=[use_aws],
                system_prompt="You are an AWS assistant that helps inspect and manage cloud resources safely.",
            )
            res = agent(prompt)
            ops_recorded.append("strands_tools.use_aws executed")
            return {
                "prompt": prompt,
                "response": str(res),
                "operations_executed": ops_recorded,
                "cloud_data": {"mode": "live_aws"},
                "provider": f"Strands use_aws + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Strands use_aws failed ({exc}), falling back to OpenAI agent")

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "use_aws",
                "description": "Execute read-only AWS queries: list_s3_buckets, get_caller_identity, or list_dynamodb_tables.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "operation": {
                            "type": "string",
                            "enum": ["list_s3_buckets", "get_caller_identity", "list_dynamodb_tables"],
                            "description": "The AWS operation to run",
                        }
                    },
                    "required": ["operation"],
                },
            },
        }
    ]

    messages = [
        {
            "role": "system",
            "content": "You are an AWS operations assistant. Use the use_aws tool to perform requested cloud inspections.",
        },
        {"role": "user", "content": prompt},
    ]

    for _ in range(5):
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            tools=tools_schema,
            tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return {
                "prompt": prompt,
                "response": msg.content or "",
                "operations_executed": ops_recorded,
                "cloud_data": collected_data,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (AWS Cloud Interface)",
            }

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments or "{}")
            op = args.get("operation", "list_s3_buckets")
            res_dict = execute_aws_operation(op)
            collected_data[op] = res_dict
            ops_recorded.append(f"use_aws(operation='{op}') -> {json.dumps(res_dict)}")
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(res_dict)})

    return {
        "prompt": prompt,
        "response": messages[-1].get("content", ""),
        "operations_executed": ops_recorded,
        "cloud_data": collected_data,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    out = run_use_aws_agent()
    print("Operations:", out["operations_executed"])
    print("Response:", out["response"])

