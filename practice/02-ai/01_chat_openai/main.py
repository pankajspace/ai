"""OpenAI Chat - Travel Guide.

Sends one question to an OpenAI chat model and prints the reply.
To try another city, change the value in step 2.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 01_chat_openai .
    docker run --rm --env-file .env 01_chat_openai
"""

import os

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - change the value (or uncomment another line) to see a different output
# city = "Bangalore"
# city = "Paris"
# city = "Tokyo"
city = "New York"

# 3. Create the client (it reads OPENAI_API_KEY / OPENAI_BASE_URL from the environment)
client = OpenAI(timeout=15.0)
model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# 4. Build the messages
#    - system: sets the persona and tone
#    - user:   the actual request
messages = [
    {"role": "system", "content": "You are a witty travel guide."},
    {"role": "user", "content": f"Suggest one thing to do in {city}."},
]

# 5. Call the Chat Completions API
response = client.chat.completions.create(model=model, messages=messages)

# 6. Print the assistant's reply
print(f"City: {city}\n")
print(response.choices[0].message.content)
