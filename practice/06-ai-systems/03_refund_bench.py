"""The Refund Bench: Agentic System Design for Food Dispute Resolution.

Implements a four-stage dispute adjudication pipeline:
1. Stage 1 (Intake & Evidence Snapshot): Freezes order lines, timestamps, weights, and ratings.
2. Stage 2 (Grievance Extraction): Extracts atomic, checkable grievances with co-reference resolution.
3. Stage 3 (Multi-Judge Voting Bench): Independent judge models (OpenAI, Gemini, Groq) rule in parallel.
4. Stage 4 (Settle): Code-driven pricing, auto-approval cap check, and customer communication.

Run locally (from this folder):
    pip install -r requirements.txt
    python 03_refund_bench.py

Run with Docker Compose (from this folder):
    docker compose run --rm 03_refund_bench
"""

import json
import os
import re
from concurrent.futures import ThreadPoolExecutor

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from rich.console import Console
from rich.panel import Panel
from rich.rule import Rule
from rich.table import Table

# ---------------------------------------------------------------------------
# Configuration & Multi-Model Client Setup
# ---------------------------------------------------------------------------

# 1. Load API keys and settings from .env
load_dotenv(find_dotenv())

console = Console()


def get_env(name: str, default: str = "") -> str:
    """Return an environment variable, falling back to ``default``."""
    return os.environ.get(name, default)


OPENAI_MODEL = get_env("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL = get_env("GEMINI_MODEL", "gemini-3.6-flash")
GROK_MODEL = get_env("GROK_MODEL") or get_env("GROQ_MODEL", "openai/gpt-oss-20b")

_openai_client = None
_gemini_client = None
_grok_client = None


def get_openai_client() -> OpenAI:
    """Return an authenticated OpenAI client."""
    global _openai_client
    # ① create the client once, then reuse it on later calls
    if _openai_client is None:
        # ② read and require the OpenAI API key before constructing the client
        api_key = get_env("OPENAI_API_KEY")
        if not api_key:
            console.print(
                "[bold red]Error:[/bold red] OPENAI_API_KEY is not set. Add it to a .env file."
            )
            raise SystemExit(1)
        base_url = get_env("OPENAI_BASE_URL", "https://api.openai.com/v1")
        # ③ build the authenticated OpenAI client
        _openai_client = OpenAI(api_key=api_key, base_url=base_url)
    return _openai_client


def get_gemini_client() -> OpenAI:
    """Return an OpenAI client configured for Google Gemini's OpenAI-compatible endpoint."""
    global _gemini_client
    # ① create the Gemini-compatible client once, then reuse it
    if _gemini_client is None:
        api_key = get_env("GEMINI_API_KEY")
        if not api_key:
            # ② fall back to OpenAI when a Gemini key is not configured
            return get_openai_client()
        # ③ choose the configured Gemini base URL or the default endpoint
        base_url = get_env(
            "GEMINI_BASE_URL",
            "https://generativelanguage.googleapis.com/v1beta/openai/",
        )
        # ④ build an OpenAI-compatible client pointed at Gemini
        _gemini_client = OpenAI(api_key=api_key, base_url=base_url)
    return _gemini_client


def get_grok_client() -> OpenAI:
    """Return an OpenAI client configured for Groq / Grok's OpenAI-compatible endpoint."""
    global _grok_client
    # ① create the Groq/Grok-compatible client once, then reuse it
    if _grok_client is None:
        # ② accept either Grok or Groq environment variable names for the key
        api_key = get_env("GROK_API_KEY") or get_env("GROQ_API_KEY")
        if not api_key:
            # ③ fall back to OpenAI when a Groq/Grok key is not configured
            return get_openai_client()
        # ④ infer the default base URL from the key style
        default_base_url = (
            "https://api.groq.com/openai/v1"
            if api_key.startswith("gsk_")
            else "https://api.x.ai/v1"
        )
        # ⑤ choose an explicit base URL if the environment provides one
        base_url = get_env("GROK_BASE_URL") or get_env(
            "GROQ_BASE_URL", default_base_url
        )
        # ⑥ build an OpenAI-compatible client pointed at Groq or Grok
        _grok_client = OpenAI(api_key=api_key, base_url=base_url)
    return _grok_client


# ---------------------------------------------------------------------------
# Benchmark Dataset & Input Options
# ---------------------------------------------------------------------------

AUTO_APPROVE_CAP = 2000.0

# Cap values selectable from the configuration
CAP_CHOICES = {"500": 500.0, "2000": 2000.0, "5000": 5000.0}

# Judge bench layouts: which provider sits in each seat.
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

# 2. Inputs - judge bench layout, auto-approve cap, and customer complaint
#    Uncomment another configuration below to test different scenarios:

# Bench layout choice ("single", "openai3", "mixed3", "mixed5")
SELECTED_BENCH = "mixed3"
# SELECTED_BENCH = "single"   # Single OpenAI judge (no cross-provider voting)
# SELECTED_BENCH = "openai3"  # 3x OpenAI self-consistency bench
# SELECTED_BENCH = "mixed5"   # 5-seat mixed provider bench

# Auto-approval cap in INR (500.0 triggers cap-exceeded human escalation on canonical complaint)
SELECTED_CAP = AUTO_APPROVE_CAP
# SELECTED_CAP = 500.0  # Strict ₹500 cap -> triggers cap-exceeded escalation to human review
# SELECTED_CAP = 5000.0 # High ₹5000 cap

# Option 1: Canonical multi-grievance complaint (default - late delivery, missing items, leaked raita, rude partner)
COMPLAINT_INPUT = CANONICAL_COMPLAINT

# Option 2: Late delivery and missing items only (all verifiable by sensor/timestamp evidence)
# COMPLAINT_INPUT = (
#     "My order arrived 40 minutes past the promised time, and two of the four "
#     "Chicken Biryanis were missing from the bag."
# )

# Option 3: Unverifiable packaging & conduct claims only (tests ESCALATE vs REJECTED rulings)
# COMPLAINT_INPUT = (
#     "The raita container was crushed and leaked everywhere inside the sealed bag, "
#     "and the delivery partner was rude at the door."
# )


# ---------------------------------------------------------------------------
# Pipeline Stage Functions
# ---------------------------------------------------------------------------


def get_bench_judges(bench: str = "mixed3"):
    """Returns one judge configuration per seat of the selected bench layout."""
    # ① map provider keys to their display name, model, and client factory
    providers = {
        "openai": ("OpenAI", OPENAI_MODEL, get_openai_client),
        "gemini": ("Gemini", GEMINI_MODEL, get_gemini_client),
        "grok": ("Groq", GROK_MODEL, get_grok_client),
    }
    judges = []
    # ② expand the selected bench seats into concrete judge configurations
    for seat, key in enumerate(BENCH_CHOICES[bench]["seats"], start=1):
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
    # ① remove a markdown JSON fence if the model wrapped its answer
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        # ② parse clean JSON first because that is the expected output
        return json.loads(text)
    except Exception:
        # ③ fall back to parsing from the first JSON-looking bracket
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
    # ① open the extraction model client for the grievance-intake step
    client = get_openai_client()
    # ② build a strict JSON prompt from the complaint and frozen order lines
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

    # ③ ask the model to extract grievances and parse its JSON response
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        content = response.choices[0].message.content or "[]"
        data = extract_json(content)
        if isinstance(data, list) and len(data) > 0:
            # ④ return the model extraction only when it is a non-empty list
            return data
    except Exception as e:
        console.print(f"[yellow]Error in extraction: {e}[/yellow]")

    # ⑤ fall back to deterministic grievances so the pipeline can still run
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
    # ① build an evidence-bound adjudication prompt for one grievance
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

    # ② ask the assigned judge model for one ruling
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
            # ③ validate the model ruling into one of the allowed labels
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
        # ④ fall back to OpenAI if the external judge provider fails
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
            console.print(
                f"[yellow]Fallback also failed for {judge['name']}: {fb_err}[/yellow]"
            )

    # ⑤ route unresolved errors to human review instead of guessing
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
    # ① expand the selected bench into independent judge seats
    judges = get_bench_judges(bench)
    # ② create every grievance/judge pair so each judge sees each claim
    pairs = [(g, judge) for g in grievances for judge in judges]
    # ③ run independent rulings concurrently within the proxy timeout
    with ThreadPoolExecutor(max_workers=8) as pool:
        all_rulings = list(
            pool.map(
                lambda p: judge_single_grievance(p[0]["text"], evidence, p[1]),
                pairs,
            )
        )
    judged_grievances = []

    for gi, g in enumerate(grievances):
        # ④ group the flat ruling list back into the current grievance
        rulings = all_rulings[gi * len(judges) : (gi + 1) * len(judges)]

        # ⑤ tally votes in code and choose the majority verdict
        votes = {"UPHELD": 0, "REJECTED": 0, "ESCALATE": 0}
        for r in rulings:
            ruling = r.get("ruling", "ESCALATE")
            votes[ruling] = votes.get(ruling, 0) + 1

        sorted_votes = sorted(votes.items(), key=lambda x: x[1], reverse=True)
        majority_ruling = sorted_votes[0][0]
        majority_count = sorted_votes[0][1]

        # ⑥ calculate overall confidence from vote split and judge confidence
        avg_judge_conf = sum(r.get("confidence", 0.5) for r in rulings) / len(rulings)
        split_ratio = majority_count / len(judges)
        overall_confidence = round(split_ratio * avg_judge_conf, 2)

        # ⑦ convert the verdict and grievance category into refund amounts
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

        # ⑧ append the structured result for this grievance
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
    # ① total approved and held amounts across all judged grievances
    total_approved = sum(g["refund_amount"] for g in judged_grievances)
    total_held = sum(g["held_amount"] for g in judged_grievances)

    # ② enforce the auto-approval cap before drafting the customer reply
    escalated_to_human = False
    if total_approved > cap:
        escalated_to_human = True
        total_held += total_approved
        total_approved = 0.0

    client = get_openai_client()
    # ③ summarise final rulings so the writer model cannot re-adjudicate
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

    # ④ ask the model to write the customer-facing settlement message
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

    # ⑤ return the settlement payload
    return {
        "dispute_id": evidence.get("order_id", "ord_9841"),
        "total_approved_refund": total_approved,
        "total_held_for_review": total_held,
        "auto_approval_cap": cap,
        "cap_exceeded": escalated_to_human,
        "customer_message": customer_message,
        "grievances": judged_grievances,
    }


def adjudicate_dispute(
    complaint_text: str, bench: str = "mixed3", cap: float = AUTO_APPROVE_CAP
) -> dict:
    """Executes the full 4-stage Refund Bench pipeline with the selected judge bench and cap."""
    # ① normalise the complaint, using the canonical scenario when input is empty
    cleaned_complaint = (complaint_text or "").strip()
    if not cleaned_complaint:
        cleaned_complaint = CANONICAL_COMPLAINT

    # ② freeze the evidence snapshot that every downstream stage must use
    evidence = DEFAULT_ORDER_EVIDENCE

    # ③ extract atomic grievances from the complaint text
    grievances = stage2_extract_grievances(
        cleaned_complaint, evidence["line_items"]
    )

    # ④ run the selected multi-judge bench over every grievance
    judged_grievances = stage3_judge_bench(grievances, evidence, bench)

    # ⑤ settle approved and held amounts, then attach the bench label
    settlement = stage4_settle(cleaned_complaint, judged_grievances, evidence, cap)
    settlement["bench_label"] = BENCH_CHOICES[bench]["label"]
    return settlement


# ---------------------------------------------------------------------------
# Terminal Rendering & Visualization
# ---------------------------------------------------------------------------

RULING_STYLE = {
    "UPHELD": "[bold green]UPHELD[/bold green]",
    "REJECTED": "[bold red]REJECTED[/bold red]",
    "ESCALATE": "[bold yellow]ESCALATE[/bold yellow]",
}


def run_demo():
    """Runs the 4-stage Refund Bench pipeline and displays each stage in Rich tables."""
    # ① Verify OpenAI client and print the benchmark banner
    get_openai_client()
    bench_label = BENCH_CHOICES[SELECTED_BENCH]["label"]

    console.print(
        Panel.fit(
            "[bold cyan]The Refund Bench — 4-Stage Dispute Adjudication Pipeline[/bold cyan]\n"
            f"[dim]Bench: {bench_label} · Auto-Approve Cap: ₹{SELECTED_CAP:.0f}[/dim]",
            border_style="cyan",
        )
    )
    console.print()

    # ② Stage 1: Display Customer Complaint & Frozen Order Evidence Snapshot
    console.print(Rule("[bold white]Stage 1 · Intake & Evidence Snapshot[/bold white]"))
    console.print(
        Panel(
            f"[italic]{COMPLAINT_INPUT}[/italic]",
            title="[bold]Customer Complaint[/bold]",
            border_style="white",
        )
    )

    ev = DEFAULT_ORDER_EVIDENCE
    ev_lines = [
        f"[bold]Order ID:[/bold] {ev['order_id']}   [bold]Order Total:[/bold] ₹{ev['order_total']:.0f}   "
        f"[bold]Delivery Fee:[/bold] ₹{ev['fees']['delivery_fee']:.0f}",
        f"[bold]Timeline:[/bold] Placed {ev['timeline']['placed_time']} → Delivered {ev['timeline']['delivered_time']} "
        f"({ev['timeline']['actual_duration_min']} min vs {ev['timeline']['sla_duration_min']} min SLA)",
        f"[bold]Weight Sensor:[/bold] {ev['measurements']['pickup_weight_kg']} kg actual vs "
        f"{ev['measurements']['expected_weight_kg']} kg expected",
        f"[bold]Partner:[/bold] {ev['partner']['partner_id']} (Customer rated {ev['partner']['customer_rating_at_door']}★ "
        f"at {ev['partner']['rating_time']})   [bold]Packaging Sensor:[/bold] {ev['packaging_condition_recorded']}",
    ]
    console.print(
        Panel(
            "\n".join(ev_lines),
            title="[bold]Frozen Evidence Snapshot[/bold]",
            border_style="dim",
        )
    )
    console.print()

    # ③ Stage 2: Extract atomic grievances and render extraction table
    console.print(Rule("[bold cyan]Stage 2 · Grievance Extraction[/bold cyan]"))
    grievances = stage2_extract_grievances(
        COMPLAINT_INPUT, ev["line_items"]
    )

    g_table = Table(show_lines=True)
    g_table.add_column("ID", style="bold cyan", width=6)
    g_table.add_column("Category", style="magenta", width=18)
    g_table.add_column("Extracted Standalone Grievance")
    for g in grievances:
        g_table.add_row(
            str(g.get("grievance_id", "")),
            str(g.get("category", "")),
            str(g.get("text", "")),
        )
    console.print(g_table)
    console.print()

    # ④ Stage 3: Run Multi-Judge Voting Bench and render individual rulings + tally
    console.print(Rule("[bold yellow]Stage 3 · Multi-Judge Voting Bench[/bold yellow]"))
    judged = stage3_judge_bench(grievances, ev, SELECTED_BENCH)

    for g in judged:
        console.print(
            f"[bold]{g['grievance_id']} ({g['category']}):[/bold] {g['text']}"
        )
        for r in g["individual_rulings"]:
            fb_tag = " [dim](fallback)[/dim]" if r.get("is_fallback") else ""
            styled_ruling = RULING_STYLE.get(r["ruling"], r["ruling"])
            console.print(
                f"  • [bold]{r['judge_name']}[/bold]{fb_tag}: {styled_ruling} "
                f"[dim](conf {r['confidence']:.2f} · cited: {r['evidence_cited']})[/dim]\n"
                f"    [dim]{r['reasoning']}[/dim]"
            )
        console.print()

    v_table = Table(title="Stage 3 Majority Verdict & Code-Driven Pricing", show_lines=True)
    v_table.add_column("ID", style="bold", width=6)
    v_table.add_column("Category", width=17)
    v_table.add_column("Vote Split", justify="center", width=14)
    v_table.add_column("Majority Verdict", justify="center", width=16)
    v_table.add_column("Confidence", justify="right", width=10)
    v_table.add_column("Approved (₹)", justify="right", style="green", width=12)
    v_table.add_column("Held (₹)", justify="right", style="yellow", width=10)

    for g in judged:
        v_table.add_row(
            g["grievance_id"],
            g["category"],
            g["vote_split"],
            RULING_STYLE.get(g["verdict"], g["verdict"]),
            f"{g['confidence']:.2f}",
            f"₹{g['refund_amount']:.0f}",
            f"₹{g['held_amount']:.0f}",
        )
    console.print(v_table)
    console.print()

    # ⑤ Stage 4: Compute settlement, check auto-approval cap, and display customer reply
    console.print(Rule("[bold green]Stage 4 · Settlement & Customer Reply[/bold green]"))
    settlement = stage4_settle(COMPLAINT_INPUT, judged, ev, SELECTED_CAP)

    cap_status = (
        "[bold red]EXCEEDED — Routed to Human Review[/bold red]"
        if settlement["cap_exceeded"]
        else "[bold green]WITHIN CAP — Auto-Approved[/bold green]"
    )
    summary_lines = [
        f"Dispute ID:             [bold]{settlement['dispute_id']}[/bold]",
        f"Bench Layout:           {bench_label}",
        f"Auto-Approval Cap:      ₹{settlement['auto_approval_cap']:.0f} ({cap_status})",
        f"Total Approved Refund:  [bold green]₹{settlement['total_approved_refund']:.0f}[/bold green]",
        f"Total Held for Review:  [bold yellow]₹{settlement['total_held_for_review']:.0f}[/bold yellow]",
    ]
    console.print(
        Panel.fit(
            "\n".join(summary_lines),
            title="[bold]Settlement Totals[/bold]",
            border_style="green",
        )
    )
    console.print(
        Panel(
            settlement["customer_message"],
            title="[bold]Synthesized Customer Support Reply[/bold]",
            border_style="cyan",
        )
    )


# ---------------------------------------------------------------------------
# Standalone CLI Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    run_demo()

