"""Groq Chat - Joke Generator.

Groq hosts open-weights models (e.g. Llama 3.3 70B) behind an OpenAI-compatible
API, so the same `openai` client works - just point `base_url` at Groq.
To try another topic, change the value in step 2.

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

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    sys.exit("GROQ_API_KEY is not set in .env")

# 2. Inputs - change the value (or uncomment another line) to see a different output
topic = "programming"
# topic = "cats"
# topic = "coffee"
# topic = "Monday mornings"

# 3. Create an OpenAI client that talks to Groq instead of OpenAI
client = OpenAI(
    api_key=api_key,
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
    timeout=15.0,
)
model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# 4. Build the messages (system = persona, user = request)
messages = [
    {"role": "system", "content": "You are a funny joke teller."},
    {"role": "user", "content": f"Tell me a joke about {topic}."},
]

# 5. Call the Chat Completions API (same call as OpenAI)
response = client.chat.completions.create(model=model, messages=messages)

# 6. Print the joke
print(f"Topic: {topic}\n")
print(response.choices[0].message.content)
