"""Multi-Prebuilt Tools Agent Service.

Demonstrates chaining multiple prebuilt tools and unattended consent:
1. Prebuilt tools from `strands_tools`: `http_request`, `calculator`, and `file_write`.
2. Sets `BYPASS_TOOL_CONSENT="true"` so sensitive tools (`file_write`) run unattended without prompts.
3. Handles complex multi-step pipelines: Fetch external API data -> Compute statistics -> Save artifact.

Run directly:
    python projects/ai-pocs/server/services/18_multi_prebuilt_tools.py
"""

import os
from typing import Dict, List

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator, file_write, http_request

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class MultiPrebuiltToolsRequest(BaseModel):
    """Input payload for Multi Prebuilt Tools Agent."""

    task: str = Field(
        default=(
            "Fetch stock data from https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d, "
            "extract the latest closing prices, calculate the average price over the period, "
            "and save the results to stock_summary.txt"
        ),
        description="Multi-step data pipeline task combining HTTP, calculation, and file writing",
    )


class MultiPrebuiltToolsResponse(BaseModel):
    """Output payload from Multi Prebuilt Tools Agent."""

    task: str
    response: str
    tool_sequence: List[str]
    written_files: Dict[str, str]
    provider: str


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# ③ Disable interactive tool consent prompts so file_write runs unattended
os.environ["BYPASS_TOOL_CONSENT"] = os.getenv("BYPASS_TOOL_CONSENT", "true")


def run_multi_prebuilt_tools_agent(
    task: str = MultiPrebuiltToolsRequest.model_fields["task"].default,
) -> dict:
    """Run the Multi Prebuilt Tools Agent."""
    # ④ Initialize the Strands Agent with http_request, calculator, and file_write
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[http_request, calculator, file_write],
        system_prompt="You help with data analysis tasks.",
    )

    # ⑤ Execute the multi-step pipeline: fetch HTTP data -> compute average -> save artifact file
    response = agent(task)

    # ⑥ Collect the tool calls in order, and the files the agent asked file_write to save
    tool_uses = [
        block["toolUse"]
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]
    written_files = {t["input"]["path"]: t["input"]["content"] for t in tool_uses if t["name"] == "file_write"}

    return {
        "task": task,
        "response": str(response),
        "tool_sequence": [f"{t['name']}({t['input']})" for t in tool_uses],
        "written_files": written_files,
        "provider": f"Strands Multi-Tool + Bedrock ({model_id})",
    }


if __name__ == "__main__":
    out = run_multi_prebuilt_tools_agent()
    print("Sequence:", out["tool_sequence"])
    print("Files:", list(out["written_files"]))
    print("Response:", out["response"])
