"""Starter feature: a dependency-free "echo" that transforms text.

This module exists so the template runs end to end without any API keys.
Replace it with your project's real feature modules (one module per feature,
each exposing a small function that ``app.py`` calls). Keeping features in
their own modules makes them easy to add, remove, or test in isolation.
"""


def echo(text: str) -> str:
    """Return a short, upper-cased confirmation of the input text.

    Args:
        text: The message to echo back.

    Returns:
        A formatted string echoing the input. Pure Python — no network or
        API keys — so it works offline and in CI.
    """
    cleaned = text.strip()
    return f"You said: {cleaned.upper()} ({len(cleaned)} characters)"


if __name__ == "__main__":
    # Allow running this feature directly:  docker compose run --rm echo
    message = input("Enter a message to echo: ")
    print(echo(message))
