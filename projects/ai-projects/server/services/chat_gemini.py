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

    client = OpenAI(
        api_key=os.getenv("GEMINI_API_KEY"),
        base_url=os.getenv("GEMINI_BASE_URL"),
    )
    response = client.chat.completions.create(
        model=os.getenv("GEMINI_MODEL"),
        messages=[
            {"role": "system", "content": "You are a funny joke teller."},
            {"role": "user", "content": f"Tell me a joke about {topic}."},
        ],
    )
    return response.choices[0].message.content or ""


if __name__ == "__main__":
    print(get_gemini_joke())