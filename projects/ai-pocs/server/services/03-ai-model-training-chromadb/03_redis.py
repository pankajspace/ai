"""DeskBuddy — Tool-Calling Agent with Redis Session Memory Service.

This service demonstrates an autonomous tool-calling agent backed by per-session memory:
1. Connects to Redis (`redis.Redis`) to store and retrieve conversation history per `session_id`
   under `history:{session_id}` (falls back to an in-memory session dictionary when Redis is not running).
2. Exposes two tools (`calculator` and `get_datetime`) via OpenAI function-calling schemas (`TOOL_DEFS`).
3. Runs a bounded agent loop (max 5 laps safety fuse: Think -> Act -> Observe), executing requested tools
   and feeding results back until the LLM produces a final natural-language answer.
"""

import datetime
import json
import os

import redis
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv(find_dotenv())

_fallback_memory: dict[str, list[dict]] = {}
_redis_client = None
_redis_checked = False


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class RedisAgentRequest(BaseModel):
    """Input payload for DeskBuddy Redis memory agent."""

    session_id: str = "demo"
    message: str = "What is 23*47, and what time is it right now?"
    reset_session: bool = False


class RedisAgentToolCall(BaseModel):
    """Record of a single tool invocation during the agent loop."""

    tool: str
    args: dict
    result: dict


class RedisAgentResponse(BaseModel):
    """Output payload from DeskBuddy Redis memory agent."""

    session_id: str
    message: str
    answer: str
    tool_calls: list[RedisAgentToolCall]
    stored_messages_count: int
    storage_backend: str


# ---------------------------------------------------------------------------
# Step 1: Redis Memory Store (with In-Memory Fallback)
# ---------------------------------------------------------------------------
def _get_redis():
    """Return a connected Redis client if reachable, or None to use in-memory fallback."""
    global _redis_client, _redis_checked
    if _redis_checked:
        return _redis_client
    _redis_checked = True
    host = os.getenv("REDIS_HOST", "localhost")
    port = int(os.getenv("REDIS_PORT", "6379"))
    try:
        client = redis.Redis(host=host, port=port, decode_responses=True, socket_connect_timeout=1.5)
        client.ping()
        _redis_client = client
    except Exception:
        _redis_client = None
    return _redis_client


def _load_history(session_id: str) -> tuple[list[dict], str]:
    """Load conversation history for `session_id`."""
    key = f"history:{session_id}"
    r = _get_redis()
    if r is not None:
        return [json.loads(m) for m in r.lrange(key, 0, -1)], "redis"
    return list(_fallback_memory.get(key, [])), "in-memory (redis fallback)"


def _save_history(session_id: str, history: list[dict]) -> None:
    """Persist conversation history for `session_id`."""
    key = f"history:{session_id}"
    r = _get_redis()
    if r is not None:
        r.delete(key)
        for m in history:
            r.rpush(key, json.dumps(m))
    else:
        _fallback_memory[key] = list(history)


def _clear_history(session_id: str) -> None:
    """Delete conversation history for `session_id`."""
    key = f"history:{session_id}"
    r = _get_redis()
    if r is not None:
        r.delete(key)
    _fallback_memory.pop(key, None)


# ---------------------------------------------------------------------------
# Step 2: Tool Definitions & Execution
# ---------------------------------------------------------------------------
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
def run_redis_agent(
    session_id: str = "demo",
    message: str = "What is 23*47, and what time is it right now?",
    reset_session: bool = False,
) -> dict:
    """Run one turn of the DeskBuddy agent with per-session conversation memory."""
    # ① Optionally clear session history if requested
    if reset_session:
        _clear_history(session_id)
        if not message.strip():
            _, backend = _load_history(session_id)
            return {
                "session_id": session_id,
                "message": "",
                "answer": f"Session '{session_id}' memory cleared.",
                "tool_calls": [],
                "stored_messages_count": 0,
                "storage_backend": backend,
            }

    # ② Load this session's conversation history and append the new user message
    history, backend = _load_history(session_id)
    history.append({"role": "user", "content": message})

    llm = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        timeout=20.0,
    )
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # ③ Bounded agent loop (max 5 laps safety fuse)
    tool_calls_trace: list[dict] = []
    msg = None
    for _ in range(5):
        resp = llm.chat.completions.create(
            model=model,
            messages=history,
            tools=TOOL_DEFS,
        )
        msg = resp.choices[0].message

        if not msg.tool_calls:
            break  # LLM answered in words -> done

        history.append(msg.model_dump(exclude_none=True))
        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments)
            result = call_tool(tc.function.name, args)
            tool_calls_trace.append({
                "tool": tc.function.name,
                "args": args,
                "result": result,
            })
            history.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result),
            })

    # ④ Save updated conversation history back to Redis/memory and return response
    answer = (msg.content if msg else "") or ""
    history.append({"role": "assistant", "content": answer})
    _save_history(session_id, history)

    return {
        "session_id": session_id,
        "message": message,
        "answer": answer,
        "tool_calls": tool_calls_trace,
        "stored_messages_count": len(history),
        "storage_backend": backend,
    }

