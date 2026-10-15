"""Structured Output Variance & Determinism Benchmark Service.

Evaluates how output constraints transform stochastic models into deterministic pipeline components:
1. Strategy A (Unconstrained): Model asked for review summary freeform (high variance, brittle to parse).
2. Strategy B (Prompt-Constrained): Prompt instructs JSON format (occasionally wraps markdown code blocks or violates schema).
3. Strategy C (Schema-Enforced): Uses OpenAI Structured Outputs (`response_format: {"type": "json_object"}` or schema) guaranteeing valid parseable JSON.

Run directly:
    python projects/ai-pocs/server/services/26_variance_determinism.py
"""

import json
import os
from typing import Any, Dict, List, Optional
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class VarianceDeterminismRequest(BaseModel):
    """Input payload for Variance & Determinism Benchmark."""

    review_text: str = Field(
        default="The new smartphone is amazing, the camera quality is top-notch but the battery life is a bit disappointing. I love the sleek design though! Rating: 4 out of 5 stars.",
        description="Unstructured review text to extract sentiment and metadata from",
    )


class StrategyOutput(BaseModel):
    strategy_name: str
    raw_output: str
    is_valid_json: bool
    parsed_data: Optional[Dict[str, Any]] = None
    parse_error: Optional[str] = None


class VarianceDeterminismResponse(BaseModel):
    """Output payload from Variance & Determinism Benchmark."""

    review_text: str
    strategies: List[StrategyOutput]
    model: str


def check_json(strategy_name: str, raw_output: str, text_to_parse: str) -> dict:
    """Try to parse a model output as JSON and record whether it worked."""
    try:
        return {"strategy_name": strategy_name, "raw_output": raw_output, "is_valid_json": True,
                "parsed_data": json.loads(text_to_parse), "parse_error": None}
    except json.JSONDecodeError as exc:
        return {"strategy_name": strategy_name, "raw_output": raw_output, "is_valid_json": False,
                "parsed_data": None, "parse_error": str(exc)}


def run_variance_determinism_benchmark(
    review_text: str = "The new smartphone is amazing, the camera quality is top-notch but the battery life is a bit disappointing. I love the sleek design though! Rating: 4 out of 5 stars.",
) -> dict:
    """Run extraction across the three determinism strategies."""
    # ① Initialize OpenAI client
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # ② Strategy A: Unconstrained freeform prompt (high variance, usually fails JSON parsing)
    prompt_a = f"Extract product, sentiment, pros, cons, and rating from this review:\n\n{review_text}"
    resp_a = client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt_a}])
    text_a = resp_a.choices[0].message.content or ""

    # ③ Strategy B: Prompt-constrained JSON instructions (may still need markdown fence stripping)
    prompt_b = (
        f"Extract product, sentiment (positive/negative/mixed), pros (list), cons (list), and rating (number) "
        f"from this review as JSON with keys 'product', 'sentiment', 'pros', 'cons', 'rating'. "
        f"Do not include markdown ticks or commentary:\n\n{review_text}"
    )
    resp_b = client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt_b}])
    text_b = resp_b.choices[0].message.content or ""

    # ④ Strategy C: API Schema-Enforced JSON mode (response_format={"type": "json_object"})
    prompt_c = (
        f"Extract review metadata into JSON with keys 'product', 'sentiment', 'pros', 'cons', 'rating':\n\n{review_text}"
    )
    resp_c = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt_c}],
        response_format={"type": "json_object"},
    )
    text_c = resp_c.choices[0].message.content or ""

    # ⑤ Check which outputs parse as JSON and return all three side by side
    return {
        "review_text": review_text,
        "strategies": [
            check_json("Strategy A: Unconstrained (Freeform Prompt)", text_a, text_a),
            check_json(
                "Strategy B: Prompt-Constrained (Instructional JSON)",
                text_b,
                text_b.replace("```json", "").replace("```", "").strip(),
            ),
            check_json("Strategy C: Schema-Enforced (API Guaranteed JSON)", text_c, text_c),
        ],
        "model": model,
    }


if __name__ == "__main__":
    out = run_variance_determinism_benchmark()
    for s in out["strategies"]:
        print(f"[{s['strategy_name']}] Valid JSON: {s['is_valid_json']}")

