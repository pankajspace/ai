"""Send one prompt to two models and return both replies for comparison.

The LLM Arena feature lets users compare how a proprietary model (GPT-4o mini
via OpenAI) and an open-source model (Llama 3.3 70B via Groq) respond to the
exact same prompt.  Both calls are made sequentially; a future improvement
could fire them concurrently using asyncio or threading.
"""

from config import get_groq_client, get_openai_client

# Model A — OpenAI's GPT-4o mini: fast, cheap, high quality instruction-following.
OPENAI_MODEL = "gpt-4o-mini"

# Model B — Meta's Llama 3.3 70B served by Groq: open-source, free tier,
# very fast inference thanks to Groq's custom LPU hardware.
GROQ_MODEL = "llama-3.1-70b-versatile"


def _ask(client, model: str, prompt: str) -> str:
    """Send a single-turn prompt to a model and return its reply text.

    This private helper keeps the repetitive chat completion call in one
    place so battle() stays readable.  Both providers accept the exact
    same request format, which is why one helper covers both.
    """
    response = client.chat.completions.create(
        model=model,
        # A single user message with no system prompt keeps the comparison
        # fair — both models receive identical context.
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def battle(prompt: str) -> dict:
    """Ask the same prompt to OpenAI and Groq and return both answers.

    The calls are made sequentially (OpenAI first, then Groq).  Each
    result includes the model name so the UI can label each column
    independently of the order.

    Args:
        prompt: The user's prompt — sent unchanged to both models.

    Returns:
        A dict of the form::

            {
                "model_a": {"model": "gpt-4o-mini",            "reply": "..."},
                "model_b": {"model": "llama-3.3-70b-versatile", "reply": "..."},
            }
    """
    # Call OpenAI first (typically higher latency due to more capable model).
    openai_reply = _ask(get_openai_client(), OPENAI_MODEL, prompt)

    # Then call Groq — Groq's LPU hardware makes Llama responses very fast.
    groq_reply = _ask(get_groq_client(), GROQ_MODEL, prompt)

    # Bundle both results into a labelled dict so the API response and UI
    # always know which reply came from which provider.
    return {
        "model_a": {"model": OPENAI_MODEL, "reply": openai_reply},
        "model_b": {"model": GROQ_MODEL, "reply": groq_reply},
    }


if __name__ == "__main__":
    # Quick manual test: run `python arena.py` to print both replies side-by-side.
    result = battle("Suggest one thing to do in Bangalore.")
    print(f"{result['model_a']['model']}: {result['model_a']['reply']}\n")
    print(f"{result['model_b']['model']}: {result['model_b']['reply']}")
