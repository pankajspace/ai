"""AWS Strands Hello World Agent Service.

Demonstrates the simplest possible autonomous agent:
1. Configures foundation model (Amazon Nova Lite on Bedrock, or OpenAI fallback).
2. Initializes an Agent instance with an agentic loop.
3. Executes a natural language query and streams/returns the response.

Run directly:
    python projects/ai-projects/server/services/11_hello_world_agent.py
"""

import os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

# Load environment configuration
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


def run_hello_world_agent(prompt: str = "Hello! Tell me a fun fact about AI agents.") -> dict:
    """Execute the Hello World Agent.

    Uses Amazon Bedrock Nova Lite if AWS credentials are configured,
    otherwise gracefully falls back to OpenAI with provider indication.
    """
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_NOVA_LITE", os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0"))

    if aws_key and aws_secret:
        try:
            from strands import Agent
            from strands.models.bedrock import BedrockModel

            model = BedrockModel(model_id=bedrock_model_id)
            agent = Agent(model=model)
            response = agent(prompt)
            return {
                "prompt": prompt,
                "response": str(response),
                "provider": f"Amazon Bedrock ({bedrock_model_id}) via Strands",
            }
        except Exception as exc:
            # If Bedrock connection fails, continue to fallback
            print(f"Bedrock invocation failed ({exc}), falling back to OpenAI")

    # OpenAI Fallback
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )
    completion = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {
                "role": "system",
                "content": "You are a helpful Strands-style AI agent powered by Amazon Bedrock Nova Lite.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )
    reply = completion.choices[0].message.content or ""
    return {
        "prompt": prompt,
        "response": reply,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Strands Bedrock Fallback)",
    }


if __name__ == "__main__":
    test_prompt = "Hello! Tell me a fun fact about AI agents."
    print("Testing Hello World Agent...")
    res = run_hello_world_agent(test_prompt)
    print("Provider:", res["provider"])
    print("Response:\n", res["response"])

