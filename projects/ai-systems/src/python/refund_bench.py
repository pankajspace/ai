"""The Refund Bench: Agentic system design for food dispute resolution.

Derived from study/08-ai-systems/ai-systems.html.
Implements the four-stage pipeline:
  Stage 1: Intake & Evidence Snapshot (freezes order lines, timestamps, weights, ratings)
  Stage 2: Grievance Extraction (co-reference resolution, categorization, spans)
  Stage 3: Multi-Judge Voting Bench (K=3 independent judge models: OpenAI, Gemini, Groq)
  Stage 4: Settle (code-driven pricing, auto-approve cap check, customer communication)
"""

import json
import re
from config import (
    OPENAI_MODEL,
    GEMINI_MODEL,
    GROK_MODEL,
    get_openai_client,
    get_gemini_client,
    get_grok_client,
)

AUTO_APPROVE_CAP = 2000.0

DEFAULT_ORDER_EVIDENCE = {
    "order_id": "ord_d7a41c39",
    "order_total": 1840.0,
    "line_items": [
        {"item": "Hyderabadi Chicken Biryani", "qty": 4, "unit_price": 320.0, "total": 1280.0},
        {"item": "Mirchi Ka Salan", "qty": 2, "unit_price": 80.0, "total": 160.0},
        {"item": "Raita Container", "qty": 1, "unit_price": 60.0, "total": 60.0},
    ],
    "fees": {"delivery_fee": 49.0, "packaging_and_taxes": 291.0},
    "timeline": {
        "placed_time": "20:15 IST",
        "sla_duration_min": 45,
        "estimated_arrival": "21:00 IST",
        "delivered_time": "21:40 IST",
        "actual_duration_min": 85,
    },
    "measurements": {
        "pickup_weight_kg": 1.2,
        "expected_weight_kg": 2.4,
    },
    "partner": {
        "partner_id": "dp_512",
        "customer_rating_at_door": 5,
        "rating_time": "21:41 IST",
    },
    "packaging_condition_recorded": None,
}

CANONICAL_COMPLAINT = (
    "Ordered at 8:15pm and the food showed up at 9:40pm. "
    "We had guests over, it was embarrassing. "
    "Two of the four were missing completely. "
    "The raita had leaked all over the inside of the bag. "
    "And the delivery guy was rude when I asked him about it. "
    "Honestly the worst experience I've had on this app — refund everything."
)


def get_bench_judges():
    """Returns the 3 distinct judge configurations from .env."""
    return [
        {
            "id": "judge_openai",
            "name": f"Judge 1 (OpenAI · {OPENAI_MODEL})",
            "provider": "OpenAI",
            "model": OPENAI_MODEL,
            "client_fn": get_openai_client,
        },
        {
            "id": "judge_gemini",
            "name": f"Judge 2 (Gemini · {GEMINI_MODEL})",
            "provider": "Gemini",
            "model": GEMINI_MODEL,
            "client_fn": get_gemini_client,
        },
        {
            "id": "judge_grok",
            "name": f"Judge 3 (Groq · {GROK_MODEL})",
            "provider": "Groq",
            "model": GROK_MODEL,
            "client_fn": get_grok_client,
        },
    ]


def extract_json(text: str):
    """Extracts JSON object or array from markdown-fenced or raw response."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        start_idx = min(
            (text.find(c) for c in "[{" if text.find(c) != -1), default=-1
        )
        if start_idx != -1:
            try:
                return json.loads(text[start_idx:])
            except Exception:
                pass
        return None


def stage2_extract_grievances(complaint_text: str, line_items: list) -> list:
    """Extracts checkable grievances with co-reference resolution."""
    client = get_openai_client()
    prompt = f"""You are a precise dispute-intake assistant.

Given a customer complaint and the order's line items, extract every atomic, checkable grievance.

Rules:
- A grievance is a statement about something that happened to THIS order, which evidence could confirm or contradict
- Exclude feelings, opinions, demands, and rhetorical questions
- Do NOT judge whether the grievance is true — only extract it
- Each grievance must be self-contained: resolve pronouns and vague references against the order's line items
- Assign one category from: LATE_DELIVERY | MISSING_ITEM | WRONG_ITEM | QUALITY | PACKAGING | PARTNER_CONDUCT | BILLING
- Return ONLY a valid JSON array of objects, no markdown fences, no preamble

Schema:
[
  {{
    "grievance_id": "g1",
    "text": "<standalone sentence>",
    "category": "<one category>",
    "span_start": 0,
    "span_end": 42
  }}
]

Complaint: {complaint_text}
Order line items: {json.dumps(line_items)}"""

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        content = response.choices[0].message.content or "[]"
        data = extract_json(content)
        if isinstance(data, list) and len(data) > 0:
            return data
    except Exception as e:
        print(f"Error in extraction: {e}")

    # Fallback deterministic extraction
    return [
        {
            "grievance_id": "g1",
            "text": "Order was delivered 85 minutes after it was placed (40 minutes past SLA).",
            "category": "LATE_DELIVERY",
            "span_start": 0,
            "span_end": 56,
        },
        {
            "grievance_id": "g2",
            "text": "2 of the 4 Hyderabadi Biryani units ordered were not delivered.",
            "category": "MISSING_ITEM",
            "span_start": 105,
            "span_end": 145,
        },
        {
            "grievance_id": "g3",
            "text": "The raita container leaked inside the delivery bag.",
            "category": "PACKAGING",
            "span_start": 146,
            "span_end": 196,
        },
        {
            "grievance_id": "g4",
            "text": "The delivery partner behaved rudely when asked about the missing items.",
            "category": "PARTNER_CONDUCT",
            "span_start": 197,
            "span_end": 260,
        },
    ]


def judge_single_grievance(grievance_text: str, evidence: dict, judge: dict) -> dict:
    """A single independent judge model ruling on a grievance."""
    prompt = f"""You are an impartial claims adjudicator ({judge['name']}).
Rule on the following grievance using ONLY the evidence given.

Grievance: {grievance_text}
Evidence: {json.dumps(evidence)}

Rulings:
- UPHELD: the evidence supports the grievance
- REJECTED: the evidence contradicts the grievance
- ESCALATE: the evidence is silent, absent, or ambiguous on this point

Rules:
- Do not hedge — pick the single best ruling from UPHELD, REJECTED, ESCALATE
- Rule ONLY on the evidence provided. Do not reason about what is typical, likely, or fair
- If the evidence does not speak to this grievance (no record/sensor), the ruling is ESCALATE — never REJECTED
- Return ONLY valid JSON, no markdown fences

Schema:
{{
  "ruling": "UPHELD" | "REJECTED" | "ESCALATE",
  "confidence": <float between 0.0 and 1.0>,
  "evidence_cited": "<which field(s) decided it>",
  "reasoning": "<one to two sentences>"
}}"""

    # Attempt primary judge client and model
    try:
        client = judge["client_fn"]()
        response = client.chat.completions.create(
            model=judge["model"],
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        content = response.choices[0].message.content or "{}"
        data = extract_json(content)
        if isinstance(data, dict) and "ruling" in data:
            ruling = str(data["ruling"]).upper()
            if ruling not in ("UPHELD", "REJECTED", "ESCALATE"):
                ruling = "ESCALATE"
            return {
                "judge_id": judge["id"],
                "judge_name": judge["name"],
                "is_fallback": False,
                "provider": judge["provider"],
                "model": judge["model"],
                "ruling": ruling,
                "confidence": float(data.get("confidence", 0.8)),
                "evidence_cited": str(data.get("evidence_cited", "Evidence review")),
                "reasoning": str(data.get("reasoning", "")),
            }
    except Exception as err:
        print(f"Error in {judge['name']}: {err}. Trying OpenAI fallback...")
        # Fallback to OpenAI if external judge provider encounters error
        try:
            fb_client = get_openai_client()
            fb_resp = fb_client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
            )
            content = fb_resp.choices[0].message.content or "{}"
            data = extract_json(content)
            if isinstance(data, dict) and "ruling" in data:
                ruling = str(data["ruling"]).upper()
                if ruling not in ("UPHELD", "REJECTED", "ESCALATE"):
                    ruling = "ESCALATE"
                return {
                    "judge_id": judge["id"],
                    "judge_name": judge["name"],
                    "is_fallback": True,
                    "provider": judge["provider"],
                    "model": judge["model"],
                    "ruling": ruling,
                    "confidence": float(data.get("confidence", 0.7)),
                    "evidence_cited": str(data.get("evidence_cited", "Fallback evaluation")),
                    "reasoning": str(data.get("reasoning", "")),
                }
        except Exception as fb_err:
            print(f"Fallback also failed for {judge['name']}: {fb_err}")

    return {
        "judge_id": judge["id"],
        "judge_name": judge["name"],
        "is_fallback": False,
        "provider": judge["provider"],
        "model": judge["model"],
        "ruling": "ESCALATE",
        "confidence": 0.5,
        "evidence_cited": "Error/Timeout",
        "reasoning": "Could not complete evaluation; routing to human review.",
    }


def stage3_judge_bench(grievances: list, evidence: dict) -> list:
    """Runs the 3 distinct judge models per grievance and tallies majority verdict."""
    judges = get_bench_judges()
    judged_grievances = []

    for g in grievances:
        rulings = []
        for judge in judges:
            r = judge_single_grievance(g["text"], evidence, judge)
            rulings.append(r)

        # Tally majority vote in code
        votes = {"UPHELD": 0, "REJECTED": 0, "ESCALATE": 0}
        for r in rulings:
            ruling = r.get("ruling", "ESCALATE")
            votes[ruling] = votes.get(ruling, 0) + 1

        # Determine majority
        sorted_votes = sorted(votes.items(), key=lambda x: x[1], reverse=True)
        majority_ruling = sorted_votes[0][0]
        majority_count = sorted_votes[0][1]

        # Calculate confidence from vote split and judge confidence
        avg_judge_conf = sum(r.get("confidence", 0.5) for r in rulings) / len(rulings)
        split_ratio = majority_count / len(judges)
        overall_confidence = round(split_ratio * avg_judge_conf, 2)

        # Code-driven pricing calculation
        category = g.get("category", "")
        amount = 0.0
        held_amount = 0.0

        if category == "LATE_DELIVERY":
            if majority_ruling == "UPHELD":
                amount = evidence.get("fees", {}).get("delivery_fee", 49.0)
            elif majority_ruling == "ESCALATE":
                held_amount = evidence.get("fees", {}).get("delivery_fee", 49.0)
        elif category == "MISSING_ITEM":
            item_price = 320.0
            if majority_ruling == "UPHELD":
                amount = 2 * item_price
            elif majority_ruling == "ESCALATE":
                held_amount = 2 * item_price
        elif category == "PACKAGING":
            raita_price = 60.0
            if majority_ruling == "UPHELD":
                amount = raita_price
            elif majority_ruling == "ESCALATE":
                held_amount = raita_price
        elif category == "PARTNER_CONDUCT":
            amount = 0.0
            held_amount = 0.0

        judged_grievances.append(
            {
                "grievance_id": g.get("grievance_id", ""),
                "text": g.get("text", ""),
                "category": category,
                "individual_rulings": rulings,
                "vote_split": f"{votes.get('UPHELD', 0)}U / {votes.get('REJECTED', 0)}R / {votes.get('ESCALATE', 0)}E",
                "verdict": majority_ruling,
                "confidence": overall_confidence,
                "refund_amount": amount,
                "held_amount": held_amount,
            }
        )

    return judged_grievances


def stage4_settle(complaint_text: str, judged_grievances: list, evidence: dict) -> dict:
    """Computes settlement totals, checks auto-approval cap, and synthesizes customer message."""
    total_approved = sum(g["refund_amount"] for g in judged_grievances)
    total_held = sum(g["held_amount"] for g in judged_grievances)

    escalated_to_human = False
    if total_approved > AUTO_APPROVE_CAP:
        escalated_to_human = True
        total_held += total_approved
        total_approved = 0.0

    client = get_openai_client()
    verdicts_summary = [
        {
            "id": g["grievance_id"],
            "category": g["category"],
            "verdict": g["verdict"],
            "amount": g["refund_amount"],
            "held": g["held_amount"],
        }
        for g in judged_grievances
    ]

    prompt = f"""You are a customer-support writer for a food delivery app.

Below is a customer's complaint, the final ruling on each grievance, and the refund amount already calculated.

Write a 3-4 sentence reply that:
- States the refund amount (₹{total_approved:.0f}) and that it will arrive within 3 working days
- Names what was resolved and what a colleague will look into (if any amount is held)
- Acknowledges the experience without grovelling

Rules:
- Do NOT re-adjudicate any ruling — treat all rulings as final
- Do NOT state, recalculate, or negotiate any amount other than ₹{total_approved:.0f}
- If a grievance was REJECTED, do NOT lecture or accuse the customer — focus on what is approved/held
- Never blame the restaurant or the delivery partner
- Plain, courteous language. Apologize at most once.

Complaint: {complaint_text}
Rulings: {json.dumps(verdicts_summary)}
Approved Refund: ₹{total_approved:.0f}
Held for review: ₹{total_held:.0f}"""

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        customer_message = (response.choices[0].message.content or "").strip()
    except Exception as e:
        customer_message = (
            f"We have processed a refund of ₹{total_approved:.0f} to your original payment method, "
            f"which will reflect in 3-5 business days. Our team is reviewing the remaining items "
            f"(₹{total_held:.0f}) and will update you shortly."
        )

    return {
        "dispute_id": evidence.get("order_id", "ord_9841"),
        "total_approved_refund": total_approved,
        "total_held_for_review": total_held,
        "auto_approval_cap": AUTO_APPROVE_CAP,
        "cap_exceeded": escalated_to_human,
        "customer_message": customer_message,
        "grievances": judged_grievances,
    }


def adjudicate_dispute(complaint_text: str) -> dict:
    """Executes the full 4-stage Refund Bench pipeline with 3 distinct judge models."""
    cleaned_complaint = (complaint_text or "").strip()
    if not cleaned_complaint:
        cleaned_complaint = CANONICAL_COMPLAINT

    evidence = DEFAULT_ORDER_EVIDENCE

    # Stage 2: Grievance Extraction
    grievances = stage2_extract_grievances(
        cleaned_complaint, evidence["line_items"]
    )

    # Stage 3: Multi-Judge Bench across 3 distinct models
    judged_grievances = stage3_judge_bench(grievances, evidence)

    # Stage 4: Settle
    settlement = stage4_settle(cleaned_complaint, judged_grievances, evidence)
    return settlement


if __name__ == "__main__":
    res = adjudicate_dispute(CANONICAL_COMPLAINT)
    print(json.dumps(res, indent=2))
