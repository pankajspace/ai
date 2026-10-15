"""Multi-Prebuilt Tools Agent Service.

Demonstrates chaining multiple prebuilt tools in one pipeline:
1. Prebuilt tools from `strands_tools`: `http_request` (fetch) and `calculator` (math).
2. Handles multi-step pipelines: Fetch external API data -> Compute statistics -> Summarize.
3. The practice script also saves the summary with the prebuilt `file_write`; this web demo
   returns the summary to the UI instead, so nothing is written on the server.

Run directly:
    python projects/ai-pocs/server/services/18_multi_prebuilt_tools.py
"""

import os
from typing import List

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator, http_request

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class MultiPrebuiltToolsRequest(BaseModel):
    """Input payload for Multi Prebuilt Tools Agent."""

    task: str = Field(
        default=(
            "Fetch stock data from https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d, "
            "extract the latest closing prices, calculate the average price over the period, "
            "and show a short summary"
        ),
        description="Multi-step data pipeline task combining HTTP fetching and calculation",
    )


class MultiPrebuiltToolsResponse(BaseModel):
    """Output payload from Multi Prebuilt Tools Agent."""

    task: str
    response: str
    tool_sequence: List[str]
    provider: str


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


def run_multi_prebuilt_tools_agent(
    task: str = MultiPrebuiltToolsRequest.model_fields["task"].default,
) -> dict:
    """Run the Multi Prebuilt Tools Agent."""
    # ③ Initialize the Strands Agent with the prebuilt http_request and calculator tools
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[http_request, calculator],
        system_prompt="You help with data analysis tasks.",
    )

    # ④ Execute the multi-step pipeline: fetch HTTP data -> compute average -> summarize
    response = agent(task)

    # ⑤ Collect the tool calls in the order the agent made them
    tool_sequence = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {
        "task": task,
        "response": str(response),
        "tool_sequence": tool_sequence,
        "provider": f"Strands Multi-Tool + Bedrock ({model_id})",
    }


if __name__ == "__main__":
    out = run_multi_prebuilt_tools_agent()
    print("Sequence:", out["tool_sequence"])
    print("Response:", out["response"])
