"""Fetch and clean the readable text contents of a web page."""

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch_website_contents(url: str) -> str:
    """Download a web page and return its title and cleaned text.

    Adds an ``https://`` scheme if the caller omitted it, strips noisy
    tags (scripts, styles, navigation, etc.), and returns the readable
    text so it can be handed to a model.

    Args:
        url: The page to fetch. May be given without a scheme.

    Returns:
        A string containing the page title and its cleaned text, or an
        error message if the page could not be retrieved.
    """

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return f"Could not fetch the website. Error: {e}"

    soup = BeautifulSoup(response.text, "html.parser")
    title = soup.title.string if soup.title else "No title found"

    for tag in soup(["script", "style", "nav", "footer", "header", "img", "input"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    return f"Title: {title}\n\nPage contents:\n{text}"


if __name__ == "__main__":
    print(fetch_website_contents("example.com"))
