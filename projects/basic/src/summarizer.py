"""Summarize the contents of a website using GPT-4o mini."""

from config import get_openai_client
from scraper import fetch_website_contents

SUMMARIZER_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """You analyze the contents of a website and
give a short, friendly summary. Ignore navigation menus.
Respond in markdown."""


def summarize(url: str) -> str:
    """Fetch a web page and return a short markdown summary of it.

    Args:
        url: The website URL to summarize.

    Returns:
        The text of the assistant's summary.
    """

    website = fetch_website_contents(url)
    client = get_openai_client()
    response = client.chat.completions.create(
        model=SUMMARIZER_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Summarize this website:\n\n{website}"},
        ],
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    print(summarize("example.com"))
