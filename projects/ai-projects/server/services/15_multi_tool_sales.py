"""Multi-Tool Sales Pipeline Agent Service.

Demonstrates autonomous multi-tool planning and chained orchestration:
1. Three tools provided without explicit execution order:
   - `get_sales_data(quarter: str)`
   - `analyze_sales(revenue: int, deals: int, quarter: str)`
   - `send_email(to: str, subject: str, body: str)`
2. The agent plans the workflow: Fetch Data -> Compute Analysis -> Dispatch Email.
3. Traces all intermediate steps and outputs.

Run directly:
    python projects/ai-projects/server/services/15_multi_tool_sales.py
"""

import json
import os
from typing import List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class MultiToolSalesRequest(BaseModel):
    """Input payload for Multi-Tool Sales Agent."""

    task: str = Field(
        default="Pull last quarter's sales data and email a summary to the team",
        description="Business workflow task requiring multi-tool orchestration",
    )


class MultiToolSalesResponse(BaseModel):
    """Output payload from Multi-Tool Sales Agent."""

    task: str
    response: str
    tool_sequence: List[str]
    provider: str


SALES_DB = {
    "Q1": {"revenue": 950000, "deals": 35},
    "Q2": {"revenue": 1100000, "deals": 42},
    "Q3": {"revenue": 1250000, "deals": 47},
    "Q4": {"revenue": 1450000, "deals": 55},
}


def get_sales_data(quarter: str) -> dict:
    """Retrieve sales data for a specific quarter."""
    q_key = quarter.upper().strip().replace("LAST QUARTER", "Q3").replace("LAST", "Q3")
    data = SALES_DB.get(q_key, {"revenue": 1250000, "deals": 47})
    return {"revenue": data["revenue"], "deals": data["deals"], "quarter": q_key}


def analyze_sales(revenue: int, deals: int, quarter: str) -> str:
    """Calculate key metrics from sales data."""
    avg_deal = revenue / deals if deals > 0 else 0
    return f"Q{quarter}: ${revenue:,} revenue, {deals} deals, ${avg_deal:,.0f} avg deal size"


def send_email(to: str, subject: str, body: str) -> str:
    """Send an email message (mock dispatch)."""
    return f"Email successfully dispatched to '{to}' with subject '{subject}'"


def run_multi_tool_sales_agent(
    task: str = "Pull last quarter's sales data and email a summary to the team",
) -> dict:
    """Run the Multi-Tool Sales Agent."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_sequence = []

    if aws_key and aws_secret:
        try:
            from strands import Agent, tool
            from strands.models.bedrock import BedrockModel

            @tool
            def tool_get_sales(quarter: str) -> dict:
                """Retrieve sales data for a specific quarter."""
                res = get_sales_data(quarter)
                tool_sequence.append(f"1. get_sales_data('{quarter}') -> {res}")
                return res

            @tool
            def tool_analyze(revenue: int, deals: int, quarter: str) -> str:
                """Calculate key metrics from sales data."""
                res = analyze_sales(revenue, deals, quarter)
                tool_sequence.append(f"2. analyze_sales(rev=${revenue}, deals={deals}) -> {res}")
                return res

            @tool
            def tool_email(to: str, subject: str, body: str) -> str:
                """Send an email message."""
                res = send_email(to, subject, body)
                tool_sequence.append(f"3. send_email('{to}') -> {res}")
                return res

            agent = Agent(
                model=BedrockModel(model_id=bedrock_model_id),
                tools=[tool_get_sales, tool_analyze, tool_email],
            )
            res = agent(task)
            return {
                "task": task,
                "response": str(res),
                "tool_sequence": tool_sequence,
                "provider": f"Strands Multi-Tool + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Bedrock Strands multi-tool failed ({exc}), falling back to OpenAI")

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "get_sales_data",
                "description": "Retrieve revenue and deal counts for a sales quarter (e.g. 'Q3').",
                "parameters": {
                    "type": "object",
                    "properties": {"quarter": {"type": "string", "description": "Target quarter like Q1, Q2, Q3, Q4"}},
                    "required": ["quarter"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "analyze_sales",
                "description": "Calculate average deal size and performance metrics from sales numbers.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "revenue": {"type": "integer", "description": "Total revenue"},
                        "deals": {"type": "integer", "description": "Number of closed deals"},
                        "quarter": {"type": "string", "description": "Quarter name"},
                    },
                    "required": ["revenue", "deals", "quarter"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "send_email",
                "description": "Send an email message to a recipient or team.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "to": {"type": "string", "description": "Recipient email or alias"},
                        "subject": {"type": "string", "description": "Email subject line"},
                        "body": {"type": "string", "description": "Email body content"},
                    },
                    "required": ["to", "subject", "body"],
                },
            },
        },
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a sales operations agent. When given a request, plan and execute the necessary tools sequentially (get sales data -> analyze -> send email).",
        },
        {"role": "user", "content": task},
    ]

    for _ in range(6):
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
                "task": task,
                "response": msg.content or "",
                "tool_sequence": tool_sequence,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Multi-Tool Orchestrator)",
            }

        for tc in msg.tool_calls:
            fname = tc.function.name
            args = json.loads(tc.function.arguments or "{}")
            if fname == "get_sales_data":
                out = get_sales_data(args.get("quarter", "Q3"))
                tool_sequence.append(f"get_sales_data({args.get('quarter')}) -> revenue: ${out['revenue']:,}")
                content = json.dumps(out)
            elif fname == "analyze_sales":
                out_str = analyze_sales(args.get("revenue", 1250000), args.get("deals", 47), args.get("quarter", "Q3"))
                tool_sequence.append(f"analyze_sales(...) -> {out_str}")
                content = out_str
            elif fname == "send_email":
                out_str = send_email(args.get("to", "team@company.com"), args.get("subject", "Sales Update"), args.get("body", ""))
                tool_sequence.append(f"send_email(to='{args.get('to')}') -> Dispatched")
                content = out_str
            else:
                content = f"Unknown tool: {fname}"

            messages.append({"role": "tool", "tool_call_id": tc.id, "content": content})

    return {
        "task": task,
        "response": messages[-1].get("content", ""),
        "tool_sequence": tool_sequence,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    res = run_multi_tool_sales_agent()
    print("Sequence:", res["tool_sequence"])
    print("Response:", res["response"])

