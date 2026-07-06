"""A tiny tool-using agent: an LLM plus one tool plus a loop.

This is the Class 2 "first agent" — the model decides on its own when to call
a tool.  Here the tool is a price lookup for a small shop.  The loop is:

    think  ->  (maybe) call the tool  ->  answer

The tool-calling protocol is expressed with the raw OpenAI SDK (via
config.get_openai_client()) because the request/response shape of function
calling is clearest in the native API.
"""

import json

from config import CHAT_MODEL, get_openai_client

# Our tiny "database" — a dict standing in for a real product catalog.
PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}


def get_price(item: str) -> str:
    """Look up the price of a shop item.

    This is a plain Python function — the "tool" the model can choose to call.

    Args:
        item: The item name the user asked about.

    Returns:
        A rupee price string, or "₹unknown" if the item is not stocked.
    """
    # .get avoids a KeyError if the model asks for an item we don't stock.
    return f"₹{PRICES.get(item.lower(), 'unknown')}"


# Describe the tool so the model knows it exists and how to call it.
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
    }
]


def ask(user_message: str) -> str:
    """Answer a shopping question, using the price tool when needed.

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
            args = json.loads(call.function.arguments)  # read the request...
            result = get_price(args["item"])            # ...and run the tool
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
    # Quick manual test: the first question uses the tool, the second does not.
    print(ask("How much are the shoes?"))      # -> uses the tool -> "₹799"
    print(ask("Hi! What can you help with?"))   # -> no tool needed -> just chats
