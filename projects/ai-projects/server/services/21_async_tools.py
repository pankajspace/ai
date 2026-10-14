"""Async Parallel Tools Agent Service.

Demonstrates parallel asynchronous tool execution:
1. Problem: Sequential tool invocations cause linear latency accumulation (e.g., 3 x 0.5s = 1.5s).
2. Solution: Concurrent async tool execution executes all lookups simultaneously (~0.5s total).
3. Tool: `check_warehouse_inventory(product_id: str, warehouse: str)` across `east`, `west`, `central`.
4. Measures and returns parallel execution duration vs sequential baseline.

Run directly:
    python projects/ai-projects/server/services/21_async_tools.py
"""

import asyncio
import json
import os
import time
from typing import Any, Dict, List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

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


WAREHOUSE_DATA = {
    "east": {"PROD-123": 45, "PROD-456": 10},
    "west": {"PROD-123": 35, "PROD-456": 0},
    "central": {"PROD-123": 50, "PROD-456": 20},
}


async def mock_async_warehouse_lookup(product_id: str, warehouse: str) -> dict:
    """Simulate a network-delayed warehouse database lookup."""
    # ① Simulate 300ms network I/O latency without blocking the event loop
    await asyncio.sleep(0.3)  # simulate network hop
    # ② Look up warehouse stock for the normalized product ID
    w = warehouse.lower().strip()
    p = product_id.upper().strip()
    qty = WAREHOUSE_DATA.get(w, {}).get(p, 0)
    return {"warehouse": w, "product_id": p, "stock": qty}


async def run_async_tools_agent_async(
    query: str = "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central.",
) -> dict:
    """Execute parallel warehouse queries asynchronously."""
    # ① Start timer and launch all three warehouse lookups concurrently via asyncio.gather
    start_time = time.perf_counter()

    warehouses = ["east", "west", "central"]
    tasks = [mock_async_warehouse_lookup("PROD-123", w) for w in warehouses]
    results = await asyncio.gather(*tasks)

    # ② Measure wall-clock parallel duration vs the sequential sum baseline
    duration = time.perf_counter() - start_time
    sequential_baseline = 0.3 * len(warehouses)

    # ③ Aggregate stock counts across all warehouses
    warehouse_map = {r["warehouse"]: r["stock"] for r in results}
    total_stock = sum(warehouse_map.values())
    tool_calls = [f"check_warehouse_inventory('PROD-123', '{w}') -> {qty} units" for w, qty in warehouse_map.items()]

    # ④ Pass aggregated warehouse data to the LLM to synthesize the fulfillment decision
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    prompt = (
        f"User query: '{query}'\n"
        f"Async warehouse check results:\n{json.dumps(warehouse_map, indent=2)}\n"
        f"Total available stock: {total_stock} units across all warehouses.\n"
        f"Summarize whether the requested order can be fulfilled and how much stock is in each location."
    )

    completion = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": "You are a logistics coordinator. Provide clear warehouse stock summaries."},
            {"role": "user", "content": prompt},
        ],
    )
    reply = completion.choices[0].message.content or ""

    # ⑤ Return the response, per-warehouse stock map, and timing comparison
    return {
        "query": query,
        "response": reply,
        "warehouse_results": warehouse_map,
        "parallel_duration_seconds": round(duration, 3),
        "sequential_baseline_seconds": round(sequential_baseline, 3),
        "tool_calls": tool_calls,
        "provider": f"Async Parallel Engine + OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


def run_async_tools_agent(
    query: str = "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central.",
) -> dict:
    """Synchronous entry point wrapping async loop."""
    try:
        # ① Check if an event loop is already running and dispatch accordingly
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(asyncio.run, run_async_tools_agent_async(query)).result()
        return loop.run_until_complete(run_async_tools_agent_async(query))
    except RuntimeError:
        # ② Start a fresh event loop when none is active in the current thread
        return asyncio.run(run_async_tools_agent_async(query))


if __name__ == "__main__":
    out = run_async_tools_agent()
    print(f"Parallel duration: {out['parallel_duration_seconds']}s (vs {out['sequential_baseline_seconds']}s sequential)")
    print("Warehouse Results:", out["warehouse_results"])
    print("Response:", out["response"])

