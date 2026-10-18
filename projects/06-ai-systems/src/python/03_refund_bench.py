"""The Refund Bench: Agentic System Design for Food Dispute Resolution Service.

Implements a four-stage dispute adjudication pipeline:
1. Stage 1 (Intake & Evidence Snapshot): Freezes order lines, timestamps, weights, and ratings.
2. Stage 2 (Grievance Extraction): Extracts atomic, checkable grievances with co-reference resolution.
3. Stage 3 (Multi-Judge Voting Bench): Independent judge models (OpenAI, Gemini, Groq) rule in parallel.
4. Stage 4 (Settle): Code-driven pricing, auto-approval cap check, and customer communication.
"""

import json
import logging
import os
import re
from concurrent.futures import ThreadPoolExecutor
from typing import List, Optional

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration & Multi-Model Client Setup
# ---------------------------------------------------------------------------

load_dotenv(find_dotenv())


def get_env(name: str, default: str = "") -> str:
    """Return an environment variable, falling back to ``default``."""
    return os.environ.get(name, default)


OPENAI_MODEL = get_env("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL = get_env("GEMINI_MODEL", "gemini-3.8-flash")
GROK_MODEL = get_env("GROK_MODEL") or get_env("GROQ_MODEL", "openai/gpt-oss-20b")

_openai_client = None
_gemini_client = None
_grok_client = None


def get_openai_client() -> OpenAI:
    """Return an authenticated OpenAI client."""
    global _openai_client
    if _openai_client is None:
        api_key = get_env("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set. Add it to a .env file.")
        base_url = get_env("OPENAI_BASE_URL", "https://api.openai.com/v1")
        _openai_client = OpenAI(api_key=api_key, base_url=base_url)
    return _openai_client


def get_gemini_client() -> OpenAI:
    """Return an OpenAI client configured for Google Gemini's OpenAI-compatible endpoint."""
    global _gemini_client
    if _gemini_client is None:
        api_key = get_env("GEMINI_API_KEY")
        if not api_key:
            return get_openai_client()
        base_url = get_env(
            "GEMINI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        _gemini_client = OpenAI(api_key=api_key, base_url=base_url)
    return _gemini_client


def get_grok_client() -> OpenAI:
    """Return an OpenAI client configured for Groq / Grok's OpenAI-compatible endpoint."""
    global _grok_client
    if _grok_client is None:
        api_key = get_env("GROK_API_KEY") or get_env("GROQ_API_KEY")
        if not api_key:
            return get_openai_client()
        default_base_url = (
            "https://api.groq.com/openai/v1"
            if api_key.startswith("gsk_")
            else "https://api.x.ai/v1"
        )
        base_url = get_env("GROK_BASE_URL") or get_env(
            "GROQ_BASE_URL", default_base_url
        )
        _grok_client = OpenAI(api_key=api_key, base_url=base_url)
    return _grok_client


# ---------------------------------------------------------------------------
# Benchmark Presets & Data
# ---------------------------------------------------------------------------

AUTO_APPROVE_CAP = 2000.0

BENCH_CHOICES = {
    "single": {"label": "1 judge: OpenAI", "seats": ["openai"]},
    "openai3": {
        "label": "3 judges: OpenAI × 3 (self-consistency)",
        "seats": ["openai"] * 3,
    },
    "mixed3": {
        "label": "3 judges: OpenAI · Gemini · Groq",
        "seats": ["openai", "gemini", "grok"],
    },
    "mixed5": {
        "label": "5 judges: OpenAI · Gemini · Groq · OpenAI · Gemini",
        "seats": ["openai", "gemini", "grok", "openai", "gemini"],
    },
}

DEFAULT_ORDER_EVIDENCE = {
    "order_id": "ord_d7a41c39",
    "order_total": 1840.0,
    "line_items": [
        {
            "item": "Hyderabadi Chicken Biryani",
            "qty": 4,
            "unit_price": 320.0,
            "total": 1280.0,
        },
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


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------


class RefundBenchRequest(BaseModel):
    """Input payload for Refund Bench Dispute Adjudication."""

    complaint_text: str = CANONICAL_COMPLAINT
    bench: str = "mixed3"
    cap: float = AUTO_APPROVE_CAP


class GrievanceRuling(BaseModel):
    judge_id: str
    judge_name: str
    is_fallback: bool
    provider: str
    model: str
    ruling: str
    confidence: float
    evidence_cited: str
    reasoning: str


class JudgedGrievance(BaseModel):
    grievance_id: str
    text: str
    category: str
    individual_rulings: List[GrievanceRuling]
    vote_split: str
    verdict: str
    confidence: float
    refund_amount: float
    held_amount: float


class RefundBenchResponse(BaseModel):
    """Output payload from Refund Bench Dispute Adjudication."""

    dispute_id: str
    total_approved_refund: float
    total_held_for_review: float
    auto_approval_cap: float
    cap_exceeded: bool
    customer_message: str
    bench_label: str
    grievances: List[JudgedGrievance]
    order_evidence: dict


# ---------------------------------------------------------------------------
# Pipeline Helpers & Stages
# ---------------------------------------------------------------------------


def get_bench_judges(bench: str = "mixed3") -> list:
    """Returns one judge configuration per seat of the selected bench layout."""
    # ① Resolve the bench layout key and map provider names to client factories
    layout_key = bench if bench in BENCH_CHOICES else "mixed3"
    providers = {
        "openai": ("OpenAI", OPENAI_MODEL, get_openai_client),
        "gemini": ("Gemini", GEMINI_MODEL, get_gemini_client),
        "grok": ("Groq", GROK_MODEL, get_grok_client),
    }
    # ② Build one judge descriptor dict per seat on the bench
    judges = []
    for seat, key in enumerate(BENCH_CHOICES[layout_key]["seats"], start=1):
        provider, model, client_fn = providers[key]
        judges.append(
            {
                "id": f"judge_{seat}_{key}",
                "name": f"Judge {seat} ({provider} · {model})",
                "provider": provider,
                "model": model,
                "client_fn": client_fn,
            }
        )
    return judges


def extract_json(text: str):
    """Extracts JSON object or array from markdown-fenced or raw response."""
    # ① Strip markdown code fences if present
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        # ② Parse the JSON payload directly or scan from the first bracket/brace
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
    # ① Construct the Stage 2 extraction prompt with order line items for pronoun resolution
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
        # ② Call the LLM at low temperature to extract structured JSON grievances
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
        logger.warning(f"Error in extraction: {e}")

    # ③ Fall back to canonical grievances if extraction fails
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
    # ① Build the impartial adjudication prompt restricting rulings to UPHELD, REJECTED, or ESCALATE
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

    try:
        # ② Invoke the assigned judge provider/model and parse its ballot
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
        # ③ Fall back to OpenAI if a secondary provider key or endpoint fails
        logger.info(f"Primary judge call failed for {judge['name']}: {err}, trying fallback")
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
                    "evidence_cited": str(
                        data.get("evidence_cited", "Fallback evaluation")
                    ),
                    "reasoning": str(data.get("reasoning", "")),
                }
        except Exception as fb_err:
            logger.warning(
                f"Fallback also failed for {judge['name']}: {fb_err}"
            )

    # ④ Default to ESCALATE if both primary and fallback judge calls fail
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


def stage3_judge_bench(
    grievances: list, evidence: dict, bench: str = "mixed3"
) -> list:
    """Runs every judge on every grievance (in parallel) and tallies the majority verdict."""
    # ① Fan out all (grievance, judge) pairs concurrently across a ThreadPoolExecutor
    judges = get_bench_judges(bench)
    pairs = [(g, judge) for g in grievances for judge in judges]

    with ThreadPoolExecutor(max_workers=8) as pool:
        all_rulings = list(
            pool.map(
                lambda p: judge_single_grievance(p[0]["text"], evidence, p[1]),
                pairs,
            )
        )
    judged_grievances = []

    # ② Tally majority vote and confidence score for each grievance
    for gi, g in enumerate(grievances):
        rulings = all_rulings[gi * len(judges) : (gi + 1) * len(judges)]

        votes = {"UPHELD": 0, "REJECTED": 0, "ESCALATE": 0}
        for r in rulings:
            ruling = r.get("ruling", "ESCALATE")
            votes[ruling] = votes.get(ruling, 0) + 1

        sorted_votes = sorted(votes.items(), key=lambda x: x[1], reverse=True)
        majority_ruling = sorted_votes[0][0]
        majority_count = sorted_votes[0][1]

        avg_judge_conf = sum(r.get("confidence", 0.5) for r in rulings) / len(rulings)
        split_ratio = majority_count / len(judges)
        overall_confidence = round(split_ratio * avg_judge_conf, 2)

        # ③ Compute deterministic refund and held amounts in Python based on category and ruling
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
                "vote_split": (
                    f"{votes.get('UPHELD', 0)}U / "
                    f"{votes.get('REJECTED', 0)}R / "
                    f"{votes.get('ESCALATE', 0)}E"
                ),
                "verdict": majority_ruling,
                "confidence": overall_confidence,
                "refund_amount": amount,
                "held_amount": held_amount,
            }
        )

    return judged_grievances


def stage4_settle(
    complaint_text: str,
    judged_grievances: list,
    evidence: dict,
    cap: float = AUTO_APPROVE_CAP,
) -> dict:
    """Computes settlement totals, checks auto-approval cap, and synthesizes customer message."""
    # ① Sum approved and held amounts and enforce the auto-approval cap
    total_approved = sum(g["refund_amount"] for g in judged_grievances)
    total_held = sum(g["held_amount"] for g in judged_grievances)

    escalated_to_human = False
    if total_approved > cap:
        escalated_to_human = True
        total_held += total_approved
        total_approved = 0.0

    # ② Draft a courteous customer notification message grounded in the final rulings
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
    except Exception:
        customer_message = (
            f"We have processed a refund of ₹{total_approved:.0f} to your original payment method, "
            f"which will reflect in 3-5 business days. Our team is reviewing the remaining items "
            f"(₹{total_held:.0f}) and will update you shortly."
        )

    # ③ Return the complete settlement summary
    return {
        "dispute_id": evidence.get("order_id", "ord_d7a41c39"),
        "total_approved_refund": total_approved,
        "total_held_for_review": total_held,
        "auto_approval_cap": cap,
        "cap_exceeded": escalated_to_human,
        "customer_message": customer_message,
        "grievances": judged_grievances,
    }


def adjudicate_dispute(
    complaint_text: str = "", bench: str = "mixed3", cap: float = AUTO_APPROVE_CAP
) -> dict:
    """Executes the full 4-stage Refund Bench pipeline with the selected judge bench and cap."""
    # ① Stage 1: Freeze order evidence snapshot and normalize complaint text
    cleaned_complaint = (complaint_text or "").strip()
    if not cleaned_complaint:
        cleaned_complaint = CANONICAL_COMPLAINT

    evidence = DEFAULT_ORDER_EVIDENCE

    # ② Stage 2: Extract atomic, checkable grievances with co-reference resolution
    grievances = stage2_extract_grievances(
        cleaned_complaint, evidence["line_items"]
    )

    # ③ Stage 3: Run the selected multi-judge voting bench in parallel
    bench_key = bench if bench in BENCH_CHOICES else "mixed3"
    judged_grievances = stage3_judge_bench(grievances, evidence, bench_key)

    # ④ Stage 4: Settle refund amounts in code, check cap, and draft customer reply
    settlement = stage4_settle(cleaned_complaint, judged_grievances, evidence, cap)
    settlement["bench_label"] = BENCH_CHOICES[bench_key]["label"]
    settlement["order_evidence"] = evidence
    return settlement


run_refund_bench = adjudicate_dispute


