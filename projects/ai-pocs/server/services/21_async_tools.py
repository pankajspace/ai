"""Async Parallel Tools Agent Service.

Demonstrates parallel asynchronous tool execution:
1. Problem: Sequential tool invocations cause linear latency accumulation (3 x 2s = 6s).
2. Solution: An `async` tool lets the agent run all lookups concurrently (~2s total).
3. Tool: `check_warehouse_inventory(product_id: str, warehouse: str)` across `east`, `west`, `central`.
4. Measures and returns the total duration vs the sequential estimate.

Run directly:
    python projects/ai-pocs/server/services/21_async_tools.py
"""

import asyncio
import json
import os
import time
from typing import Any, Dict, List

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class AsyncToolsRequest(BaseModel):
    """Input payload for Async Tools Agent."""

    query: str = Field(
        default="Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central.",
        description="Query requesting multi-warehouse inventory check",
    )


class AsyncToolsResponse(BaseModel):
    """Output payload from Async Tools Agent."""

    query: str
    response: str
    warehouse_results: Dict[str, Any]
    parallel_duration_seconds: float
    sequential_baseline_seconds: float
    tool_calls: List[str]
    provider: str


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool
async def check_warehouse_inventory(product_id: str, warehouse: str) -> dict:
    """Check inventory at a specific warehouse.

    Args:
        product_id: Product ID to check
        warehouse: Warehouse identifier (e.g., "east", "west", "central")
    """
    # Simulate a 2-second network I/O delay without blocking the asyncio event loop
    await asyncio.sleep(2)

    # Look up stock count for the requested warehouse and product SKU
    data = {
        "east":    {"PROD-123": 45, "PROD-456": 12},
        "west":    {"PROD-123": 30, "PROD-456": 0},
        "central": {"PROD-123": 60, "PROD-456": 25},
    }

    quantity = data.get(warehouse, {}).get(product_id, 0)
    return {"warehouse": warehouse, "product_id": product_id, "quantity": quantity}


async def run_async_tools_agent(
    query: str = "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central.",
) -> dict:
    """Run the Async Tools Agent."""
    # ③ Initialize the Strands Agent with the async warehouse inventory tool
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[check_warehouse_inventory],
    )

    # ④ Record start time and invoke the agent asynchronously so tool calls run in parallel
    start = time.time()
    response = await agent.invoke_async(query)
    elapsed = time.time() - start

    # ⑤ Collect the tool calls and their results (dict results are stored as JSON text)
    blocks = [block for message in agent.messages for block in message["content"]]
    tool_calls = [f"{b['toolUse']['name']}({b['toolUse']['input']})" for b in blocks if "toolUse" in b]
    results = [
        json.loads(b["toolResult"]["content"][0]["text"])
        for b in blocks
        if "toolResult" in b and b["toolResult"]["status"] == "success"
    ]

    return {
        "query": query,
        "response": str(response),
        "warehouse_results": {r["warehouse"]: r["quantity"] for r in results},
        "parallel_duration_seconds": round(elapsed, 1),
        # Run one after another, every extra 2-second lookup would add 2 more seconds
        "sequential_baseline_seconds": round(elapsed + 2 * max(len(tool_calls) - 1, 0), 1),
        "tool_calls": tool_calls,
        "provider": f"Strands Async Tools + Bedrock ({model_id})",
    }


if __name__ == "__main__":
    out = asyncio.run(run_async_tools_agent())
    print("Response:", out["response"])
    print(f"\nTotal time: {out['parallel_duration_seconds']}s (sequential would be ~{out['sequential_baseline_seconds']}s)")
