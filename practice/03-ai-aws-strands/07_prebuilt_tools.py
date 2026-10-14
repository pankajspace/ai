"""Module 2 · Lesson 5 — Pre-built community tools.

You don't have to write everything. strands_tools ships ready-made tools.
This also introduces the SYSTEM PROMPT: standing instructions that shape
the agent's behaviour on every request.

    python 07_prebuilt_tools.py
"""

import os
import sys

from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator

# Model configuration
MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

agent = Agent(
    model=BedrockModel(model_id=MODEL_ID),
    tools=[calculator],
    system_prompt="You are a helpful math assistant.",
)

agent("What's 42 raised to the power of 9?")
agent("Solve the equation x^2 + 5x + 6 = 0")
agent("What's the derivative of sin(x) * cos(x)?")
