"""Minimal Single-Tool Agent Demonstration (Raw OpenAI API, No Framework).

This script demonstrates the foundational mechanics of an LLM Agent:
1. LLM + External Tool + Decision Loop (ReAct / Tool-Use Pattern).
2. The LLM does NOT execute Python code directly; instead, it returns structured
   JSON requesting a tool call (`tool_calls`) when it needs external information.
3. Our application executes the requested Python function locally and feeds
   the result back to the LLM to synthesize the final natural-language answer.

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

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# Load API keys and model names from .env
# (in Docker, environment variables are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# Questions to ask the agent - uncomment additional lines to test different scenarios
questions = [
    "How much are the shoes?",        # -> calls get_price
    "Hi! What can you help with?",    # -> answers directly, no tool
    # "What does a hat cost?",                       # -> calls get_price
    # "How much for a bag and a pair of shorts?",    # -> calls get_price twice
    # "How much are the sunglasses?",                # -> tool returns '₹unknown'
]

# ---------------------------------------------------------------------------
# Client & Mock Database Setup
# ---------------------------------------------------------------------------
# Initialize the OpenAI client (reads OPENAI_API_KEY / OPENAI_BASE_URL from environment)
client = OpenAI(timeout=15.0)
model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# In a real-world system, this would be an external database or API
# containing domain data that the LLM has no inherent knowledge of.
PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}


# ---------------------------------------------------------------------------
# Step 1: Define the Python Tool Function
# ---------------------------------------------------------------------------
def get_price(item: str) -> str:
    """Return the price of a shop item, or '₹unknown' if we don't sell it."""
    # ① Log to console so tool invocations are visible during execution
    print(f"   🔧 tool called: get_price({item!r})")
    # ② Use .get() to safely handle unknown items without throwing a KeyError
    return f"₹{PRICES.get(item.lower(), 'unknown')}"


# ---------------------------------------------------------------------------
# Step 2: Define Tool Schema for the Model (JSON Schema / Function Calling)
# ---------------------------------------------------------------------------
# The model uses this schema to know:
# - Which tools are available ('name')
# - When to use each tool ('description' acts as guidance for the LLM)
# - What arguments to generate ('parameters' defines argument types and requirements)
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


# ---------------------------------------------------------------------------
# Step 3: The Agent Decision Loop (Think -> Tool Execution -> Final Response)
# ---------------------------------------------------------------------------
def run_agent(question: str) -> str:
    """Process a user query, invoking tools dynamically if required."""
    # ① Initialize conversation history with the user's question
    messages = [{"role": "user", "content": question}]

    # ② Phase 1: Send user message along with available tool definitions.
    #   The model inspects the prompt and decides whether to respond directly
    #   or request a tool invocation.
    msg = client.chat.completions.create(model=model, messages=messages, tools=TOOLS).choices[0].message

    # ③ If no tool call was requested, return the model's direct answer immediately
    if not msg.tool_calls:
        return msg.content or ""

    # ④ Phase 2: Tool call requested! Append the assistant's tool-call request to history.
    #   (OpenAI requires the assistant's tool_calls message to precede tool responses.)
    messages.append(msg)

    # ⑤ Iterate through requested tool calls, execute the local Python function,
    #   and append each result with role='tool' and matching tool_call_id.
    for call in msg.tool_calls:
        args = json.loads(call.function.arguments)
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": get_price(args.get("item", "")),
        })

    # ⑥ Phase 3: Second LLM call with complete history (Prompt + Tool Call + Tool Result).
    #   The model reads the tool output and synthesizes a natural-language response.
    msg = client.chat.completions.create(model=model, messages=messages).choices[0].message
    return msg.content or ""


# ---------------------------------------------------------------------------
# Standalone CLI Execution
# ---------------------------------------------------------------------------
for q in questions:
    print(f"\nQ: {q}")
    print(f"A: {run_agent(q)}")
