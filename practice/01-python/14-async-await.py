import asyncio
import time

# Asynchronous coroutine simulating non-blocking network I/O
async def fetch_service_data(service_name: str, delay: float) -> dict:
    await asyncio.sleep(delay)  # Non-blocking pause
    return {"service": service_name, "status": "online", "latency_ms": int(delay * 1000)}

async def main():
    # Running multiple coroutines concurrently
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch_service_data("auth-service", 0.05),
        fetch_service_data("billing-service", 0.03),
        fetch_service_data("analytics-service", 0.01),
    )
    elapsed = time.perf_counter() - start

    for res in results:
        print(f"Service: {res['service']} | Status: {res['status']} ({res['latency_ms']}ms)")
    # Service: auth-service | Status: online (50ms)
    # Service: billing-service | Status: online (30ms)
    # Service: analytics-service | Status: online (10ms)

    # Elapsed time is approximately max(delays) ~0.05s, not sum(delays) 0.09s
    print(f"Concurrent fetch completed in {elapsed:.3f}s")
    # Concurrent fetch completed in 0.052s

    # Running a background task independently with create_task
    task = asyncio.create_task(fetch_service_data("metrics-collector", 0.02))
    bg_res = await task
    print(f"Background: {bg_res['service']} ({bg_res['latency_ms']}ms)")
    # Background: metrics-collector (20ms)

if __name__ == "__main__":
    asyncio.run(main())


# Interview question: Concurrent Service Health Checker
async def ping_endpoint(name: str, delay: float) -> tuple[str, str]:
    await asyncio.sleep(delay)
    return (name, "healthy")

async def check_all_services(endpoints: list[tuple[str, float]]) -> dict[str, str]:
    tasks = [ping_endpoint(name, delay) for name, delay in endpoints]
    results = await asyncio.gather(*tasks)
    return dict(results)

# Test cases
async def run_tests():
    services = [("auth", 0.02), ("db", 0.01), ("cache", 0.01)]
    status_map = await check_all_services(services)
    print(status_map)
    # {'auth': 'healthy', 'db': 'healthy', 'cache': 'healthy'}

    # Empty list test
    empty_res = await check_all_services([])
    print(empty_res)  # {}
    print("Service health checker passed!")  # Service health checker passed!

asyncio.run(run_tests())

