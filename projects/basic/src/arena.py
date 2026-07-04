"""Send one prompt to two models and return both replies for comparison."""

from config import get_groq_client, get_openai_client

OPENAI_MODEL = "gpt-4o-mini"
GROQ_MODEL = "llama-3.3-70b-versatile"


def _ask(client, model: str, prompt: str) -> str:
    """Send a single-turn prompt to a model and return its reply text."""

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def battle(prompt: str) -> dict:
    """Ask the same prompt to OpenAI and Groq and return both answers.

    Args:
        prompt: The prompt to send to both models.

    Returns:
        A dict with ``model_a`` (OpenAI GPT-4o mini) and ``model_b``
        (Groq Llama 3.3 70B), each holding the model name and its reply.
    """

    openai_reply = _ask(get_openai_client(), OPENAI_MODEL, prompt)
    groq_reply = _ask(get_groq_client(), GROQ_MODEL, prompt)
    return {
        "model_a": {"model": OPENAI_MODEL, "reply": openai_reply},
        "model_b": {"model": GROQ_MODEL, "reply": groq_reply},
    }


if __name__ == "__main__":
    result = battle("Suggest one thing to do in Bangalore.")
    print(f"{result['model_a']['model']}: {result['model_a']['reply']}\n")
    print(f"{result['model_b']['model']}: {result['model_b']['reply']}")
