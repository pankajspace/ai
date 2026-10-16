"""DeskBuddy — Tool-Calling Agent with Redis Session Memory.

This script demonstrates an autonomous tool-calling agent backed by persistent Redis session memory:
1. Connects to Redis (`redis.Redis`) to store and retrieve conversation history per `session_id`
   under `history:{session_id}` (automatically falls back to an in-memory dictionary if Redis is not running locally).
2. Exposes two tools (`calculator` and `get_datetime`) via OpenAI function-calling schemas (`TOOL_DEFS`).
3. Runs a bounded agent loop (max 5 laps safety fuse: Think -> Act -> Observe), executing requested tools
   and feeding results back until the LLM produces a final natural-language answer.
4. Demonstrates both multi-turn memory continuity within the same session and isolation across different sessions.

Run locally (from this folder):
    pip install -r requirements.txt
    python 03_redis.py

Run with Docker Compose (from this folder):
    docker compose run --rm 03_redis
"""

import datetime
import json
import os
import sys

import redis
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load API keys and model configuration from .env
load_dotenv(find_dotenv())

API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
if not API_KEY or API_KEY.startswith("sk-paste"):
    sys.exit(
        "\n[DeskBuddy] OPENAI_API_KEY is missing.\n"
        "  Fix: cp .env.example .env and set your real OPENAI_API_KEY.\n"
    )

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
BASE_URL = os.getenv("OPENAI_BASE_URL") or None
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

# ---------------------------------------------------------------------------
# Sample Inputs (Multi-Turn Session Conversations)
# ---------------------------------------------------------------------------
# ② Each tuple is (session_id, user_message). Uncomment another option to test different scenarios:

# Option 1: Multi-tool call + follow-up memory test + separate session isolation (default)
conversation_turns = [
    ("demo", "What is 23*47, and what time is it right now?"),
    ("demo", "Now double that multiplication result"),
    ("someone-else", "Now double that multiplication result"),
]

# Option 2: Multi-step trip budget calculation in a single session
# conversation_turns = [
#     ("trip-budget", "I am buying 4 flight tickets at 4850 rupees each and 3 hotel nights at 3200 rupees each. What is the total?"),
#     ("trip-budget", "Split that total equally among 4 friends. How much does each person pay?"),
# ]

# Option 3: Clock + arithmetic check
# conversation_turns = [
#     ("clock-check", "What is today's date and time, and what is (100 - 8) / 4?"),
# ]


# ---------------------------------------------------------------------------
# Step 1: Redis Memory Store (with Local In-Memory Fallback)
# ---------------------------------------------------------------------------
def get_memory_store():
    """Connect to Redis if reachable; otherwise fall back to an in-memory list store for local runs."""
    # ③ Probe Redis connection with ping(); use real Redis in Docker Compose or when local Redis is running
    try:
        client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        print(f"[DeskBuddy] Connected to Redis at {REDIS_HOST}:{REDIS_PORT} ✅")
        return client, True
    except Exception:
        print(f"[DeskBuddy] Redis not reachable at {REDIS_HOST}:{REDIS_PORT} — using in-memory fallback store")
        return {}, False


memory_store, using_redis = get_memory_store()


def load_history(session_id: str) -> list[dict]:
    """Load conversation history for `session_id` from Redis (or fallback store)."""
    key = f"history:{session_id}"
    if using_redis:
        return [json.loads(m) for m in memory_store.lrange(key, 0, -1)]
    return list(memory_store.get(key, []))


def save_history(session_id: str, history: list[dict]) -> None:
    """Persist conversation history for `session_id` back to Redis (or fallback store)."""
    key = f"history:{session_id}"
    if using_redis:
        memory_store.delete(key)
        for m in history:
            memory_store.rpush(key, json.dumps(m))
    else:
        memory_store[key] = list(history)


def reset_session(session_id: str) -> None:
    """Clear any previous history for `session_id` at the start of a fresh demo run."""
    key = f"history:{session_id}"
    if using_redis:
        memory_store.delete(key)
    else:
        memory_store.pop(key, None)


# ---------------------------------------------------------------------------
# Step 2: Tool Definitions & Execution
# ---------------------------------------------------------------------------
# ④ Tool menu shown to the LLM so it knows when and how to invoke each tool
TOOL_DEFS = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Evaluate a math expression, e.g. '23*47' or '(100-8)/4'",
            "parameters": {
                "type": "object",
                "properties": {"expression": {"type": "string"}},
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_datetime",
            "description": "Get the current date and time",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]


def call_tool(name: str, args: dict) -> dict:
    """Execute the requested tool (`calculator` or `get_datetime`)."""
    # ⑤ Run the requested tool and log the invocation trace
    print(f"   🔧 tool called: {name}({args})")
    try:
        if name == "calculator":
            expr = args.get("expression", "")
            result = eval(expr, {"__builtins__": {}})
            return {"result": result}
        if name == "get_datetime":
            return {"now": datetime.datetime.now().isoformat()}
        return {"error": f"unknown tool: {name}"}
    except Exception as e:
        return {"error": f"tool call failed: {e}"}


# ---------------------------------------------------------------------------
# Step 3: The Agent Loop (Think -> Act -> Observe -> Repeat)
# ---------------------------------------------------------------------------
llm = OpenAI(api_key=API_KEY, base_url=BASE_URL)


def chat(session_id: str, message: str) -> str:
    """Run one user turn with per-session conversation memory and bounded tool loop."""
    # ⑥ Load this session's conversation history from Redis and append the new user message
    history = load_history(session_id)
    history.append({"role": "user", "content": message})

    # ⑦ Agent loop with a 5-lap safety fuse so a confused model cannot call tools forever
    msg = None
    for _ in range(5):
        resp = llm.chat.completions.create(
            model=MODEL_NAME,
            messages=history,
            tools=TOOL_DEFS,
        )
        msg = resp.choices[0].message

        if not msg.tool_calls:
            break  # LLM answered in words -> done

        # Append assistant tool-call request and execute each requested tool
        history.append(msg.model_dump(exclude_none=True))
        for tc in msg.tool_calls:
            result = call_tool(tc.function.name, json.loads(tc.function.arguments))
            print(f"   📦 tool result: {result}")
            history.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result),
            })

    # ⑧ Save updated history back to Redis and return the assistant's final answer
    answer = (msg.content if msg else "") or ""
    history.append({"role": "assistant", "content": answer})
    save_history(session_id, history)
    return answer


# ---------------------------------------------------------------------------
# Execution
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Reset demo sessions before running so the multi-turn progression starts cleanly
    for sid in {s for s, _ in conversation_turns}:
        reset_session(sid)

    for turn_num, (session_id, user_message) in enumerate(conversation_turns, start=1):
        print(f"\n--- Turn {turn_num} [session_id={session_id!r}] ---")
        print(f"You : {user_message}")
        reply = chat(session_id, user_message)
        stored_count = len(load_history(session_id))
        print(f"Bot : {reply}")
        print(f"   (Redis key 'history:{session_id}' now stores {stored_count} messages)")

