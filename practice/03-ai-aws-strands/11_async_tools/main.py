"""Module 2 · Lesson 9 — Async tools (parallel execution).

THE PROBLEM:
Three warehouse lookups at 2 seconds each = 6 seconds if done one by one.

THE FIX:
Make the tool `async` and use agent.invoke_async(). The three calls run in
PARALLEL, so the whole thing takes about 2 seconds instead of 6.

WATCH THE PRINTED TIMING at the end — that IS the lesson.

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

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - warehouse inventory inquiry; uncomment another line to test different requests
query = "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central."
# query = "Check warehouse inventory for PROD-456 across east, west, and central to see if we have 30 units."
# query = "Which warehouse has the highest stock of PROD-123: east, west, or central?"
# query = "Can we fulfill an order of 50 units for PROD-456 across all locations?"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Async tool definition
@tool
async def check_warehouse_inventory(product_id: str, warehouse: str) -> dict:
    """Check inventory at a specific warehouse.

    Args:
        product_id: Product ID to check
        warehouse: Warehouse identifier (e.g., "east", "west", "central")
    """
    # Simulate an API call delay
    await asyncio.sleep(2)

    data = {
        "east":    {"PROD-123": 45, "PROD-456": 12},
        "west":    {"PROD-123": 30, "PROD-456": 0},
        "central": {"PROD-123": 60, "PROD-456": 25},
    }

    quantity = data.get(warehouse, {}).get(product_id, 0)
    return {"warehouse": warehouse, "product_id": product_id, "quantity": quantity}


async def main():
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[check_warehouse_inventory],
    )
    print(f"Query: {query}\n" + "-" * 50)
    start = time.time()
    response = await agent.invoke_async(query)
    elapsed = time.time() - start

    if hasattr(response, "message") and isinstance(response.message, dict) and "content" in response.message:
        print(response.message["content"][0]["text"])
    else:
        print(response)

    print(f"\nTotal time: {elapsed:.1f}s (sequential would be ~6s)")


if __name__ == "__main__":
    asyncio.run(main())
