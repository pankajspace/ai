"""Shared configuration: load .env and create model clients.

This module is the single place that knows about API keys and model names.
Every other module calls get_chat_model() or get_embedder() instead of
constructing a client itself, so key and model management stays in one place.

Two kinds of client are exposed because the features need different tools:
  - get_chat_model()  → a LangChain ``ChatOpenAI`` for the RAG chain and
                         PDF chat, which are built as LangChain chains
                         (prompt | model).
  - get_embedder()    → a ``HuggingFaceEmbeddings`` instance used by the
                         vector store to embed documents and queries.
"""

import os

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI

# Read key=value pairs from the .env file and inject them into os.environ.
# Safe to call at import time — if no .env exists (e.g. in production where
# env vars are set directly), python-dotenv simply does nothing.
load_dotenv()

# Every LLM feature in this project uses the cheap, fast gpt-4o-mini model.
CHAT_MODEL = "gpt-4o-mini"

# Free, fast, 384-dimension sentence embedding model — runs locally, no API key.
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


def get_chat_model(temperature: float = 0) -> ChatOpenAI:
    """Return a LangChain ChatOpenAI model.

    Args:
        temperature: Sampling temperature (0 = deterministic, 2 = very random).
                     Defaults to 0 for factual RAG answers.

    Returns:
        A ``ChatOpenAI`` instance ready to be composed into a LangChain chain.
    """
    return ChatOpenAI(model=CHAT_MODEL, temperature=temperature)


def get_embedder() -> HuggingFaceEmbeddings:
    """Return a HuggingFace sentence embedding model.

    Uses ``all-MiniLM-L6-v2`` — a free, fast model that produces 384-dimension
    vectors. Runs entirely on the local CPU; no API key required.
    """
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
