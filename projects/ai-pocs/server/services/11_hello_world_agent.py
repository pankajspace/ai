"""AWS Strands Hello World Agent Service.

Demonstrates the simplest possible autonomous agent:
1. Configures a foundation model (Amazon Nova Lite on Bedrock).
2. Wraps the model in a Strands Agent instance (the agentic loop).
3. Executes a natural language prompt and returns the reply.

Run directly:
    python projects/ai-pocs/server/services/11_hello_world_agent.py
"""

import os

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from strands import Agent
from strands.models.bedrock import BedrockModel

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class HelloWorldAgentRequest(BaseModel):
    """Input payload for Hello World Agent."""

    prompt: str = Field(
        default="Hello! Tell me a fun fact about AI agents.",
        description="Prompt to send to the Strands agent",
    )


class HelloWorldAgentResponse(BaseModel):
    """Output payload from Hello World Agent."""

    prompt: str
    response: str
    provider: str


# ② Configure the Bedrock foundation model (Amazon Nova Lite is fast and cost-effective)
model_id = os.getenv("BEDROCK_NOVA_LITE", os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0"))
model = BedrockModel(model_id=model_id)


def run_hello_world_agent(prompt: str = "Hello! Tell me a fun fact about AI agents.") -> dict:
    """Execute the Hello World Agent on Amazon Bedrock via Strands."""
    # ③ Wrap the foundation model in a Strands Agent instance
    agent = Agent(model=model)

    # ④ Execute the natural language prompt through the agentic loop
    response = agent(prompt)

    return {
        "prompt": prompt,
        "response": str(response),
        "provider": f"Amazon Bedrock ({model_id}) via Strands",
    }


if __name__ == "__main__":
    res = run_hello_world_agent()
    print("Provider:", res["provider"])
    print("Response:\n", res["response"])
