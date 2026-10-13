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


def get_gemini_joke(topic: str = "programming") -> str:
    """Tell a funny joke on a topic using Google Gemini."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in .env")

    base_url = os.getenv("GEMINI_BASE_URL") or "https://generativelanguage.googleapis.com/v1beta/openai/"
    model = os.getenv("GEMINI_MODEL") or "gemini-1.5-flash"

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
    print(get_gemini_joke())