"""Minimal Single-Tool Agent Demonstration.

This script demonstrates the foundational mechanics of an LLM Agent:
1. LLM + External Tool + Decision Loop (ReAct / Tool-Use Pattern).
2. The LLM does NOT execute Python code directly; instead, it returns structured
   JSON requesting a tool call when it needs external information.
3. The client application executes the requested function locally and feeds
   the result back to the LLM to generate the final response.

Run:
    python projects/ai-projects/server/services/03_agent_one_tool.py
"""

import json
import os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

# Load environment variables (e.g., OPENAI_API_KEY) from .env
load_dotenv(find_dotenv())


class AgentRequest(BaseModel):
    message: str = Field(
        default="How much are the shoes?",
        description="Query for the shopping agent with tool access",
    )


class AgentResponse(BaseModel):
    message: str
    response: str

# ---------------------------------------------------------------------------
# Mock Database
# ---------------------------------------------------------------------------
# In a real-world system, this would be an external database, API, or service
# containing domain data that the LLM has no inherent knowledge of.
PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}


# ---------------------------------------------------------------------------
# Step 1: Define the Python Tool Function
# ---------------------------------------------------------------------------
def get_price(item: str) -> str:
    """Fetch the price of a given shop item from the database.

    Args:
        item: Name of the item to look up.

    Returns:
        Formatted price string in INR, or '₹unknown' if item is not found.
    """
    # Log to console so tool invocations are visible during execution
    print(f"🔧 tool called: get_price({item})")
    # Use .get() to safely handle unknown items without throwing a KeyError
    return f"₹{PRICES.get(item.lower(), 'unknown')}"


# ---------------------------------------------------------------------------
# Step 2: Define Tool Schema for the Model (JSON Schema / Function Calling)
# ---------------------------------------------------------------------------
# The model uses this schema to know:
# - Which tools are available ('name')
# - When to use each tool ('description' acts as guidance for the LLM)
# - What arguments to generate ('parameters' defines argument types and requirements)
tools = [{
    "type": "function",
    "function": {
        "name": "get_price",
        "description": "Get the price of a shop item the user asks about.",
        "parameters": {
            "type": "object",
            "properties": {
                "item": {
                    "type": "string",
                    "description": "The item name (e.g., 'shoes', 'bag')",
                }
            },
            "required": ["item"],
        },
    },
}]


# ---------------------------------------------------------------------------
# Step 3: The Agent Decision Loop (Think -> Tool Execution -> Final Response)
# ---------------------------------------------------------------------------
def run_agent_with_tool(user_message: str = "How much are the shoes?") -> str:
    """Process a user query, invoking tools dynamically if required.

    Execution Flow:
    1. Send user message and tool definitions to the LLM.
    2. Check if the LLM requested a tool call (msg.tool_calls).
    3. If requested:
       a. Append the assistant's tool-call request to message history.
       b. Parse arguments and execute the local Python function.
       c. Append the tool output with role='tool' and matching tool_call_id.
       d. Send full conversation history back to the LLM for final synthesis.
    4. If no tool requested, return the direct LLM text response.

    Args:
        user_message: Natural language prompt from the user.

    Returns:
        Final response text from the LLM.
    """

    base_url = os.getenv("OPENAI_BASE_URL")
    api_key = os.getenv("OPENAI_API_KEY")

    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=15.0,
    )

    # Initialize conversation history with the user's prompt
    messages = [{"role": "user", "content": user_message}]

    # Phase 1: Send user message along with available tool definitions.
    # The model inspects the prompt and decides whether to respond directly
    # or request a tool invocation.
    model = os.getenv("OPENAI_MODEL")
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools,
        timeout=15.0,
    )

    msg = response.choices[0].message

    # Phase 2: Inspect model response to see if tool invocation was requested
    if msg.tool_calls:
        # Step 2a: Crucial! Append the assistant's tool call message to history.
        # OpenAI requires the assistant's tool_calls message to precede tool responses.
        messages.append(msg)

        # Step 2b: Iterate through requested tool calls (supports multiple calls)
        for call in msg.tool_calls:
            # Parse the JSON arguments generated by the model
            args = json.loads(call.function.arguments)

            # Invoke the corresponding Python function locally
            result = get_price(args.get("item", ""))

            # Step 2c: Append tool result to history.
            # Role 'tool' and 'tool_call_id' link the output back to the model's call.
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": result,
            })

        # Phase 3: Second LLM call with complete history (Prompt + Tool Call + Tool Result).
        # The model reads the tool output and crafts a natural language response.
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            timeout=15.0,
        )
        msg = response.choices[0].message

    # Return the assistant's final text content
    return msg.content or ""


# Backward-compatible alias
agent = run_agent_with_tool


# ---------------------------------------------------------------------------
# Test Cases / Demonstration
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Test Case 1: Requires external knowledge -> triggers tool call -> returns ₹799
    print("--- Test 1: Tool Required ---")
    print(agent("How much are the shoes?"))

    print("\n--- Test 2: Direct Answer (No Tool Needed) ---")
    # Test Case 2: General conversation -> model answers directly without calling any tool
    print(agent("Hi! What can you help with?"))

