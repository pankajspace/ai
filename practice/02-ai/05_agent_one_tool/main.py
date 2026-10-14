"""Minimal Agent with One Tool (raw OpenAI API, no framework).

Agent = LLM + tool + decision loop:
  - The LLM never runs Python itself. When it needs data, it replies with a
    structured "tool call" (function name + JSON arguments).
  - Our code runs the function and sends the result back.
  - The LLM then writes the final answer using that result.

To try other questions, edit the list in step 2.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 05_agent_one_tool .
    docker run --rm --env-file .env 05_agent_one_tool
"""

import json
import os

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - questions to ask; uncomment more lines to try them
questions = [
    "How much are the shoes?",        # -> calls get_price
    "Hi! What can you help with?",    # -> answers directly, no tool
    # "What does a hat cost?",                       # -> calls get_price
    # "How much for a bag and a pair of shorts?",    # -> calls get_price twice
    # "How much are the sunglasses?",                # -> tool returns '₹unknown'
]

# 3. Create the client (it reads OPENAI_API_KEY / OPENAI_BASE_URL from the environment)
client = OpenAI(timeout=15.0)
model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# 4. Fake "database" - data the LLM cannot know on its own
PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}


# 5. The Python tool the agent is allowed to use
def get_price(item: str) -> str:
    """Return the price of a shop item, or '₹unknown' if we don't sell it."""
    print(f"   🔧 tool called: get_price({item!r})")
    return f"₹{PRICES.get(item.lower(), 'unknown')}"


# 6. Describe the tool to the model (JSON Schema)
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


# 7. The agent loop: ask -> (maybe) run tool -> ask again with the result
def run_agent(question: str) -> str:
    messages = [{"role": "user", "content": question}]

    # 7a. First call: send the question + tool list; the model decides what to do
    msg = client.chat.completions.create(model=model, messages=messages, tools=TOOLS).choices[0].message

    # 7b. No tool needed -> the model answered directly
    if not msg.tool_calls:
        return msg.content or ""

    # 7c. Tool needed -> keep the model's tool-call message in the history
    #     (OpenAI requires it to come before the tool results)
    messages.append(msg)

    # 7d. Run each requested tool and add its result, linked by tool_call_id
    for call in msg.tool_calls:
        args = json.loads(call.function.arguments)
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": get_price(args.get("item", "")),
        })

    # 7e. Second call: the model reads the tool result and writes the final answer
    msg = client.chat.completions.create(model=model, messages=messages).choices[0].message
    return msg.content or ""


# 8. Run the agent on every question from step 2
for q in questions:
    print(f"\nQ: {q}")
    print(f"A: {run_agent(q)}")
