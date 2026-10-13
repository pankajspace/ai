import os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class JokeRequest(BaseModel):
    topic: str = Field(default="programming", description="Topic for the joke")


class JokeResponse(BaseModel):
    topic: str
    joke: str


def get_groq_joke(topic: str = "programming") -> str:
    """Tell a funny joke on a topic using Groq (Llama 3.3 70B)."""

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in .env")

    base_url = os.getenv("GROQ_BASE_URL")
    model = os.getenv("GROQ_MODEL")

    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=15.0,
    )
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a funny joke teller."},
            {"role": "user", "content": f"Tell me a joke about {topic}."},
        ],
        timeout=15.0,
    )
    return response.choices[0].message.content or ""


if __name__ == "__main__":
    print(get_groq_joke("programming"))