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

    results = []

    # ② Strategy A: Unconstrained freeform prompt (high variance, fails JSON parsing)
    prompt_a = f"Extract product, sentiment, pros, cons, and rating from this review:\n\n{review_text}"
    resp_a = client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt_a}])
    text_a = resp_a.choices[0].message.content or ""
    is_json_a = False
    parsed_a = None
    err_a = "Not valid JSON"
    try:
        parsed_a = json.loads(text_a)
        is_json_a = True
        err_a = None
    except Exception as exc:
        err_a = str(exc)

    results.append({
        "strategy_name": "Strategy A: Unconstrained (Freeform Prompt)",
        "raw_output": text_a,
        "is_valid_json": is_json_a,
        "parsed_data": parsed_a,
        "parse_error": err_a,
    })

    # ③ Strategy B: Prompt-constrained JSON instructions (requires fence stripping)
    prompt_b = (
        f"Extract product, sentiment (positive/negative/mixed), pros (list), cons (list), and rating (number) "
        f"from this review as JSON with keys 'product', 'sentiment', 'pros', 'cons', 'rating'. "
        f"Do not include markdown ticks or commentary:\n\n{review_text}"
    )
    resp_b = client.chat.completions.create(model=model, messages=[{"role": "user", "content": prompt_b}])
    text_b = resp_b.choices[0].message.content or ""
    is_json_b = False
    parsed_b = None
    err_b = None
    try:
        # Strip potential markdown fences
        clean_b = text_b.replace("```json", "").replace("```", "").strip()
        parsed_b = json.loads(clean_b)
        is_json_b = True
    except Exception as exc:
        err_b = str(exc)

    results.append({
        "strategy_name": "Strategy B: Prompt-Constrained (Instructional JSON)",
        "raw_output": text_b,
        "is_valid_json": is_json_b,
        "parsed_data": parsed_b,
        "parse_error": err_b,
    })

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
    is_json_c = False
    parsed_c = None
    err_c = None
    try:
        parsed_c = json.loads(text_c)
        is_json_c = True
    except Exception as exc:
        err_c = str(exc)

    results.append({
        "strategy_name": "Strategy C: Schema-Enforced (API Guaranteed JSON)",
        "raw_output": text_c,
        "is_valid_json": is_json_c,
        "parsed_data": parsed_c,
        "parse_error": err_c,
    })

    # ⑤ Return all three strategy outputs and JSON parse results
    return {
        "review_text": review_text,
        "strategies": results,
        "model": model,
    }


if __name__ == "__main__":
    out = run_variance_determinism_benchmark()
    for s in out["strategies"]:
        print(f"[{s['strategy_name']}] Valid JSON: {s['is_valid_json']}")

