"""Module 2 · Lesson 9 — Async Parallel Tool Execution (`invoke_async`).

Demonstrates concurrent asynchronous tool execution to reduce I/O latency:
1. Problem: Three sequential 2-second warehouse lookups take ~6 seconds total.
2. Solution: Define the tool with `async def` and invoke the agent via `await agent.invoke_async(query)`.
3. Tool: `check_warehouse_inventory(product_id: str, warehouse: str)` queries `east`, `west`, and `central` concurrently.
4. Measures and prints wall-clock elapsed time (~2s parallel vs ~6s sequential baseline).

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 11_async_tools .
    docker run --rm --env-file .env 11_async_tools
"""

import asyncio
import os
import time

from dotenv import find_dotenv, load_dotenv
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
# ② Select a multi-warehouse inventory inquiry; uncomment another line to test different requests
query = "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central."
# query = "Check warehouse inventory for PROD-456 across east, west, and central to see if we have 30 units."
# query = "Which warehouse has the highest stock of PROD-123: east, west, or central?"
# query = "Can we fulfill an order of 50 units for PROD-456 across all locations?"

# ③ Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ---------------------------------------------------------------------------
# Tool Definitions (Asynchronous)
# ---------------------------------------------------------------------------
@tool
async def check_warehouse_inventory(product_id: str, warehouse: str) -> dict:
    """Check inventory at a specific warehouse.

    Args:
        product_id: Product ID to check
        warehouse: Warehouse identifier (e.g., "east", "west", "central")
    """
    # ① Simulate a 2-second network I/O delay without blocking the asyncio event loop
    await asyncio.sleep(2)

    # ② Look up stock count for the requested warehouse and product SKU
    data = {
        "east":    {"PROD-123": 45, "PROD-456": 12},
        "west":    {"PROD-123": 30, "PROD-456": 0},
        "central": {"PROD-123": 60, "PROD-456": 25},
    }

    quantity = data.get(warehouse, {}).get(product_id, 0)
    return {"warehouse": warehouse, "product_id": product_id, "quantity": quantity}


# ---------------------------------------------------------------------------
# Async Agent Initialization & Execution
# ---------------------------------------------------------------------------
async def main():
    # ① Initialize the Strands Agent with the async warehouse inventory tool
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[check_warehouse_inventory],
    )
    print(f"Query: {query}\n" + "-" * 50)

    # ② Record start time and invoke the agent asynchronously so tool calls run in parallel
    start = time.time()
    response = await agent.invoke_async(query)
    elapsed = time.time() - start

    # ③ Extract and print the synthesized fulfillment answer and total wall-clock duration
    if hasattr(response, "message") and isinstance(response.message, dict) and "content" in response.message:
        print(response.message["content"][0]["text"])
    else:
        print(response)

    print(f"\nTotal time: {elapsed:.1f}s (sequential would be ~6s)")


if __name__ == "__main__":
    asyncio.run(main())
