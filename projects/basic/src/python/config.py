"""Shared configuration: load .env and create API clients.

This module is the single place that knows about API keys and base URLs.
Every other module calls get_openai_client() or get_groq_client() instead
of constructing the client themselves, so key management stays in one place.
"""

import os

from dotenv import load_dotenv
from openai import OpenAI

# Read key=value pairs from the .env file in the project root and inject
# them into os.environ.  This call is safe to make at import time — if no
# .env file exists (e.g. in production where env vars are set directly),
# python-dotenv simply does nothing.
load_dotenv()

# Groq exposes an OpenAI-compatible REST API at this base URL.  Because
# the interface is identical we can reuse the official `openai` package
# by just pointing it at a different host — no extra SDK required.
GROQ_BASE_URL = "https://api.groq.com/openai/v1"


def get_openai_client() -> OpenAI:
    """Return an OpenAI client authenticated with OPENAI_API_KEY."""
    # The OpenAI constructor reads api_key from the environment automatically
    # if you pass it explicitly, which makes the dependency visible at the
    # call site rather than relying on an implicit env lookup inside the SDK.
    # We dont need BASE_URL as its the default for OpenAI as https://api.openai.com/v1
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY")) 


def get_groq_client() -> OpenAI:
    """Return an OpenAI client pointed at the Groq API.

    The returned object is an instance of the standard ``openai.OpenAI``
    class — Groq's API is wire-compatible so no additional library is
    needed.  Only ``api_key`` and ``base_url`` differ from the OpenAI
    client above.
    """
    return OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url=GROQ_BASE_URL)
