"""Unit tests for the joke and travel features.

The OpenAI/Groq clients are mocked so tests run offline and never make
real API calls or require API keys.
"""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

import joke
import travel


def _fake_client(reply: str) -> MagicMock:
    """Build a mock client whose chat completion returns ``reply``."""

    client = MagicMock()
    client.chat.completions.create.return_value = SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=reply))]
    )
    return client


def test_get_joke_returns_content(monkeypatch: pytest.MonkeyPatch) -> None:
    client = _fake_client("Why did the chicken cross the road?")
    monkeypatch.setattr(joke, "get_groq_client", lambda: client)

    assert get_result := joke.get_joke()
    assert get_result == "Why did the chicken cross the road?"
    client.chat.completions.create.assert_called_once()


def test_get_travel_suggestion_uses_city(monkeypatch: pytest.MonkeyPatch) -> None:
    client = _fake_client("Visit Cubbon Park.")
    monkeypatch.setattr(travel, "get_openai_client", lambda: client)

    result = travel.get_travel_suggestion("Bangalore")

    assert result == "Visit Cubbon Park."
    _, kwargs = client.chat.completions.create.call_args
    user_message = kwargs["messages"][-1]["content"]
    assert "Bangalore" in user_message
