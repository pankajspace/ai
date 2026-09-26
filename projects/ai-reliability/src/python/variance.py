"""Variance & Determinism: how output constraints make a model a reliable component.

Adapted from ``study/09-ai-reliability/variance-determinism.py``. The same
extraction task runs N times under three strategies at temperature 0.7:

  A  Unconstrained prompt
  B  Prompt asks for JSON
  C  Schema enforced by the API (``response_format=json_schema``, strict)

Each response is graded by a strict downstream parser (plain ``json.loads``,
no fence stripping or repair), so the report shows how often a real pipeline
would survive the output.
"""

import json
from collections import Counter

from config import CHAT_MODEL, get_openai_client, parallel_map

RUNS_PER_STRATEGY = 5
TEMPERATURE = 0.7
MAX_REVIEW_CHARS = 1000

DEFAULT_REVIEW = (
    "The new smartphone is amazing, the camera quality is top-notch but the "
    "battery life is a bit disappointing. I love the design though!"
)

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "sentiment": {"type": "string", "enum": ["Positive", "Negative", "Mixed"]},
        "entities": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["sentiment", "entities"],
    "additionalProperties": False,
}

SCHEMA_FORMAT = {
    "type": "json_schema",
    "json_schema": {"name": "review_extraction", "strict": True, "schema": RESPONSE_SCHEMA},
}


def build_prompts(review: str) -> tuple[str, str]:
    """Return (unconstrained_prompt, json_prompt) for a review."""
    task = f"Extract the sentiment and key entities from this customer review: '{review}'"
    constrained = (
        f"{task}\n"
        "Output only a JSON object with the keys 'sentiment' and 'entities'. "
        "'sentiment' should be a string (Positive, Negative, or Mixed). "
        "'entities' should be a list of strings."
    )
    return task, constrained


def call_model(prompt: str, response_format: dict | None = None) -> str:
    """Return the model's text, or a string starting with 'Error:' on failure."""
    kwargs = {
        "model": CHAT_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": TEMPERATURE,
    }
    if response_format is not None:
        kwargs["response_format"] = response_format
    try:
        response = get_openai_client().chat.completions.create(**kwargs)
        return (response.choices[0].message.content or "").strip()
    except Exception as e:
        return f"Error: {e}"


def parse_downstream(raw: str) -> tuple[bool, bool]:
    """Return (parsed_ok, schema_ok) the way a strict pipeline would see it."""
    if raw.startswith("Error:"):
        return False, False
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return False, False
    if not isinstance(data, dict):
        return True, False
    sentiment = data.get("sentiment")
    entities = data.get("entities")
    schema_ok = (
        sentiment in ("Positive", "Negative", "Mixed")
        and isinstance(entities, list)
        and all(isinstance(e, str) for e in entities)
    )
    return True, schema_ok


def metrics(responses: list[str]) -> dict:
    """Variance and downstream-reliability metrics; API errors are excluded."""
    valid = [r for r in responses if not r.startswith("Error:")]
    errors = len(responses) - len(valid)
    if not valid:
        return {"unique": 0, "consistency": 0, "parse": 0, "schema": 0, "total": 0, "errors": errors}
    verdicts = [parse_downstream(r) for r in valid]
    n = len(valid)
    return {
        "unique": len(Counter(valid)),
        "consistency": round(Counter(valid).most_common(1)[0][1] / n * 100),
        "parse": round(sum(p for p, _ in verdicts) / n * 100),
        "schema": round(sum(s for _, s in verdicts) / n * 100),
        "total": n,
        "errors": errors,
    }


def run_variance(review: str) -> str:
    """Run all three strategies on ``review`` and return a text report."""
    review = review.strip()[:MAX_REVIEW_CHARS]
    unconstrained, constrained = build_prompts(review)
    strategies = [
        ("A · Unconstrained prompt", unconstrained, None),
        ("B · Prompt asks for JSON", constrained, None),
        ("C · Schema enforced by API", constrained, SCHEMA_FORMAT),
    ]

    jobs = [(p, fmt) for _, p, fmt in strategies for _ in range(RUNS_PER_STRATEGY)]
    outputs = parallel_map(lambda job: call_model(*job), jobs)

    lines = [
        f"{RUNS_PER_STRATEGY} runs per strategy · {CHAT_MODEL} · temperature {TEMPERATURE}",
        "",
    ]
    schema_scores = []
    for i, (label, _, _) in enumerate(strategies):
        responses = outputs[i * RUNS_PER_STRATEGY:(i + 1) * RUNS_PER_STRATEGY]
        m = metrics(responses)
        schema_scores.append(m["schema"])
        lines.append(label)
        lines.append(
            f"  unique responses {m['unique']}/{m['total']} · consistency {m['consistency']}% · "
            f"parses as JSON {m['parse']}% · matches schema {m['schema']}%"
        )
        if m["errors"]:
            lines.append(f"  ({m['errors']} API call(s) failed and were excluded)")
        sample = next((r for r in responses if not r.startswith("Error:")), responses[0])
        lines.append(f"  sample: {sample[:300]}{'…' if len(sample) > 300 else ''}")
        lines.append("")

    lines.append(
        f"Takeaway: usable output went {schema_scores[0]}% → {schema_scores[1]}% → {schema_scores[2]}% "
        "at the same temperature. Determinism came from narrowing what the model "
        "was allowed to emit, not from turning down randomness."
    )
    return "\n".join(lines)


if __name__ == "__main__":
    print(run_variance(DEFAULT_REVIEW))
