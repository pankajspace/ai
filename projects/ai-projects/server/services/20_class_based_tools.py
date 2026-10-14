"""Class-Based Tools (Shared-Resource Pattern) Agent Service.

Demonstrates class-based tools that share state and resources across calls:
1. Architectural Problem: Individual tool functions opening separate DB connections flood databases.
2. The Solution: Group related tools in a class instance sharing single state/connection pool.
3. Class `InventoryService`:
   - `check_stock(product_id: str)`
   - `update_stock(product_id: str, quantity: int)`
4. Handles multi-step state mutations within a single conversation session.

Run directly:
    python projects/ai-projects/server/services/20_class_based_tools.py
"""

import json
import os
from typing import Any, Dict, List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class ClassBasedToolsRequest(BaseModel):
    """Input payload for Class-Based Tools Agent."""

    query: str = Field(
        default="Update PROD-456 stock to 25 units, then confirm the new level",
        description="Query requesting inventory check or state modification",
    )


class ClassBasedToolsResponse(BaseModel):
    """Output payload from Class-Based Tools Agent."""

    query: str
    response: str
    tool_calls: List[str]
    current_inventory: Dict[str, int]
    provider: str


class InventoryService:
    """Simulated stateful database connection pool."""

    def __init__(self):
        self.inventory: Dict[str, int] = {
            "PROD-123": 15,
            "PROD-456": 0,
            "PROD-789": 8,
        }

    def check_stock(self, product_id: str) -> str:
        """Check the current stock level."""
        pid = product_id.upper().strip()
        qty = self.inventory.get(pid, None)
        if qty is None:
            return f"Product {pid} not found in database."
        return f"Product {pid} currently has {qty} units in stock."

    def update_stock(self, product_id: str, quantity: int) -> str:
        """Update stock quantity in the shared state store."""
        pid = product_id.upper().strip()
        self.inventory[pid] = quantity
        return f"Successfully updated stock for {pid} to {quantity} units."


# Global shared instance representing connection pool
_inventory_service_instance = InventoryService()


def run_class_based_tools_agent(
    query: str = "Update PROD-456 stock to 25 units, then confirm the new level",
) -> dict:
    """Run the Class-Based Tools Agent."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_calls_recorded = []

    if aws_key and aws_secret:
        try:
            from strands import Agent, tool
            from strands.models.bedrock import BedrockModel

            @tool
            def check_stock_tool(product_id: str) -> str:
                """Check current stock level."""
                res = _inventory_service_instance.check_stock(product_id)
                tool_calls_recorded.append(f"InventoryService.check_stock('{product_id}') -> {res}")
                return res

            @tool
            def update_stock_tool(product_id: str, quantity: int) -> str:
                """Update stock level."""
                res = _inventory_service_instance.update_stock(product_id, quantity)
                tool_calls_recorded.append(f"InventoryService.update_stock('{product_id}', {quantity}) -> {res}")
                return res

            agent = Agent(
                model=BedrockModel(model_id=bedrock_model_id),
                tools=[check_stock_tool, update_stock_tool],
            )
            res = agent(query)
            return {
                "query": query,
                "response": str(res),
                "tool_calls": tool_calls_recorded,
                "current_inventory": dict(_inventory_service_instance.inventory),
                "provider": f"Strands Class-Based + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Strands Bedrock class tools failed ({exc}), falling back to OpenAI")

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "check_stock",
                "description": "Check current stock level for a product ID.",
                "parameters": {
                    "type": "object",
                    "properties": {"product_id": {"type": "string", "description": "e.g. PROD-123"}},
                    "required": ["product_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "update_stock",
                "description": "Update inventory quantity for a product ID in the database.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string", "description": "e.g. PROD-456"},
                        "quantity": {"type": "integer", "description": "New quantity level"},
                    },
                    "required": ["product_id", "quantity"],
                },
            },
        },
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a warehouse management assistant. Use check_stock and update_stock to view or mutate product stock levels.",
        },
        {"role": "user", "content": query},
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
                "query": query,
                "response": msg.content or "",
                "tool_calls": tool_calls_recorded,
                "current_inventory": dict(_inventory_service_instance.inventory),
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Class-Based Tools)",
            }

        for tc in msg.tool_calls:
            fname = tc.function.name
            args = json.loads(tc.function.arguments or "{}")
            if fname == "check_stock":
                res = _inventory_service_instance.check_stock(args.get("product_id", ""))
                tool_calls_recorded.append(f"check_stock('{args.get('product_id')}') -> {res}")
            elif fname == "update_stock":
                res = _inventory_service_instance.update_stock(args.get("product_id", ""), args.get("quantity", 0))
                tool_calls_recorded.append(f"update_stock('{args.get('product_id')}', {args.get('quantity')}) -> {res}")
            else:
                res = f"Unknown tool: {fname}"

            messages.append({"role": "tool", "tool_call_id": tc.id, "content": res})

    return {
        "query": query,
        "response": messages[-1].get("content", ""),
        "tool_calls": tool_calls_recorded,
        "current_inventory": dict(_inventory_service_instance.inventory),
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    out = run_class_based_tools_agent()
    print("Calls:", out["tool_calls"])
    print("Inventory:", out["current_inventory"])
    print("Response:", out["response"])

