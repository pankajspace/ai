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
    """Suggest one thing to do in a given city using GPT-4o mini."""
    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a witty travel guide."},
            {"role": "user", "content": f"Suggest one thing to do in {city}."},
        ],
    )
    return response.choices[0].message.content or ""


if __name__ == "__main__":
    print(get_travel_suggestion("Bangalore"))

