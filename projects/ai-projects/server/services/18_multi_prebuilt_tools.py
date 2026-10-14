"""Multi-Prebuilt Tools Agent Service.

Demonstrates chaining multiple prebuilt tools and unattended consent:
1. Prebuilt tools: `http_request`, `calculator`, and `file_write`.
2. Handles complex multi-step pipelines: Fetch external API data -> Compute statistics -> Save artifact.
3. Records all intermediate file writes and execution traces.

Run directly:
    python projects/ai-projects/server/services/18_multi_prebuilt_tools.py
"""

import json
import math
import os
import re
from typing import Dict, List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field
import requests

load_dotenv(find_dotenv())


class MultiPrebuiltToolsRequest(BaseModel):
    """Input payload for Multi Prebuilt Tools Agent."""

    task: str = Field(
        default="Fetch crypto data from https://api.coindesk.com/v1/bpi/currentprice.json, extract USD rate, and write a summary to crypto_summary.txt",
        description="Multi-step data pipeline task combining HTTP, calculation, and file writing",
    )


class MultiPrebuiltToolsResponse(BaseModel):
    """Output payload from Multi Prebuilt Tools Agent."""

    task: str
    response: str
    tool_sequence: List[str]
    written_files: Dict[str, str]
    provider: str


VIRTUAL_FILESYSTEM = {}


def tool_http_request(url: str) -> str:
    """Fetch content from an HTTP URL."""
    try:
        resp = requests.get(url, timeout=5)
        text = resp.text
        return text[:1000]  # truncate to keep prompt context clean
    except Exception as exc:
        return f"HTTP error fetching {url}: {str(exc)}"


def tool_calculator(expression: str) -> str:
    """Safely calculate mathematical expression."""
    clean = expression.strip().replace("^", "**").replace("x", "*")
    if not re.match(r"^[0-9\+\-\*\/\(\)\.\s\*\*eE\%\,]+$", clean):
        return f"Error: Expression contains unsupported characters: {clean}"
    try:
        allowed = {"math": math, "sqrt": math.sqrt, "pow": pow, "abs": abs}
        return str(eval(clean, {"__builtins__": None}, allowed))
    except Exception as exc:
        return f"Math error: {str(exc)}"


def tool_file_write(filename: str, content: str) -> str:
    """Write content to a file in memory or disk."""
    fname = os.path.basename(filename)
    VIRTUAL_FILESYSTEM[fname] = content
    return f"Successfully wrote {len(content)} characters to {fname}"


def run_multi_prebuilt_tools_agent(
    task: str = "Fetch crypto data from https://api.coindesk.com/v1/bpi/currentprice.json, extract USD rate, and write a summary to crypto_summary.txt",
) -> dict:
    """Run the Multi Prebuilt Tools Agent."""
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_sequence = []
    local_files = {}

    if aws_key and aws_secret:
        try:
            from strands import Agent
            from strands.models.bedrock import BedrockModel
            from strands_tools import calculator, file_write, http_request

            os.environ["BYPASS_TOOL_CONSENT"] = "true"
            agent = Agent(
                model=BedrockModel(model_id=bedrock_model_id),
                tools=[calculator, http_request, file_write],
            )
            res = agent(task)
            tool_sequence.append("strands_tools [calculator, http_request, file_write] executed")
            return {
                "task": task,
                "response": str(res),
                "tool_sequence": tool_sequence,
                "written_files": VIRTUAL_FILESYSTEM,
                "provider": f"Strands Multi-Prebuilt + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Strands Bedrock multi prebuilt failed ({exc}), falling back to OpenAI")

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "http_request",
                "description": "Fetch data or JSON from a web URL using GET.",
                "parameters": {
                    "type": "object",
                    "properties": {"url": {"type": "string", "description": "The URL to fetch"}},
                    "required": ["url"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "calculator",
                "description": "Compute a math calculation or numeric average.",
                "parameters": {
                    "type": "object",
                    "properties": {"expression": {"type": "string", "description": "Math expression"}},
                    "required": ["expression"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "file_write",
                "description": "Write text data or summary to a named file.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "filename": {"type": "string", "description": "Name of the target file"},
                        "content": {"type": "string", "description": "Text content to save"},
                    },
                    "required": ["filename", "content"],
                },
            },
        },
    ]

    messages = [
        {
            "role": "system",
            "content": "You are an automated data-gathering assistant. Use http_request to fetch data, calculator if maths is required, and file_write to save output files.",
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
                "written_files": local_files,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Prebuilt Multi-Tool)",
            }

        for tc in msg.tool_calls:
            fname = tc.function.name
            args = json.loads(tc.function.arguments or "{}")
            if fname == "http_request":
                out = tool_http_request(args.get("url", ""))
                tool_sequence.append(f"http_request('{args.get('url')}') -> received data")
            elif fname == "calculator":
                out = tool_calculator(args.get("expression", "0"))
                tool_sequence.append(f"calculator('{args.get('expression')}') -> {out}")
            elif fname == "file_write":
                fn = args.get("filename", "output.txt")
                cnt = args.get("content", "")
                out = tool_file_write(fn, cnt)
                local_files[fn] = cnt
                tool_sequence.append(f"file_write('{fn}') -> saved")
            else:
                out = f"Unknown tool: {fname}"

            messages.append({"role": "tool", "tool_call_id": tc.id, "content": out})

    return {
        "task": task,
        "response": messages[-1].get("content", ""),
        "tool_sequence": tool_sequence,
        "written_files": local_files,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    out = run_multi_prebuilt_tools_agent()
    print("Sequence:", out["tool_sequence"])
    print("Files:", out["written_files"].keys())
    print("Response:", out["response"])

