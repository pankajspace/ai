"""Suggest something to do in a given city using GPT-4o mini.

GPT-4o mini is used here because the task is open-ended creative writing
that benefits from OpenAI's instruction-following quality, while still being
cheap and fast enough for an interactive demo.
"""

from config import get_openai_client

# gpt-4o-mini is a smaller, faster, and cheaper variant of GPT-4o that still
# produces high-quality creative responses — a good fit for this demo.
TRAVEL_MODEL = "gpt-4o-mini"


def get_travel_suggestion(city: str = "Bangalore") -> str:
    """Return a travel suggestion for the given city using GPT-4o mini.

    Args:
        city: The city to suggest an activity for.
              Defaults to Bangalore if the caller does not supply one.

    Returns:
        The text of the assistant's reply as a plain string.
    """
    client = get_openai_client()
    response = client.chat.completions.create(
        model=TRAVEL_MODEL,
        messages=[
            {
                "role": "system",
                # A brief, vivid persona keeps responses short and fun.
                # The model inherits this context for every user message.
                "content": "You are a witty travel guide.",
            },
            {
                "role": "user",
                # Asking for exactly one suggestion keeps the response
                # concise enough to display in a small UI card.
                "content": f"Suggest one thing to do in {city}.",
            },
        ],
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    # Quick manual test: run `python travel.py` to print a suggestion to the terminal.
    print(get_travel_suggestion())
