"""OpenAI Chat Completion - Travel Guide.

This script demonstrates direct LLM chat completion using the official OpenAI API:
1. Loads API credentials and model configuration from environment variables (.env).
2. Defines the target city input (with alternative sample cities to try).
3. Initializes the OpenAI SDK client with a safety timeout.
4. Formats system and user messages to guide the LLM's persona and task.
5. Executes the OpenAI Chat Completions endpoint and prints the assistant's reply.

Run locally (from this folder):
    pip install -r requirements.txt
    python 01_chat_openai.py

Run with Docker Compose (from this folder):
    docker compose run --rm 01_chat_openai
"""

import os

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Automatically locate and load the nearest .env file
#   (in Docker, environment variables are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ② Pick a target city - change the value (or uncomment another line) to try a different input
# city = "Bangalore"
# city = "Paris"
# city = "Tokyo"
city = "New York"

# ---------------------------------------------------------------------------
# Client & Model Initialization
# ---------------------------------------------------------------------------
# ③ Initialize the OpenAI client (reads OPENAI_API_KEY / OPENAI_BASE_URL from environment)
#   and fetch the model identifier configured in .env (defaults to gpt-4o-mini)
client = OpenAI(timeout=15.0)
model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# ---------------------------------------------------------------------------
# Prompt Construction & Chat Completion
# ---------------------------------------------------------------------------
# ④ Build the conversation messages:
#   - system message: assigns the persona/tone ("witty travel guide")
#   - user message:   provides the specific prompt instruction
messages = [
    {"role": "system", "content": "You are a witty travel guide."},
    {"role": "user", "content": f"Suggest one thing to do in {city}."},
]

# ⑤ Call the Chat Completions API endpoint
response = client.chat.completions.create(model=model, messages=messages)

# ⑥ Extract and print the assistant's reply
print(f"City: {city}\n")
print(response.choices[0].message.content)
