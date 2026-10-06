"""Shared configuration: load .env, build the Groq client, and describe the MCP server.

This module is the single place that knows about secrets, model names, and how
to start the cricket MCP server. Every feature module imports from here instead
of reading ``os.environ`` or constructing clients itself.
"""

import os
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from dotenv import load_dotenv
from mcp import StdioServerParameters
from openai import OpenAI

load_dotenv()


def get_env(name: str, default: str = "") -> str:
    """Return an environment variable, falling back to ``default``."""
    return os.environ.get(name, default)


# Groq speaks the same API format as OpenAI, so the ``openai`` package works
# once it points at Groq's URL. The model must support tool calling.
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
CHAT_MODEL = get_env("DEMO_MODEL", "openai/gpt-oss-20b")

# Upper bound on parallel agent runs per request; keeps the eval suite well
# under the 60 s Nginx proxy timeout without hammering the provider.
MAX_WORKERS = 8

# Temperatures selectable from the UI, keyed by the string the browser sends.
# The class code uses 0, so "0" is the default everywhere.
TEMPERATURE_CHOICES = {"0": 0.0, "0.7": 0.7, "1.2": 1.2}

# Start cricket_server.py (next to this file) over stdio with the same Python
# interpreter. The MCP SDK passes the child only a minimal environment, so API
# keys never reach the server process.
SERVER = StdioServerParameters(
    command=sys.executable,
    args=[str(Path(__file__).with_name("cricket_server.py"))],
)

_client = None


def get_groq_client() -> OpenAI:
    """Return a shared OpenAI-compatible client pointed at Groq."""
    global _client
    if _client is None:
        # ① read the API key lazily so the no-LLM demo runs without credentials
        api_key = get_env("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to your .env file "
                "(free key: https://console.groq.com/keys)."
            )
        # ② create one reusable client with a bounded timeout and retries
        _client = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL, timeout=30, max_retries=2)
    return _client


def parallel_map(fn, items):
    """Run ``fn`` over ``items`` concurrently, preserving input order."""
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        return list(pool.map(fn, items))
