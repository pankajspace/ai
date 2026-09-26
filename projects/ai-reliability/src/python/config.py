"""Shared configuration: load .env and build the OpenAI client.

This module is the single place that knows about secrets and model names.
Every feature module imports from here instead of reading ``os.environ`` or
constructing API clients itself.
"""

import os
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def get_env(name: str, default: str = "") -> str:
    """Return an environment variable, falling back to ``default``."""
    return os.environ.get(name, default)


# A NON-reasoning model: reasoning models think internally even when told not
# to, which erases the gaps these demos measure.
CHAT_MODEL = get_env("OPENAI_MODEL", "gpt-4o-mini")

# Upper bound on parallel API calls per request; keeps each demo well under
# the 60 s Nginx proxy timeout without hammering the provider.
MAX_WORKERS = 8

_client = None


def get_openai_client() -> OpenAI:
    """Return a shared OpenAI client built from OPENAI_API_KEY."""
    global _client
    if _client is None:
        api_key = get_env("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set. Add it to your .env file.")
        _client = OpenAI(api_key=api_key, timeout=30, max_retries=2)
    return _client


def parallel_map(fn, items):
    """Run ``fn`` over ``items`` concurrently, preserving input order."""
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        return list(pool.map(fn, items))


def bar(correct: int, total: int, width: int = 10) -> str:
    """Render a text accuracy bar with a count and percentage."""
    if total == 0:
        return "n/a"
    filled = round(correct / total * width)
    return f"{'█' * filled}{'░' * (width - filled)}  {correct}/{total} ({round(correct / total * 100)}%)"

