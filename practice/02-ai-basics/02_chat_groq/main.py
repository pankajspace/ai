"""Groq Chat Completion - Joke Generator.

This script demonstrates using an alternative high-speed LLM provider (Groq)
via the OpenAI-compatible client interface:
1. Groq hosts open-weights models (such as LLaMA 3.3 70B) with high inference speed.
2. Validates that `GROQ_API_KEY` is configured in the environment before calling.
3. Reuses the standard `openai.OpenAI` client by pointing `base_url` at Groq's endpoint.
4. Formats system persona and user topic messages and executes the chat completion call.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 02_chat_groq .
    docker run --rm --env-file .env 02_chat_groq
"""

import os
import sys

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Automatically locate and load the nearest .env file
#   (in Docker, environment variables are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ② Verify that the Groq API key is present in environment variables
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    sys.exit("GROQ_API_KEY is not set in .env")

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ③ Pick a joke topic - change the value (or uncomment another line) to see a different output
topic = "programming"
# topic = "cats"
# topic = "coffee"
# topic = "Monday mornings"

# ---------------------------------------------------------------------------
# Client & Model Initialization
# ---------------------------------------------------------------------------
# ④ Initialize the OpenAI SDK client configured for Groq's base URL and model
client = OpenAI(
    api_key=api_key,
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
    timeout=15.0,
)
model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# ---------------------------------------------------------------------------
# Prompt Construction & Chat Completion
# ---------------------------------------------------------------------------
# ⑤ Build the messages (system = persona, user = topic request)
messages = [
    {"role": "system", "content": "You are a funny joke teller."},
    {"role": "user", "content": f"Tell me a joke about {topic}."},
]

# ⑥ Call the Chat Completions API endpoint and print the generated joke
response = client.chat.completions.create(model=model, messages=messages)

print(f"Topic: {topic}\n")
print(response.choices[0].message.content)
