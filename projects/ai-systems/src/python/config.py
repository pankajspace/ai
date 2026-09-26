"""Shared configuration: load .env and provide multi-model API clients.

This module is the single place that knows about API keys, base URLs, and model names.
Supports OpenAI, Google Gemini, and Groq/Grok OpenAI-compatible clients.
"""

import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def get_env(name: str, default: str = "") -> str:
    """Return an environment variable, falling back to ``default``."""
    return os.environ.get(name, default)


OPENAI_MODEL = get_env("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL = get_env("GEMINI_MODEL", "gemini-3.6-flash")
GROK_MODEL = get_env("GROK_MODEL") or get_env("GROQ_MODEL", "openai/gpt-oss-20b")

# Temperatures selectable from the UI, keyed by the string the browser sends.
TEMPERATURE_CHOICES = {"0": 0.0, "0.7": 0.7, "1.2": 1.2}

_openai_client = None
_gemini_client = None
_grok_client = None


def get_openai_client() -> OpenAI:
    """Return an authenticated OpenAI client."""
    global _openai_client
    if _openai_client is None:
        api_key = get_env("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. Add it to your .env file or environment."
            )
        _openai_client = OpenAI(api_key=api_key)
    return _openai_client


def get_gemini_client() -> OpenAI:
    """Return an OpenAI client configured for Google Gemini's OpenAI-compatible endpoint."""
    global _gemini_client
    if _gemini_client is None:
        api_key = get_env("GEMINI_API_KEY")
        if not api_key:
            # Fallback to OpenAI client if Gemini key is missing
            return get_openai_client()
        base_url = get_env(
            "GEMINI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        _gemini_client = OpenAI(api_key=api_key, base_url=base_url)
    return _gemini_client


def get_grok_client() -> OpenAI:
    """Return an OpenAI client configured for Groq / Grok's OpenAI-compatible endpoint."""
    global _grok_client
    if _grok_client is None:
        api_key = get_env("GROK_API_KEY") or get_env("GROQ_API_KEY")
        if not api_key:
            # Fallback to OpenAI client if Groq/Grok key is missing
            return get_openai_client()
        default_base_url = (
            "https://api.groq.com/openai/v1"
            if api_key.startswith("gsk_")
            else "https://api.x.ai/v1"
        )
        base_url = get_env("GROK_BASE_URL") or get_env(
            "GROQ_BASE_URL", default_base_url
        )
        _grok_client = OpenAI(api_key=api_key, base_url=base_url)
    return _grok_client


def get_client_and_model(model_choice: str = None):
    """Returns (client, model_name, provider_name) based on user selection or defaults.

    Supports:
      - 'openai' -> (get_openai_client(), OPENAI_MODEL, "OpenAI")
      - 'gemini' -> (get_gemini_client(), GEMINI_MODEL, "Gemini")
      - 'groq'   -> (get_grok_client(), GROK_MODEL, "Groq")
      - 'gpt-4o' -> (get_openai_client(), "gpt-4o", "OpenAI")
    """
    choice = (model_choice or "openai").lower().strip()
    if "gemini" in choice:
        return get_gemini_client(), GEMINI_MODEL, "Gemini"
    elif "groq" in choice or "grok" in choice or "llama" in choice or "oss" in choice:
        return get_grok_client(), GROK_MODEL, "Groq"
    elif "gpt-4o" in choice and "mini" not in choice:
        return get_openai_client(), "gpt-4o", "OpenAI"
    else:
        return get_openai_client(), OPENAI_MODEL, "OpenAI"
