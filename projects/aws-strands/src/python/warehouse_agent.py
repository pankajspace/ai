"""Module 2 demo — async tools (parallel execution).

Three warehouse lookups at ~2 seconds each would take ~6 seconds one by one.
By making the tool ``async`` and using ``agent.invoke_async()``, the calls run
in PARALLEL, so the whole thing takes about 2 seconds instead.
"""

import asyncio

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from config import MODEL_ID, agent_text


@tool
async def check_warehouse_inventory(product_id: str, warehouse: str) -> dict:
    """Check inventory at a specific warehouse.

    Args:
        product_id: Product ID to check
        warehouse: Warehouse identifier (e.g., "east", "west", "central")
    """
    # ① wait like a real warehouse api so parallel calls are visible
    # Simulate an API call delay so parallelism is observable.
    await asyncio.sleep(2)
    # ② use mock stock levels for each warehouse
    data = {
        "east":    {"PROD-123": 45, "PROD-456": 12},
        "west":    {"PROD-123": 30, "PROD-456": 0},
        "central": {"PROD-123": 60, "PROD-456": 25},
    }
    # ③ find the requested product at the requested warehouse
    quantity = data.get(warehouse, {}).get(product_id, 0)
    # ④ return a structured lookup result for the agent
    return {"warehouse": warehouse, "product_id": product_id, "quantity": quantity}


def lookup(question: str) -> str:
    """Answer a multi-warehouse question, running the lookups in parallel."""

    # ① define an async helper so Flask can run the agent from sync code
    async def run():
        # ① create an agent that can call the async warehouse lookup tool
        agent = Agent(
            model=BedrockModel(model_id=MODEL_ID),
            tools=[check_warehouse_inventory],
            callback_handler=None,
        )
        # ② invoke the agent asynchronously so tool calls can overlap
        return await agent.invoke_async(question)

    # ② start the event loop and return the cleaned final answer
    return agent_text(asyncio.run(run()))
