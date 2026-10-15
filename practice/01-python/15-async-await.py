"""Python Fundamentals - Asynchronous Programming with asyncio (async / await).

This script demonstrates non-blocking concurrent I/O execution using `asyncio`:
1. Defining asynchronous coroutines with `async def` and yielding control with `await`.
2. Running multiple I/O-bound coroutines concurrently via `asyncio.gather()`.
3. Scheduling independent background tasks on the event loop with `asyncio.create_task()`.
4. Bootstrapping the event loop from synchronous code with `asyncio.run()`.

Run directly:
    python practice/01-python/15-async-await.py
"""

import asyncio
import time

# ---------------------------------------------------------------------------
# 1. Defining Coroutines & Simulating Non-Blocking I/O
# ---------------------------------------------------------------------------
async def fetch_service_data(service_name: str, delay: float) -> dict:
    """Simulate an asynchronous network health check to a microservice.

    Args:
        service_name: Identifier of the target service.
        delay: Simulated network latency in seconds.

    Returns:
        Dictionary containing the service name, status, and latency in milliseconds.
    """
    # ① Yield control back to the event loop while waiting for simulated I/O
    await asyncio.sleep(delay)  # Non-blocking pause
    # ② Construct and return the response payload once the await completes
    return {"service": service_name, "status": "online", "latency_ms": int(delay * 1000)}


# ---------------------------------------------------------------------------
# 2. Concurrent Execution with asyncio.gather() and asyncio.create_task()
# ---------------------------------------------------------------------------
async def main():
    """Demonstrate concurrent coroutine execution and background task scheduling."""
    # ① Schedule multiple coroutines concurrently and await all results together
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch_service_data("auth-service", 0.05),
        fetch_service_data("billing-service", 0.03),
        fetch_service_data("analytics-service", 0.01),
    )
    elapsed = time.perf_counter() - start

    # ② Inspect results returned in the exact order the coroutines were passed to gather()
    for res in results:
        print(f"Service: {res['service']} | Status: {res['status']} ({res['latency_ms']}ms)")
    # Service: auth-service | Status: online (50ms)
    # Service: billing-service | Status: online (30ms)
    # Service: analytics-service | Status: online (10ms)

    # Elapsed time is approximately max(delays) ~0.05s, not sum(delays) 0.09s
    print(f"Concurrent fetch completed in {elapsed:.3f}s")
    # Concurrent fetch completed in 0.052s

    # ③ Schedule a background task immediately on the event loop with create_task()
    task = asyncio.create_task(fetch_service_data("metrics-collector", 0.02))
    bg_res = await task
    print(f"Background: {bg_res['service']} ({bg_res['latency_ms']}ms)")
    # Background: metrics-collector (20ms)


if __name__ == "__main__":
    asyncio.run(main())


# ---------------------------------------------------------------------------
# Interview Question / Problem: Concurrent Service Health Checker
# ---------------------------------------------------------------------------
async def ping_endpoint(name: str, delay: float) -> tuple[str, str]:
    """Ping a single service endpoint asynchronously and return its health tuple."""
    # ① Simulate non-blocking network round-trip
    await asyncio.sleep(delay)
    # ② Return (service_name, status) pair
    return (name, "healthy")


async def check_all_services(endpoints: list[tuple[str, float]]) -> dict[str, str]:
    """Check health of multiple endpoints concurrently and return a status dictionary.

    Args:
        endpoints: List of (service_name, delay_seconds) tuples.

    Returns:
        Dictionary mapping each service name to its health status string.
    """
    # ① Create a coroutine object for each endpoint tuple
    tasks = [ping_endpoint(name, delay) for name, delay in endpoints]
    # ② Unpack and run all coroutines concurrently via asyncio.gather()
    results = await asyncio.gather(*tasks)
    # ③ Convert the list of (name, status) tuples into a dictionary
    return dict(results)


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
async def run_tests():
    """Execute verification test cases for check_all_services."""
    services = [("auth", 0.02), ("db", 0.01), ("cache", 0.01)]
    status_map = await check_all_services(services)
    print(status_map)
    # {'auth': 'healthy', 'db': 'healthy', 'cache': 'healthy'}

    # Empty list test
    empty_res = await check_all_services([])
    print(empty_res)  # {}
    print("Service health checker passed!")  # Service health checker passed!


asyncio.run(run_tests())
