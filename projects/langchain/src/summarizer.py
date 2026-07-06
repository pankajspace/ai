"""Summarize the contents of a website using a LangChain chain.

This module chains two steps together:
  1. scraper.fetch_website_contents() — downloads and cleans the page.
  2. A LangChain ``prompt | model | parser`` chain — reads the cleaned text
     and produces a short, friendly markdown summary.

The LangChain expression ``prompt | model | parser`` (the "|" means "then")
is the Class 2 way of composing the same request the basic project made with
the raw SDK: a reusable prompt fills a blank, the model answers, and the
parser hands back plain text.
"""

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from config import get_chat_model
from scraper import fetch_website_contents

# A reusable prompt template with a {website} blank the chain fills in by name.
# Asking for markdown lets the UI render headings and bullets natively, and
# telling the model to ignore navigation discourages echoing site boilerplate.
PROMPT = ChatPromptTemplate.from_template(
    "You analyze the contents of a website and give a short, friendly "
    "summary. Ignore navigation menus. Respond in markdown.\n\n"
    "Summarize this website:\n\n{website}"
)


def _build_chain():
    """Assemble the summarizer chain: prompt | model | parser.

    Built lazily inside a function (rather than at import time) so importing
    this module never requires an API key — the model client is only created
    when a summary is actually requested.  Low temperature keeps the summary
    factual, and StrOutputParser unwraps the model's message into plain text.
    """
    return PROMPT | get_chat_model(temperature=0.3) | StrOutputParser()


def summarize(url: str) -> str:
    """Fetch a web page and return a short markdown summary of it.

    The function scrapes the URL first, then passes the cleaned text through
    the LangChain chain.  If scraping fails, fetch_website_contents() returns
    an error string — the model then summarizes that error, which the caller
    or UI can detect and display accordingly.

    Args:
        url: The website URL to summarize.  Scheme is optional.

    Returns:
        A markdown-formatted summary string from the model.
    """
    # Step 1 — get the page text (title + body, scripts/nav stripped).
    website = fetch_website_contents(url)

    # Step 2 — run the chain; the dict fills the {website} blank by name.
    return _build_chain().invoke({"website": website})


if __name__ == "__main__":
    # Quick manual test: run `python summarizer.py` to print a summary
    # of example.com to the terminal.
    print(summarize("example.com"))
