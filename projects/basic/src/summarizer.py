"""Summarize the contents of a website using GPT-4o mini.

This module chains two steps together:
  1. scraper.fetch_website_contents() — downloads and cleans the page.
  2. An OpenAI chat completion — reads the cleaned text and produces a
     short markdown summary.

Keeping the two steps separate makes each one independently testable and
allows the scraper to be reused by other features in the future.
"""

from config import get_openai_client
from scraper import fetch_website_contents

# GPT-4o mini is a good balance of quality vs. cost for summarization:
# the task is well-defined enough that a smaller model handles it reliably.
SUMMARIZER_MODEL = "gpt-4o-mini"

# The system prompt primes the model to act as a focused summarizer.
# Telling it to "ignore navigation menus" discourages it from echoing back
# repeated boilerplate that slipped through the scraper.
# Asking for markdown means the UI can render headings / bullets natively.
SYSTEM_PROMPT = """You analyze the contents of a website and
give a short, friendly summary. Ignore navigation menus.
Respond in markdown."""


def summarize(url: str) -> str:
    """Fetch a web page and return a short markdown summary of it.

    The function scrapes the URL first, then passes the cleaned text to
    GPT-4o mini.  If scraping fails, fetch_website_contents() returns an
    error string — the model will then summarize that error, which the
    caller or UI can detect and display accordingly.

    Args:
        url: The website URL to summarize.  Scheme is optional.

    Returns:
        A markdown-formatted summary string from the model.
    """
    # Step 1 — get the page text (title + body, scripts/nav stripped).
    website = fetch_website_contents(url)

    # Step 2 — ask the model to summarize what we scraped.
    client = get_openai_client()
    response = client.chat.completions.create(
        model=SUMMARIZER_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                # We embed the full page text directly into the user message.
                # For very large pages this could exceed the context window;
                # a production version would truncate or chunk the text first.
                "content": f"Summarize this website:\n\n{website}",
            },
        ],
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    # Quick manual test: run `python summarizer.py` to print a summary
    # of example.com to the terminal.
    print(summarize("example.com"))
