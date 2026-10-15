"""Async Parallel Tools Agent Service.

Demonstrates parallel asynchronous tool execution:
1. Problem: Sequential tool invocations cause linear latency accumulation (3 x 2s = 6s).
2. Solution: An `async` tool lets the agent run all lookups concurrently (~2s total).
3. Tool: `check_warehouse_inventory(product_id: str, warehouse: str)` across `east`, `west`, `central`.
4. Measures and returns the total duration (sequential would be ~6s).
"""

import asyncio
import os
import time

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class AsyncToolsRequest(BaseModel):
    """Input payload for Async Tools Agent."""

    query: str = "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central."


class AsyncToolsResponse(BaseModel):
    """Output payload from Async Tools Agent."""

    query: str
    response: str
    parallel_duration_seconds: float
    tool_calls: list[str]


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

    # ⑤ Collect the tool calls
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {
        "query": query,
        "response": str(response),
        "parallel_duration_seconds": round(elapsed, 1),
        "tool_calls": tool_calls,
    }
