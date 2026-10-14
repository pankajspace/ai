"""Tip Calculator Agent Service.

Demonstrates intent-driven tool invocation over keyword matching:
1. Agent understands natural language intent regardless of phrasing.
2. Extracts numeric parameters: bill amount, tip percentage, and number of people.
3. Invokes `calculate_tip(bill_amount, tip_percentage, num_people)`.
4. Returns computed totals and split amounts.

Run directly:
    python projects/ai-projects/server/services/14_tip_calculator.py
"""

import json
import os
from typing import Any, Dict, List, Optional
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class TipCalculatorRequest(BaseModel):
    """Input payload for Tip Calculator Agent."""

    query: str = Field(
        default="The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?",
        description="Natural language bill and tip inquiry",
    )


class TipBreakdown(BaseModel):
    bill: float
    tip: float
    total: float
    per_person: float


class TipCalculatorResponse(BaseModel):
    """Output payload from Tip Calculator Agent."""

    query: str
    response: str
    calculation: Optional[Dict[str, Any]] = None
    tool_calls: List[str]
    provider: str


def calculate_tip(bill_amount: float, tip_percentage: float, num_people: int = 1) -> dict:
    """Calculate tip and split the bill among people."""
    # ① Compute tip amount, total bill, and per-person split
    tip = bill_amount * (tip_percentage / 100)
    total = bill_amount + tip
    per_person = total / (num_people if num_people > 0 else 1)

    # ② Return rounded monetary breakdown dictionary
    return {
        "bill": round(float(bill_amount), 2),
        "tip": round(float(tip), 2),
        "total": round(float(total), 2),
        "per_person": round(float(per_person), 2),
        "num_people": num_people,
        "tip_percentage": tip_percentage,
    }


def run_tip_calculator_agent(
    query: str = "The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?",
) -> dict:
    """Run the Tip Calculator Agent."""
    # ① Load AWS credentials and initialize state for tool calls and calculation output
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_calls_recorded = []
    calc_result = None

    # ② Run Strands Agent on Bedrock if AWS credentials are configured
    if aws_key and aws_secret:
        try:
            from strands import Agent, tool
            from strands.models.bedrock import BedrockModel

            @tool
            def tip_tool(bill_amount: float, tip_percentage: float, num_people: int = 1) -> dict:
                """Calculate tip and split the bill among people."""
                nonlocal calc_result
                calc = calculate_tip(bill_amount, tip_percentage, num_people)
                calc_result = calc
                tool_calls_recorded.append(f"calculate_tip({bill_amount}, {tip_percentage}%, {num_people}p) -> {calc}")
                return calc

            agent = Agent(model=BedrockModel(model_id=bedrock_model_id), tools=[tip_tool])
            reply = agent(query)
            return {
                "query": query,
                "response": str(reply),
                "calculation": calc_result,
                "tool_calls": tool_calls_recorded,
                "provider": f"Strands + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Strands Bedrock failed ({exc}), falling back to OpenAI")

    # ③ Configure OpenAI client and calculate_tip schema for intent-driven extraction
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "calculate_tip",
                "description": "Calculate tip and split the bill among people based on bill amount, tip percentage, and group size.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "bill_amount": {"type": "number", "description": "Total bill amount before tip"},
                        "tip_percentage": {"type": "number", "description": "Tip percentage (e.g. 15, 18, 20)"},
                        "num_people": {"type": "integer", "description": "Number of people sharing the bill", "default": 1},
                    },
                    "required": ["bill_amount", "tip_percentage"],
                },
            },
        }
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a helpful dining bill and tip assistant. Always use the calculate_tip tool to perform accurate calculations.",
        },
        {"role": "user", "content": query},
    ]

    # ④ Run the agent loop to extract parameters from natural language and compute the split
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
                "calculation": calc_result,
                "tool_calls": tool_calls_recorded,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Intent Agent)",
            }

        for tc in msg.tool_calls:
            args = json.loads(tc.function.arguments or "{}")
            calc_result = calculate_tip(
                bill_amount=args.get("bill_amount", 0.0),
                tip_percentage=args.get("tip_percentage", 15.0),
                num_people=args.get("num_people", 1),
            )
            tool_calls_recorded.append(
                f"calculate_tip(bill={calc_result['bill']}, tip={calc_result['tip_percentage']}%, split={calc_result['num_people']}) -> total: ${calc_result['total']}"
            )
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(calc_result)})

    return {
        "query": query,
        "response": messages[-1].get("content", ""),
        "calculation": calc_result,
        "tool_calls": tool_calls_recorded,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    res = run_tip_calculator_agent()
    print("Calls:", res["tool_calls"])
    print("Response:", res["response"])

