import os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class TravelRequest(BaseModel):
    city: str = Field(default="Bangalore", description="City to get a travel suggestion for")


class TravelResponse(BaseModel):
    city: str
    suggestion: str


def get_travel_suggestion(city: str = "Bangalore") -> str:
    """Suggest one thing to do in a given city using OpenAI."""

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured in .env")

    base_url = os.getenv("OPENAI_BASE_URL") or "https://api.openai.com/v1"
    model = os.getenv("OPENAI_MODEL") or "gpt-4o-mini"

    client = OpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=15.0,
    )
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a witty travel guide."},
            {"role": "user", "content": f"Suggest one thing to do in {city}."},
        ],
        timeout=15.0,
    )
    return response.choices[0].message.content or ""


if __name__ == "__main__":
    print(get_travel_suggestion("Bangalore"))
