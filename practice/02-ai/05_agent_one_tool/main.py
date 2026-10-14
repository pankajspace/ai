"""Minimal Agent with One Tool (raw OpenAI API, no framework).

Agent = LLM + tool + decision loop:
  - The LLM never runs Python itself. When it needs data, it replies with a
    structured "tool call" (function name + JSON arguments).
  - Our code runs the function and sends the result back.
  - The LLM then writes the final answer using that result.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py   # runs two demo questions
    python main.py "How much is the bag?"

Run with Docker (from this folder):
    docker build -t 05_agent_one_tool .
    docker run --rm --env-file ../.env 05_agent_one_tool   # runs two demo questions
    docker run --rm --env-file ../.env 05_agent_one_tool "How much is the bag?"
"""

import json
import os
import sys

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

client = OpenAI(timeout=15.0)
model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# 2. Fake "database" - data the LLM cannot know on its own
PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}


# 3. The Python tool the agent is allowed to use
def get_price(item: str) -> str:
    """Return the price of a shop item, or '₹unknown' if we don't sell it."""
    print(f"   🔧 tool called: get_price({item!r})")
    return f"₹{PRICES.get(item.lower(), 'unknown')}"


# 4. Describe the tool to the model (JSON Schema)
#    - name:        which function to call
#    - description: tells the model WHEN to use it
#    - parameters:  which arguments to send
TOOLS = [{
    "type": "function",
    "function": {
        "name": "get_price",
        "description": "Get the price of a shop item the user asks about.",
        "parameters": {
            "type": "object",
            "properties": {
                "item": {"type": "string", "description": "The item name, e.g. 'shoes' or 'bag'"},
            },
            "required": ["item"],
        },
    },
}]


# 5. The agent loop: ask -> (maybe) run tool -> ask again with the result
def run_agent(question: str) -> str:
    messages = [{"role": "user", "content": question}]

    # 5a. First call: send the question + tool list; the model decides what to do
    msg = client.chat.completions.create(model=model, messages=messages, tools=TOOLS).choices[0].message

    # 5b. No tool needed -> the model answered directly
    if not msg.tool_calls:
        return msg.content or ""

    # 5c. Tool needed -> keep the model's tool-call message in the history
    #     (OpenAI requires it to come before the tool results)
    messages.append(msg)

    # 5d. Run each requested tool and add its result, linked by tool_call_id
    for call in msg.tool_calls:
        args = json.loads(call.function.arguments)
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": get_price(args.get("item", "")),
        })

    # 5e. Second call: the model reads the tool result and writes the final answer
    msg = client.chat.completions.create(model=model, messages=messages).choices[0].message
    return msg.content or ""


# 6. Run the agent on the CLI question, or on two demo questions
questions = sys.argv[1:] or [
    "How much are the shoes?",       # needs the tool
    "Hi! What can you help with?",   # no tool needed
]
for q in questions:
    print(f"\nQ: {q}")
    print(f"A: {run_agent(q)}")
