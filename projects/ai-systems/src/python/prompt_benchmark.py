"""Prompting Strategy Benchmark: Direct vs Zero-Shot CoT vs Few-Shot CoT.

Derived from study/08-ai-systems/direct-zero-shot-few-shot.py.
Benchmarks three prompting strategies on multi-step reasoning questions.
Reports answers, reasoning traces, token usage, and latency.
"""

import re
import time
from config import get_openai_client, OPENAI_MODEL, get_client_and_model

TEMPERATURE = 0.7

# Preset benchmark questions from study material
BENCHMARK_DATA = [
    {
        "id": "pens",
        "question": "A shop sells pens at 23 rupees each. Ravi buys 7 pens, returns 2 of them, then buys 4 more. He pays the final bill with a 500 rupee note. How much change does he get? (Answer with the number only)",
        "answer": ["293"],
    },
    {
        "id": "discount",
        "question": "A jacket is priced at 4000 rupees. A 25% discount is applied, then a further 10% off the reduced price, and finally 18% GST is added to that result. What is the final price? (Answer with the number only)",
        "answer": ["3186"],
    },
    {
        "id": "factory",
        "question": "A factory produces 2000 units in a day. 8% fail quality control. Of the units that pass, 15% are exported and the rest are sold domestically. How many units are sold domestically? (Answer with the number only)",
        "answer": ["1564"],
    },
    {
        "id": "train",
        "question": "A train departs at 14:35. The journey takes 3 hours 50 minutes, then it waits 25 minutes at a junction, then continues for a further 1 hour 40 minutes. What time does it arrive? (Answer in 24-hour HH:MM format)",
        "answer": ["20:30", "8:30 pm", "8:30pm"],
    },
    {
        "id": "printers",
        "question": "Three printers together print 90 pages in 6 minutes. At the same rate per printer, how many pages would 5 printers print in 10 minutes? (Answer with the number only)",
        "answer": ["250"],
    },
]

FEW_SHOT_EXAMPLES = """
Example 1:
Question: If I have 3 apples and I give 2 to my friend, but then my friend gives me 1 back, how many apples do I have?
Thought:
1. Start with 3 apples.
2. Give 2 away: 3 - 2 = 1 apple remaining.
3. Friend gives 1 back: 1 + 1 = 2 apples.
Answer: 2

Example 2:
Question: How many legs does a spider have?
Thought:
1. Spiders are arachnids.
2. Arachnids typically have 8 legs.
Answer: 8

Example 3:
Question: What is 15 * 4?
Thought:
1. 15 * 2 is 30.
2. 30 * 2 is 60.
Answer: 60
"""


def get_model_response(prompt: str, client=None, model_name: str = None):
    """Sends a prompt to the model and returns response text and token counts."""
    if client is None or model_name is None:
        client, model_name, _ = get_client_and_model()
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=TEMPERATURE,
        )
        usage = response.usage
        return (
            response.choices[0].message.content or "",
            usage.prompt_tokens if usage else 0,
            usage.completion_tokens if usage else 0,
        )
    except Exception as e:
        return f"Error: {e}", 0, 0


def extract_final_answer(response_text: str) -> str:
    """Isolates the model's stated final answer from a full response."""
    text = response_text.strip()
    matches = list(re.finditer(r"answer\s*:", text, flags=re.IGNORECASE))
    if matches:
        segment = text[matches[-1].end() :]
    else:
        lines = [ln for ln in text.splitlines() if ln.strip()]
        segment = lines[-1] if lines else ""

    segment = segment.strip().splitlines()[0] if segment.strip() else ""
    return segment.replace("*", "").replace("`", "").strip().lower()


def first_clause(segment: str) -> str:
    """Trims a stated answer down to the asserted value, dropping justification."""
    cut_points = [segment.find(sep) for sep in (",", ";", ". ")]
    for word in (" since ", " because ", " which ", " as ", " so ", " therefore "):
        cut_points.append(segment.find(word))
    valid = [p for p in cut_points if p > 0]
    return segment[: min(valid)].strip() if valid else segment.strip()


def evaluate_accuracy(response_text: str, correct_answer) -> bool:
    """Checks whether the model's final answer matches an expected answer."""
    if response_text.startswith("Error:"):
        return False

    accepted = (
        [correct_answer] if isinstance(correct_answer, str) else list(correct_answer)
    )
    answer_segment = extract_final_answer(response_text)
    if not answer_segment:
        return False

    clause = first_clause(answer_segment)
    cleaned_clause = clause.replace("$", "").replace(",", "")

    for candidate in accepted:
        cleaned_answer = candidate.strip().lower().replace("$", "").replace(",", "")
        if cleaned_clause.rstrip(".") == cleaned_answer:
            return True

        if re.fullmatch(r"\d+(\.\d+)?", cleaned_answer):
            numbers = re.findall(r"\d+(?:\.\d+)?", cleaned_clause)
            if numbers and float(numbers[0]) == float(cleaned_answer):
                return True
            continue

        if re.search(rf"(?<!\w){re.escape(cleaned_answer)}(?!\w)", cleaned_clause):
            return True

    return False


def run_benchmark_for_question(question_input: str, model_choice: str = None) -> dict:
    """Runs Direct, Zero-Shot CoT, and Few-Shot CoT for a given question or preset."""
    client, model_name, provider = get_client_and_model(model_choice)
    matched_preset = None
    cleaned_input = question_input.strip()

    # Check if input matches an ID or matches one of the preset questions
    for preset in BENCHMARK_DATA:
        if cleaned_input.lower() == preset["id"] or cleaned_input == preset["question"]:
            matched_preset = preset
            break

    if matched_preset:
        question = matched_preset["question"]
        expected_answer = matched_preset["answer"]
    else:
        question = cleaned_input
        expected_answer = None

    strategies = [
        (
            "Direct",
            f"Answer the following question directly with just the final answer: {question}",
        ),
        (
            "Zero-Shot CoT",
            f"Answer the following question. Think step-by-step and then provide the final answer as 'Answer: <value>': {question}",
        ),
        (
            "Few-Shot CoT",
            f"Answer the following question. Think step-by-step and then provide the final answer as 'Answer: <value>'.\n\n{FEW_SHOT_EXAMPLES}\n\nQuestion: {question}",
        ),
    ]

    results = []
    baseline_tokens = None

    for name, prompt in strategies:
        start_time = time.time()
        resp_text, p_tok, c_tok = get_model_response(
            prompt, client=client, model_name=model_name
        )
        elapsed = time.time() - start_time
        total_tokens = p_tok + c_tok
        extracted = extract_final_answer(resp_text)

        is_correct = None
        if expected_answer:
            is_correct = evaluate_accuracy(resp_text, expected_answer)

        if name == "Direct":
            baseline_tokens = max(total_tokens, 1)

        token_mult = (
            round(total_tokens / baseline_tokens, 1) if baseline_tokens else 1.0
        )

        results.append(
            {
                "name": name,
                "response": resp_text,
                "extracted_answer": extracted,
                "prompt_tokens": p_tok,
                "completion_tokens": c_tok,
                "total_tokens": total_tokens,
                "token_multiplier": token_mult,
                "latency_seconds": round(elapsed, 2),
                "is_correct": is_correct,
            }
        )

    expected_label = (
        (
            expected_answer[0]
            if isinstance(expected_answer, list)
            else expected_answer
        )
        if expected_answer
        else "N/A"
    )

    return {
        "question": question,
        "expected_answer": expected_label,
        "model_used": f"{provider} ({model_name})",
        "strategies": results,
    }


if __name__ == "__main__":
    import json

    q = BENCHMARK_DATA[0]["question"]
    print("Testing prompt benchmark with question:", q)
    output = run_benchmark_for_question(q)
    print(json.dumps(output, indent=2))

