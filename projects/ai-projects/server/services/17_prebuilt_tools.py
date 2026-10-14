"""Pre-built Calculator Tool Agent Service.

Demonstrates integrating pre-built community tools with system prompts:
1. Standing System Prompt: "You are a helpful math assistant."
2. Prebuilt mathematical calculator tool (`eval` / safe arithmetic parser).
3. Evaluates complex mathematical queries with precise computation.

Run directly:
    python projects/ai-projects/server/services/17_prebuilt_tools.py
"""

import json
import math
import os
import re
from typing import List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class PrebuiltCalculatorRequest(BaseModel):
    """Input payload for Prebuilt Calculator Agent."""

    query: str = Field(
        default="What's 42 raised to the power of 9?",
        description="Math problem or expression to solve",
    )


class PrebuiltCalculatorResponse(BaseModel):
    """Output payload from Prebuilt Calculator Agent."""

    query: str
    response: str
    tool_calls: List[str]
    provider: str


def safe_calculator(expression: str) -> str:
    """Safely calculate mathematical expressions."""
    # ① Normalize operators and validate expression against the character allowlist
    clean_expr = expression.strip().replace("^", "**").replace("x", "*")
    if not re.match(r"^[0-9\+\-\*\/\(\)\.\s\*\*eE\%\,]+$", clean_expr):
        return f"Error: Expression contains unsupported characters: {clean_expr}"
    try:
        # ② Evaluate arithmetic safely with restricted math functions and no builtins
        allowed = {
            "math": math,
            "sqrt": math.sqrt,
            "sin": math.sin,
            "cos": math.cos,
            "tan": math.tan,
            "pi": math.pi,
            "pow": pow,
            "abs": abs,
        }
        res = eval(clean_expr, {"__builtins__": None}, allowed)
        return str(res)
    except Exception as exc:
        return f"Calculation error: {str(exc)}"


def run_prebuilt_calculator_agent(query: str = "What's 42 raised to the power of 9?") -> dict:
    """Run the Prebuilt Calculator Agent."""
    # ① Load AWS credentials and initialize the tool call log
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_calls_recorded = []

    # ② Run Strands Agent with prebuilt strands_tools.calculator on Bedrock if configured
    if aws_key and aws_secret:
        try:
            from strands import Agent
            from strands.models.bedrock import BedrockModel
            from strands_tools import calculator

            agent = Agent(
                model=BedrockModel(model_id=bedrock_model_id),
                tools=[calculator],
                system_prompt="You are a helpful math assistant.",
            )
            res = agent(query)
            tool_calls_recorded.append("strands_tools.calculator called")
            return {
                "query": query,
                "response": str(res),
                "tool_calls": tool_calls_recorded,
                "provider": f"Strands + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Strands Bedrock calculator failed ({exc}), falling back to OpenAI")

    # ③ Configure OpenAI client and calculator tool schema for deterministic arithmetic
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "calculator",
                "description": "Evaluate any valid mathematical expression (e.g., '42**9', 'sqrt(144) * 17.5').",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {"type": "string", "description": "Mathematical expression to compute"}
                    },
                    "required": ["expression"],
                },
            },
        }
    ]

    messages = [
        {"role": "system", "content": "You are a helpful math assistant. Always use the calculator tool for math operations."},
        {"role": "user", "content": query},
    ]

    # ④ Run the agent loop to evaluate the expression and return the exact result
    for _ in range(5):
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            tools=tools_schema,
            tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return {
                "query": query,
                "response": msg.content or "",
                "tool_calls": tool_calls_recorded,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Prebuilt Tool Pattern)",
            }

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments or "{}")
            expr = args.get("expression", "0")
            calc_val = safe_calculator(expr)
            tool_calls_recorded.append(f"calculator('{expr}') -> {calc_val}")
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": calc_val})

    return {
        "query": query,
        "response": messages[-1].get("content", ""),
        "tool_calls": tool_calls_recorded,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    out = run_prebuilt_calculator_agent()
    print("Calls:", out["tool_calls"])
    print("Response:", out["response"])

