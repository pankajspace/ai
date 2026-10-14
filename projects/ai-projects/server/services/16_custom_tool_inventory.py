"""Custom Inventory Tool Agent Service.

Demonstrates building domain-specific custom tools:
1. Simulates an internal proprietary system or inventory database.
2. Custom tool `check_inventory(product_id: str)` with strict typing & docstrings.
3. Natural language query resolution against mock product inventory.

Run directly:
    python projects/ai-projects/server/services/16_custom_tool_inventory.py
"""

import json
import os
from typing import List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class CustomInventoryRequest(BaseModel):
    """Input payload for Custom Inventory Agent."""

    question: str = Field(
        default="Is PROD-123 in stock?",
        description="Natural language question about product availability",
    )


class CustomInventoryResponse(BaseModel):
    """Output payload from Custom Inventory Agent."""

    question: str
    response: str
    tool_calls: List[str]
    provider: str


INVENTORY = {
    "PROD-123": 15,
    "PROD-456": 0,
    "PROD-789": 8,
    "PROD-999": 0,
}


def check_inventory(product_id: str) -> str:
    """Check if a product is in stock."""
    pid = product_id.upper().strip()
    qty = INVENTORY.get(pid, 0)
    if pid not in INVENTORY:
        return f"Product {pid} not found in inventory catalog."
    if qty > 0:
        return f"Product {pid} is in stock. We have {qty} units available."
    return f"Product {pid} is currently out of stock."


def run_custom_inventory_agent(question: str = "Is PROD-123 in stock?") -> dict:
    """Run the Custom Inventory Agent."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_calls_recorded = []

    if aws_key and aws_secret:
        try:
            from strands import Agent, tool
            from strands.models.bedrock import BedrockModel

            @tool
            def check_inv(product_id: str) -> str:
                """Check if a product is in stock in the inventory."""
                res = check_inventory(product_id)
                tool_calls_recorded.append(f"check_inventory('{product_id}') -> {res}")
                return res

            agent = Agent(model=BedrockModel(model_id=bedrock_model_id), tools=[check_inv])
            reply = agent(question)
            return {
                "question": question,
                "response": str(reply),
                "tool_calls": tool_calls_recorded,
                "provider": f"Strands + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Strands Bedrock inventory failed ({exc}), falling back to OpenAI")

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "check_inventory",
                "description": "Check if a product ID (e.g. 'PROD-123', 'PROD-456', 'PROD-789') is currently in stock.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string", "description": "The product ID to look up (e.g. PROD-123)"}
                    },
                    "required": ["product_id"],
                },
            },
        }
    ]

    messages = [
        {
            "role": "system",
            "content": "You are an inventory assistant. Always check product availability using the check_inventory tool.",
        },
        {"role": "user", "content": question},
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
                "question": question,
                "response": msg.content or "",
                "tool_calls": tool_calls_recorded,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Custom Tool)",
            }

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments or "{}")
            pid = args.get("product_id", "PROD-123")
            out = check_inventory(pid)
            tool_calls_recorded.append(f"check_inventory('{pid}') -> {out}")
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": out})

    return {
        "question": question,
        "response": messages[-1].get("content", ""),
        "tool_calls": tool_calls_recorded,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    res = run_custom_inventory_agent()
    print("Tool calls:", res["tool_calls"])
    print("Response:", res["response"])

