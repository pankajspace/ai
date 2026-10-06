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

# Each personality swaps one phrase of the system prompt — the same code
# produces a very different summary.  Keys are the only values the API accepts.
PERSONALITIES = {
    "friendly": "give a short, friendly summary in plain English",
    "snarky": "give a short, snarky and humorous summary",
    "eli5": "explain it in a short summary a 5-year-old could understand",
    "professional": "give a concise executive summary in a professional tone",
}
DEFAULT_PERSONALITY = "friendly"

# Upper bound on pasted article text, to keep prompt size (and cost) in check.
MAX_TEXT_CHARS = 20_000


def build_system_prompt(personality: str = DEFAULT_PERSONALITY) -> str:
    """Return the system prompt for a personality (unknown keys fall back to friendly).

    Telling the model to "ignore navigation menus" discourages it from echoing
    boilerplate that slipped through the scraper; asking for markdown lets the
    UI render headings / bullets.
    """
    # ① choose the requested summary style or fall back to friendly
    style = PERSONALITIES.get(personality, PERSONALITIES[DEFAULT_PERSONALITY])
    # ② build one system prompt that tells the model how to summarize
    return (
        f"You analyze the contents of a website or article and {style}. "
        "Ignore navigation menus.\nRespond in markdown."
    )


def _complete(user_content: str, personality: str) -> str:
    # ① create the OpenAI client that will run the summarizer model
    client = get_openai_client()
    # ② send the system instructions and content to the model
    response = client.chat.completions.create(
        model=SUMMARIZER_MODEL,
        messages=[
            {"role": "system", "content": build_system_prompt(personality)},
            {"role": "user", "content": user_content},
        ],
    )
    # ③ return the model's markdown summary text
    return response.choices[0].message.content


def summarize(url: str, personality: str = DEFAULT_PERSONALITY) -> str:
    """Fetch a web page and return a short markdown summary of it.

    The function scrapes the URL first, then passes the cleaned text to
    GPT-4o mini.  If scraping fails, fetch_website_contents() returns an
    error string — the model will then summarize that error, which the
    caller or UI can detect and display accordingly.

    Args:
        url: The website URL to summarize.  Scheme is optional.
        personality: One of the PERSONALITIES keys.

    Returns:
        A markdown-formatted summary string from the model.
    """
    # ① fetch and clean the website text before using any model tokens
    website = fetch_website_contents(url)
    # ② ask the shared completion helper to summarize the cleaned page
    return _complete(f"Summarize this website:\n\n{website}", personality)


def summarize_text(text: str, personality: str = DEFAULT_PERSONALITY) -> str:
    """Summarize pasted article text directly (no scraping)."""
    return _complete(f"Summarize this article:\n\n{text}", personality)


if __name__ == "__main__":
    # Quick manual test: run `python summarizer.py` to print a summary
    # of example.com to the terminal.
    print(summarize("example.com"))
