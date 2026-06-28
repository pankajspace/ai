"""Suggest something to do in a given city using GPT-4o mini."""

from config import get_openai_client

TRAVEL_MODEL = "gpt-4o-mini"


def get_travel_suggestion(city: str = "Bangalore") -> str:
    """Return a travel suggestion for the given city using GPT-4o mini.

    Args:
        city: The city to suggest an activity for.

    Returns:
        The text of the assistant's reply.
    """

    client = get_openai_client()
    response = client.chat.completions.create(
        model=TRAVEL_MODEL,
        messages=[
            {"role": "system", "content": "You are a witty travel guide."},
            {"role": "user", "content": f"Suggest one thing to do in {city}."},
        ],
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    print(get_travel_suggestion())
