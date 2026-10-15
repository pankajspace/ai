"""Prompting Strategies Benchmark Service (Direct vs Zero-Shot CoT vs Few-Shot CoT).

Benchmarks three fundamental prompting strategies:
1. Direct: "Answer the question directly. Do not include working."
2. Zero-Shot CoT: "Think through the problem step by step..."
3. Few-Shot CoT: Provides explicit worked reasoning examples.

Measures accuracy, prompt tokens, completion tokens, and latency trade-offs.
"""

import os
import re
import time
from typing import List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv(find_dotenv())


class PromptingStrategiesRequest(BaseModel):
    """Input payload for Prompting Strategies Benchmark."""

    question: str = "A shop sells pens at 23 rupees each. Ravi buys 7 pens, returns 2 of them, then buys 4 more. He pays the final bill with a 500 rupee note. How much change does he get? (Answer with the number only)"
    expected_answer: str = "293"


class StrategyResult(BaseModel):
    name: str
    response_text: str
    extracted_answer: str
    is_correct: bool
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    latency_seconds: float


class PromptingStrategiesResponse(BaseModel):
    """Output payload from Prompting Strategies Benchmark."""

    expected_answer: str
    strategies: List[StrategyResult]


FEW_SHOT_EXAMPLES = """
Example 1:
Question: If I have 3 apples and I give 2 to my friend, but then my friend gives me 1 back, how many apples do I have?
Thought:
1. Start with 3 apples.
2. Give 2 away: 3 - 2 = 1 apple remaining.
3. Friend gives 1 back: 1 + 1 = 2 apples.
Answer: 2

Example 2:
Question: A worker makes 12 widgets an hour. How many widgets can 3 workers make in 4 hours?
Thought:
1. One worker makes 12 widgets in 1 hour.
2. Three workers make 12 * 3 = 36 widgets in 1 hour.
3. In 4 hours, they make 36 * 4 = 144 widgets.
Answer: 144
"""


def extract_final_answer(response_text: str) -> str:
    """Extract final answer clause from output."""
    # ① Look for explicit 'Answer:' delimiter or fallback to the final line
    text = response_text.strip()
    matches = list(re.finditer(r"answer\s*:", text, flags=re.IGNORECASE))
    if matches:
        segment = text[matches[-1].end() :]
    else:
        lines = [ln for ln in text.splitlines() if ln.strip()]
        segment = lines[-1] if lines else ""

    # ② Strip markdown formatting and normalize case
    segment = segment.strip().splitlines()[0] if segment.strip() else ""
    return segment.replace("*", "").replace("`", "").strip().lower()


def evaluate_accuracy(extracted: str, expected: str) -> bool:
    """Evaluate if extracted answer matches expected."""
    # ① Normalize both extracted and expected answers before checking containment
    if not extracted or not expected:
        return False
    clean_extracted = re.sub(r"[^\w\.\:\/]", "", extracted)
    clean_expected = re.sub(r"[^\w\.\:\/]", "", expected.lower())
    return clean_expected in clean_extracted


def run_prompting_strategies(
    question: str = "A shop sells pens at 23 rupees each. Ravi buys 7 pens, returns 2 of them, then buys 4 more. He pays the final bill with a 500 rupee note. How much change does he get? (Answer with the number only)",
    expected_answer: str = "293",
) -> dict:
    """Execute all three prompting strategies and compare metrics."""
    # ① Initialize the OpenAI client and model configuration
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # ② Construct Direct, Zero-Shot CoT, and Few-Shot CoT prompts
    prompts = {
        "Direct": f"{question}\n\nAnswer the question directly. State your final answer in the format: 'Answer: <your answer>'. Do not include any explanations or working.",
        "Zero-Shot CoT": f"{question}\n\nThink through the problem step by step to find the solution. After your reasoning, state your final answer on a new line in the format: 'Answer: <your answer>'.",
        "Few-Shot CoT": f"Solve the following reasoning problems step by step.\n\n{FEW_SHOT_EXAMPLES}\nQuestion: {question}\nThought:\n",
    }

    results = []

    # ③ Run each strategy and measure latency and token usage
    for name, p_text in prompts.items():
        start_t = time.perf_counter()
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": p_text}],
            temperature=0.3,
        )
        dur = time.perf_counter() - start_t
        text = resp.choices[0].message.content or ""
        p_tok = resp.usage.prompt_tokens
        c_tok = resp.usage.completion_tokens

        # ④ Extract the final answer and score accuracy against ground truth
        extracted = extract_final_answer(text)
        correct = evaluate_accuracy(extracted, expected_answer)

        results.append(
            {
                "name": name,
                "response_text": text,
                "extracted_answer": extracted,
                "is_correct": correct,
                "prompt_tokens": p_tok,
                "completion_tokens": c_tok,
                "total_tokens": p_tok + c_tok,
                "latency_seconds": round(dur, 3),
            }
        )

    # ⑤ Return comparative benchmark metrics across all three strategies
    return {"expected_answer": expected_answer, "strategies": results}

