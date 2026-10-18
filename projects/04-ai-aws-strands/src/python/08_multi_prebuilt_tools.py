"""Multi-Prebuilt Tools Agent Service.

Demonstrates chaining multiple prebuilt tools in one pipeline:
1. Prebuilt tools from `strands_tools`: `http_request` (fetch) and `calculator` (math).
2. Handles multi-step pipelines: Fetch external API data -> Compute statistics -> Summarize.
3. The practice script also saves the summary with the prebuilt `file_write`; this web demo
   returns the summary to the UI instead, so nothing is written on the server.
"""

import os

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator, http_request

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class MultiPrebuiltToolsRequest(BaseModel):
    """Input payload for Multi Prebuilt Tools Agent."""

    task: str = (
        "Fetch stock data from https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d, "
        "extract the latest closing prices, calculate the average price over the period, "
        "and show a short summary"
    )


class MultiPrebuiltToolsResponse(BaseModel):
    """Output payload from Multi Prebuilt Tools Agent."""

    task: str
    response: str
    tool_sequence: list[str]


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


def run_multi_prebuilt_tools_agent(task: str) -> dict:
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
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {"task": task, "response": str(response), "tool_sequence": tool_calls}
