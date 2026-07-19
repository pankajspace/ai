"""Shared configuration: load .env and create model clients.

This module is the single place that knows about API keys and model names.
Every other module calls get_chat_model() or get_openai_client() instead of
constructing a client itself, so key and model management stays in one place.

Two kinds of client are exposed because the features need different tools:
  - get_chat_model()   → a LangChain ``ChatOpenAI`` for the summarizer and
                         memory chat, which are built as LangChain chains
                         (prompt | model | parser).
  - get_openai_client() → the raw ``openai`` client for the shop agent, whose
                         tool-calling loop is expressed most directly with the
                         native SDK.
"""

import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from openai import OpenAI

# Read key=value pairs from the .env file and inject them into os.environ.
# Safe to call at import time — if no .env exists (e.g. in production where
# env vars are set directly), python-dotenv simply does nothing.
load_dotenv()

# Every feature in this project uses the cheap, fast gpt-4o-mini model.
CHAT_MODEL = "gpt-4o-mini"


def get_chat_model(temperature: float = 0.7) -> ChatOpenAI:
    """Return a LangChain ChatOpenAI model.

    Args:
        temperature: Sampling temperature (0 = deterministic, 2 = very random).
                     Callers pick a lower value for factual tasks like
                     summarization and a higher one for open conversation.

    Returns:
        A ``ChatOpenAI`` instance ready to be composed into a LangChain chain.
    """
    return ChatOpenAI(model=CHAT_MODEL, temperature=temperature)


def get_openai_client() -> OpenAI:
    """Return a raw OpenAI client authenticated with OPENAI_API_KEY.

    Used by the shop agent, whose function-calling loop is written directly
    against the native OpenAI SDK rather than through LangChain.
    """
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
