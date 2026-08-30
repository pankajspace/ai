"""Shared configuration: load .env, build API clients for Groq / OpenAI.

This module is the single place that knows about secrets and model names.
Every other module imports from here instead of reading ``os.environ`` or
constructing API clients itself, so key and model management stays in one
place.

Provider priority:
    1. Groq (free tier) — ``GROQ_API_KEY``
    2. OpenAI — ``OPENAI_API_KEY``
    3. None — deterministic-only mode (tools still work, LLM feedback disabled)
"""

import os

from dotenv import load_dotenv

# Read key=value pairs from the .env file and inject them into os.environ.
# Safe to call at import time — if no .env exists (e.g. in production where
# env vars are set directly), python-dotenv simply does nothing.
load_dotenv()


def get_env(name: str, default: str = "") -> str:
    """Return an environment variable, falling back to ``default``."""
    return os.environ.get(name, default)


# ---------------------------------------------------------------------------
# LLM provider configuration
# ---------------------------------------------------------------------------

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")


def get_openai_client():
    """Return an OpenAI-compatible client using Groq first, OpenAI second.

    Returns:
        A tuple of ``(client, model_name)`` or ``(None, None)`` when no API
        key is available.
    """
    from openai import OpenAI

    if GROQ_API_KEY:
        return (
            OpenAI(
                api_key=GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
            ),
            "openai/gpt-oss-20b",
        )

    if OPENAI_API_KEY:
        return OpenAI(api_key=OPENAI_API_KEY), "gpt-4o-mini"

    return None, None
