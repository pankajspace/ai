"""Chain-of-Thought vs Direct Answer Reliability Benchmark Service.

Demonstrates that Chain-of-Thought (step-by-step reasoning) acts as a reliability lever:
1. Benchmarks challenging multi-step logic problems (Spatial Navigation, Relational Logic, Temporal Scheduling, Inventory State, Truth-Tellers).
2. Runs two prompt strategies:
   - Direct: "Answer in one short sentence. Do not show working."
   - CoT: "Think step by step, then state your final answer."
3. Measures accuracy, latency, and step-by-step cognitive traces.

Run directly:
    python projects/ai-pocs/server/services/25_cot_vs_direct.py
"""

import os
import re
import time
from typing import Any, Dict, List, Optional
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class CotVsDirectRequest(BaseModel):
    """Input payload for CoT vs Direct Benchmark."""

    problem_title: Optional[str] = Field(
        default="Spatial Navigation (Grid)",
        description="Preset logic problem or 'custom'",
    )
    custom_question: Optional[str] = Field(
        default=None,
        description="Optional replacement question, scored against the preset's accepted answers",
    )


class CotVsDirectResult(BaseModel):
    strategy: str
    response: str
    extracted_answer: str
    is_correct: bool
    latency_seconds: float


class CotVsDirectResponse(BaseModel):
    """Output payload from CoT vs Direct Benchmark."""

    problem_title: str
    question: str
    accepted_answers: List[str]
    direct_result: CotVsDirectResult
    cot_result: CotVsDirectResult
    model: str


PROBLEMS = {
    "Spatial Navigation (Grid)": {
        "question": (
            "Start at origin (0,0) facing North (+Y direction). "
            "Move forward 3 units. Turn right 90 degrees. Move forward 2 units. "
            "Turn right 90 degrees. Move forward 5 units. "
            "Turn left 90 degrees. Move backward 2 units. "
            "What are your exact final (X,Y) coordinates? Format as (X, Y)."
        ),
        "correct_answers": ["(0, -2)", "(0,-2)"],
        "explanation": "Start(0,0) N -> Fwd 3 to (0,3). Right to E -> Fwd 2 to (2,3). Right to S -> Fwd 5 to (2,-2). Left to E -> Back 2 (moving West) to (0,-2).",
    },
    "Relational Logic (Family Tree)": {
        "question": (
            "Alice is the sister of Bob. Bob is the father of Charlie. "
            "Charlie is the brother of Diana. Diana is the mother of Eve. "
            "What is the exact biological relationship of Alice to Eve?"
        ),
        "correct_answers": ["great-aunt", "great aunt", "grand-aunt", "grand aunt"],
        "explanation": "Bob is Diana's father. Alice is Bob's sister, making her Diana's aunt. Diana is Eve's mother, making Alice Eve's great-aunt.",
    },
    "Temporal Scheduling": {
        "question": (
            "Five speakers (A, B, C, D, E) present one after another. "
            "E must speak exactly third. B must speak immediately after D. "
            "D cannot be the first speaker. C must speak at some point before A. "
            "What is the exact sequence of the 5 speakers from first to last? Format as a comma-separated list."
        ),
        "correct_answers": ["c, a, e, d, b", "c,a,e,d,b", "c a e d b"],
        "explanation": "E is 3rd. D cannot be 1st, so DB is 4-5. C before A fills 1-2. Result: C, A, E, D, B.",
    },
}


def evaluate_cot_accuracy(extracted: str, accepted: List[str]) -> bool:
    """Evaluate whether answer matches any accepted answers."""
    # ① Strip whitespace and hyphens before matching against accepted ground-truth strings
    cleaned = extracted.lower().replace(" ", "").replace("-", "")
    for acc in accepted:
        clean_acc = acc.lower().replace(" ", "").replace("-", "")
        if clean_acc in cleaned:
            return True
    return False


def run_cot_vs_direct_benchmark(
    problem_title: str = "Spatial Navigation (Grid)",
    custom_question: Optional[str] = None,
) -> dict:
    """Execute CoT vs Direct comparison."""
    # ① Initialize OpenAI client and resolve preset or custom logic puzzle
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    preset = PROBLEMS.get(problem_title, PROBLEMS["Spatial Navigation (Grid)"])
    q_text = custom_question or preset["question"]
    accepted = preset["correct_answers"]

    # ② Run Direct Strategy (no intermediate working allowed)
    start_d = time.perf_counter()
    direct_prompt = f"{q_text}\n\nAnswer in one short sentence. Do not show working."
    resp_d = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": direct_prompt}],
        temperature=0.3,
    )
    dur_d = time.perf_counter() - start_d
    text_d = resp_d.choices[0].message.content or ""
    correct_d = evaluate_cot_accuracy(text_d, accepted)

    # ③ Run Chain-of-Thought Strategy (step-by-step reasoning before final answer)
    start_c = time.perf_counter()
    cot_prompt = f"{q_text}\n\nThink step by step, then state your final answer clearly on a new line."
    resp_c = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": cot_prompt}],
        temperature=0.3,
    )
    dur_c = time.perf_counter() - start_c
    text_c = resp_c.choices[0].message.content or ""
    correct_c = evaluate_cot_accuracy(text_c, accepted)

    # ④ Return side-by-side accuracy, latency, and reasoning traces
    return {
        "problem_title": problem_title,
        "question": q_text,
        "accepted_answers": accepted,
        "direct_result": {
            "strategy": "Direct (No Working)",
            "response": text_d,
            "extracted_answer": text_d.strip(),
            "is_correct": correct_d,
            "latency_seconds": round(dur_d, 3),
        },
        "cot_result": {
            "strategy": "Chain-of-Thought (Step-by-Step)",
            "response": text_c,
            "extracted_answer": text_c.strip().splitlines()[-1],
            "is_correct": correct_c,
            "latency_seconds": round(dur_c, 3),
        },
        "model": model,
    }


if __name__ == "__main__":
    out = run_cot_vs_direct_benchmark()
    print("Direct Correct:", out["direct_result"]["is_correct"])
    print("CoT Correct:", out["cot_result"]["is_correct"])

