"""Fetch and clean the readable text contents of a web page.

This module uses LangChain's WebBaseLoader to fetch and parse the page.
It is kept separate from summarizer.py so it can be reused by any future
feature that needs raw page text.
"""

from langchain_community.document_loaders import WebBaseLoader

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
    """Download a web page and return its title and cleaned text using LangChain.

    The text is cleaned so it can be included in an LLM prompt without
    wasting tokens on HTML boilerplate. The function never raises — if
    the page cannot be fetched it returns an error string.

    Args:
        url: The page to fetch. May be given without a scheme; ``https://``
             will be prepended automatically.

    Returns:
        A string of the form::

            Title: <page title>

            Page contents:
            <cleaned body text>

        …or an error message prefixed with "Could not fetch the website."
    """
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        # WebBaseLoader uses requests and BeautifulSoup under the hood.
        loader = WebBaseLoader(url)
        # Pass headers and timeout via requests_kwargs
        loader.requests_kwargs = {"headers": HEADERS, "timeout": 15}
        
        docs = loader.load()
        if not docs:
            return "Could not fetch the website."
            
        title = docs[0].metadata.get("title", "No title found")
        # WebBaseLoader parses text with soup.get_text() by default.
        text = docs[0].page_content.strip()
        
        return f"Title: {title}\n\nPage contents:\n{text}"
    except Exception as e:
        return f"Could not fetch the website. Error: {e}"


if __name__ == "__main__":
    # Quick manual test: run `python scraper.py` to print the cleaned text
    # of example.com to the terminal.
    print(fetch_website_contents("example.com"))
