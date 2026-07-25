"""Shared configuration: load .env so feature modules can read API keys.

This module is the single place that knows about secrets and model names.
Every other module imports from here instead of reading ``os.environ`` or
constructing API clients itself, so key and model management stays in one
place.

The ``quiz`` feature needs no keys, so nothing below is required to
run the project. When you add an AI feature, uncomment the client helper (or
add your own) and list the key in ``.env.example``.
"""

import os

from dotenv import load_dotenv

# Read key=value pairs from the .env file and inject them into os.environ.
# Safe to call at import time — if no .env exists (e.g. in production where
# env vars are set directly), python-dotenv simply does nothing.
load_dotenv()


def get_env(name: str, default: str = "") -> str:
    """Return an environment variable, falling back to ``default``.

    Use this for optional configuration values. For required secrets, raise
    a clear error at the boundary instead of silently defaulting.
    """
    return os.environ.get(name, default)


# ---------------------------------------------------------------------------
# Example: wiring up an OpenAI client (uncomment and add ``openai`` to
# requirements.txt + OPENAI_API_KEY to .env.example when you need it).
# ---------------------------------------------------------------------------
#
# from openai import OpenAI
#
# CHAT_MODEL = "gpt-4o-mini"
#
# def get_openai_client() -> OpenAI:
#     """Return an OpenAI client built from OPENAI_API_KEY in the environment."""
#     api_key = os.environ.get("OPENAI_API_KEY")
#     if not api_key:
#         raise RuntimeError("OPENAI_API_KEY is not set. Add it to your .env file.")
#     return OpenAI(api_key=api_key)
