"""Shared configuration: load .env and create API clients."""

import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

GROQ_BASE_URL = "https://api.groq.com/openai/v1"


def get_openai_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_groq_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url=GROQ_BASE_URL)
