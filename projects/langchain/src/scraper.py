"""Fetch and clean the readable text contents of a web page.

This module is intentionally kept separate from summarizer.py so it can
be reused by any future feature that needs raw page text (e.g. a Q&A
feature, a translation feature, etc.).  It performs plain web scraping —
no AI is involved here.
"""

import requests
from bs4 import BeautifulSoup

# Many servers block requests that don't look like a real browser.
# Sending a realistic User-Agent and Accept header avoids most simple
# bot-detection checks while staying well within normal usage.
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch_website_contents(url: str) -> str:
    """Download a web page and return its title and cleaned text.

    The text is cleaned so it can be included in an LLM prompt without
    wasting tokens on HTML boilerplate.  The function never raises — if
    the page cannot be fetched it returns an error string so the caller
    (and ultimately the model) can surface a helpful message.

    Args:
        url: The page to fetch.  May be given without a scheme; ``https://``
             will be prepended automatically.

    Returns:
        A string of the form::

            Title: <page title>

            Page contents:
            <cleaned body text>

        …or an error message prefixed with "Could not fetch the website."
    """
    # Users often paste bare domains like "example.com"; add a scheme so
    # requests doesn't raise an invalid-URL error.
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        # timeout=15 prevents the endpoint from hanging indefinitely on slow
        # or unresponsive servers.
        response = requests.get(url, headers=HEADERS, timeout=15)
        # Raise an HTTPError for 4xx / 5xx status codes so we can catch and
        # return a friendly error message below.
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        # Return instead of raising so the summarizer can pass the error
        # text straight to the model (or the API can surface it to the UI).
        return f"Could not fetch the website. Error: {e}"

    # Parse the raw HTML with BeautifulSoup's built-in html.parser (no extra
    # C libraries required, unlike lxml).
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract the page title before decomposing anything.
    title = soup.title.string if soup.title else "No title found"

    # Remove tags that add noise but no useful content for an LLM:
    #   script / style  — code and CSS, not human-readable text
    #   nav / header / footer — repeated site chrome that inflates token count
    #   img / input     — non-text elements whose attributes we don't need
    for tag in soup(["script", "style", "nav", "footer", "header", "img", "input"]):
        tag.decompose()

    # get_text with separator="\n" produces one block of readable plain text
    # from what remains; strip=True removes leading/trailing whitespace from
    # each extracted string chunk.
    text = soup.get_text(separator="\n", strip=True)
    return f"Title: {title}\n\nPage contents:\n{text}"


if __name__ == "__main__":
    # Quick manual test: run `python scraper.py` to print the cleaned text
    # of example.com to the terminal.
    print(fetch_website_contents("example.com"))
