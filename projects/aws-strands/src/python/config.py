"""Shared configuration: load .env so feature modules can read API keys.

This project is a study reference app — it serves example source code and
study material, so no API keys are required for basic operation.
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
