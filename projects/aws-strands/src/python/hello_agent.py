"""Module 1 demo — the simplest possible agent (Strands + Bedrock).

No tools: the model answers directly, so the agentic loop runs exactly once.
This is the "before" picture for the tool-enabled demos.
"""

from strands import Agent
from strands.models.bedrock import BedrockModel

from config import MODEL_ID, agent_text


def ask(prompt: str) -> str:
    """Send a prompt to a plain, tool-less agent and return its reply."""
    agent = Agent(model=BedrockModel(model_id=MODEL_ID), callback_handler=None)
    return agent_text(agent(prompt))
