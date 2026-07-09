"""A tiny tool-using agent: an LLM plus multiple tools plus a loop.

This is the Class 2 "first agent" — the model decides on its own when to call
a tool.  Here the tools are a price lookup, stock checker, and discount
applier for a small shop.  The loop is:

    think  ->  (maybe) call tool(s)  ->  answer

The tool-calling protocol is expressed with the raw OpenAI SDK (via
config.get_openai_client()) because the request/response shape of function
calling is clearest in the native API.
"""

import json
import random

from config import CHAT_MODEL, get_openai_client

# Our tiny "database" — dicts standing in for a real product catalog.
PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}

STOCK = {"shoes": 12, "hat": 5, "bag": 0, "shorts": 8, "pants": 3}

DISCOUNT_PERCENT = 10


def get_price(item: str) -> str:
    """Look up the price of a shop item.

    Args:
        item: The item name the user asked about.

    Returns:
        A rupee price string, or "₹unknown" if the item is not stocked.
    """
    return f"₹{PRICES.get(item.lower(), 'unknown')}"


def check_stock(item: str) -> str:
    """Check the stock availability of a shop item.

    Args:
        item: The item name to check stock for.

    Returns:
        A string describing the stock level, or "unknown item" if not found.
    """
    item_lower = item.lower()
    if item_lower not in STOCK:
        return f"{item} is not a known item in our shop."
    qty = STOCK[item_lower]
    if qty == 0:
        return f"{item} is currently out of stock."
    return f"{item} has {qty} units in stock."


def apply_discount(item: str) -> str:
    """Apply a 10% discount to a shop item and return the discounted price.

    Args:
        item: The item name to apply the discount to.

    Returns:
        A string with the original and discounted price, or an error message.
    """
    item_lower = item.lower()
    if item_lower not in PRICES:
        return f"{item} is not a known item in our shop."
    original = PRICES[item_lower]
    discounted = original - (original * DISCOUNT_PERCENT // 100)
    return f"{item}: ₹{original} → ₹{discounted} ({DISCOUNT_PERCENT}% off)"


# A registry mapping tool names to their Python functions.
TOOL_FUNCTIONS = {
    "get_price": get_price,
    "check_stock": check_stock,
    "apply_discount": apply_discount,
}

# Describe the tools so the model knows they exist and how to call them.
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_price",
            "description": "Get the price of a shop item the user asks about.",
            "parameters": {
                "type": "object",
                "properties": {
                    "item": {"type": "string", "description": "the item name"}
                },
                "required": ["item"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_stock",
            "description": "Check the stock availability of a shop item.",
            "parameters": {
                "type": "object",
                "properties": {
                    "item": {"type": "string", "description": "the item name"}
                },
                "required": ["item"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "apply_discount",
            "description": "Apply a 10% discount to a shop item and return the discounted price.",
            "parameters": {
                "type": "object",
                "properties": {
                    "item": {"type": "string", "description": "the item name"}
                },
                "required": ["item"],
            },
        },
    },
]


def ask(user_message: str) -> str:
    """Answer a shopping question, using the available tools when needed.

    The flow mirrors the OpenAI function-calling protocol:
      1. Send the message plus the tools menu; the model may request a tool.
      2. If it did, run the real function and append the result.
      3. Send everything back so the model can phrase a final answer.

    Args:
        user_message: The shopper's question.

    Returns:
        The assistant's final natural-language reply.
    """
    client = get_openai_client()
    messages = [{"role": "user", "content": user_message}]

    # 1. First call — the model sees the tools menu and may ask for a tool.
    response = client.chat.completions.create(
        model=CHAT_MODEL, messages=messages, tools=TOOLS
    )
    msg = response.choices[0].message

    # 2. Did it request one or more tool calls?
    if msg.tool_calls:
        messages.append(msg)
        for call in msg.tool_calls:
            fn_name = call.function.name

            # This is how it was used earlier when we had only one tool
            # args = json.loads(call.function.arguments)  # read the request...
            # result = get_price(args["item"])            # ...and run the tool

            args = json.loads(call.function.arguments)
            # Look up the tool function from the registry and call it.
            fn = TOOL_FUNCTIONS.get(fn_name)
            result = fn(args["item"]) if fn else f"Unknown tool: {fn_name}"
            messages.append(
                {
                    "role": "tool",  # the third role, alongside user/assistant
                    "tool_call_id": call.id,
                    "content": result,
                }
            )
        # 3. Send tool results back so the model can answer in plain language.
        response = client.chat.completions.create(
            model=CHAT_MODEL, messages=messages
        )
        msg = response.choices[0].message

    return msg.content


if __name__ == "__main__":
    # Quick manual tests:
    print(ask("How much are the shoes?"))           # -> uses get_price
    print(ask("Are bags in stock?"))                # -> uses check_stock
    print(ask("Apply a discount on the pants"))     # -> uses apply_discount
    print(ask("Hi! What can you help with?"))       # -> no tool needed
