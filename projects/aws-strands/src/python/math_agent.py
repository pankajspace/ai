"""Module 2 demo — a pre-built community tool: the calculator.

You don't have to write everything: ``strands_tools`` ships ready-made tools.
This also uses a SYSTEM PROMPT — standing instructions that shape the agent's
behaviour on every request.
"""

from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator

from config import MODEL_ID, agent_text


def solve(question: str) -> str:
    """Answer a math question using the pre-built calculator tool."""
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[calculator],
        system_prompt="You are a helpful math assistant.",
        callback_handler=None,
    )
    return agent_text(agent(question))
