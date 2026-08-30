"""Evaluation tools for InterviewIQ.

Deterministic, rule-based tools for evaluating candidate interview answers:
1. detect_filler_words: Identifies and counts speech filler words/phrases.
2. check_star_structure: Analyzes answers for Situation, Task, Action, Result.
3. score_relevance: Evaluates answer relevance (0-100) against expected keywords.

Each returns a structured dict (not a pre-formatted string) so the agent can
use the raw numbers for session aggregation and the final report.
"""

import re
from typing import Any

# ---------------------------------------------------------------------------
# Filler-word detection
# ---------------------------------------------------------------------------

# Standard filler words and conversational crutch phrases.
FILLER_PATTERNS = [
    ("you know", r"\byou know\b"),
    ("sort of", r"\bsort of\b"),
    ("kind of", r"\bkind of\b"),
    ("i mean", r"\bi mean\b"),
    ("um", r"\bum+\b"),
    ("uh", r"\buh+\b"),
    ("like", r"\blike\b"),
    ("basically", r"\bbasically\b"),
    ("actually", r"\bactually\b"),
    ("literally", r"\bliterally\b"),
    ("honestly", r"\bhonestly\b"),
    ("right", r"\bright\b"),
]


def detect_filler_words(answer: str) -> dict[str, Any]:
    """Count filler words (um, like, basically, etc.) in a candidate's answer.

    Returns a structured dict with detected fillers, total count, density per
    100 words, and a verdict message.
    """
    if not answer or not answer.strip():
        return {
            "detected_fillers": {},
            "total_filler_count": 0,
            "has_fillers": False,
            "filler_density_per_100_words": 0.0,
            "message": "No answer provided or answer is empty.",
        }

    text_lower = answer.lower()
    detected_fillers: dict[str, int] = {}
    total_count = 0

    for name, pattern in FILLER_PATTERNS:
        matches = re.findall(pattern, text_lower, flags=re.IGNORECASE)
        count = len(matches)
        if count > 0:
            detected_fillers[name] = count
            total_count += count

    # Compute word count for density calculation.
    words = re.findall(r"\b\w+\b", text_lower)
    word_count = len(words)
    density = round((total_count / max(word_count, 1)) * 100, 1)

    if total_count > 0:
        details = ", ".join(
            f"{k} ({v})"
            for k, v in sorted(detected_fillers.items(), key=lambda x: -x[1])
        )
        message = f"Found {total_count} filler word(s) ({density}% density): {details}."
    else:
        message = "Excellent! No filler words detected in this answer."

    return {
        "detected_fillers": detected_fillers,
        "total_filler_count": total_count,
        "has_fillers": total_count > 0,
        "filler_density_per_100_words": density,
        "word_count": word_count,
        "message": message,
    }


# ---------------------------------------------------------------------------
# STAR structure detection
# ---------------------------------------------------------------------------

# Cue words and phrase patterns for STAR framework detection.
STAR_PATTERNS = {
    "Situation": [
        r"\b(?:in my (?:previous|former|past|last) role|when i was (?:at|working|leading)|at my previous company)\b",
        r"\b(?:the situation was|the context was|our company|our team was facing|we had a project)\b",
        r"\b(?:during a|during the|faced with|at the time|background|scenario)\b",
    ],
    "Task": [
        r"\b(?:my (?:task|goal|objective|role|responsibility|duty) was)\b",
        r"\b(?:i (?:was assigned to|was tasked with|needed to|had to|was responsible for))\b",
        r"\b(?:the challenge was|our target was|required to|aimed to)\b",
    ],
    "Action": [
        r"\b(?:i (?:decided|implemented|built|created|led|developed|analyzed|organized|proposed|initiated|designed|coordinated|refactored|migrated|reached out))\b",
        r"\b(?:my approach was|steps i took|i set up|i established|i wrote|i introduced)\b",
        r"\b(?:to resolve this, i|i worked with|i facilitated)\b",
    ],
    "Result": [
        r"\b(?:as a result|the outcome was|we achieved|we delivered|we improved|successfully)\b",
        r"\b(?:increased|reduced|decreased|saved|boosted|resolved|prevented)\b",
        r"\b(?:\d+%(?: reduction| increase| improvement| latency| failure)?|\$\d+[\d,.]*(?:k|m|b)?|\d+ (?:days|weeks|months|minutes|hours))\b",
        r"\b(?:impact was|outcome|post-mortem|non-conformities|contract closed)\b",
    ],
}


def check_star_structure(answer: str) -> dict[str, Any]:
    """Check whether a behavioral answer covers Situation, Task, Action, Result.

    Returns a structured dict with per-component coverage, a percentage score,
    and a recommendation message.
    """
    if not answer or not answer.strip():
        return {
            "situation": False,
            "task": False,
            "action": False,
            "result": False,
            "covered_components": [],
            "missing_components": ["Situation", "Task", "Action", "Result"],
            "star_score": 0.0,
            "is_star_complete": False,
            "message": "Answer is empty. Please provide a detailed response.",
        }

    text_lower = answer.lower()
    covered: list[str] = []
    missing: list[str] = []
    components_status: dict[str, bool] = {}

    for component, patterns in STAR_PATTERNS.items():
        found = any(
            re.search(pattern, text_lower, flags=re.IGNORECASE)
            for pattern in patterns
        )
        components_status[component.lower()] = found
        if found:
            covered.append(component)
        else:
            missing.append(component)

    star_score = round((len(covered) / 4) * 100, 1)
    is_complete = len(covered) == 4

    if is_complete:
        message = "Outstanding! All 4 STAR components are clearly present."
    elif len(covered) >= 2:
        message = f"Good structure ({star_score}% STAR). Strengthen: {', '.join(missing)}."
    else:
        message = f"Weak structure ({star_score}% STAR). Missing: {', '.join(missing)}."

    return {
        "situation": components_status.get("situation", False),
        "task": components_status.get("task", False),
        "action": components_status.get("action", False),
        "result": components_status.get("result", False),
        "covered_components": covered,
        "missing_components": missing,
        "star_score": star_score,
        "is_star_complete": is_complete,
        "message": message,
    }


# ---------------------------------------------------------------------------
# Keyword relevance scoring
# ---------------------------------------------------------------------------


def _build_keyword_pattern(kw_clean: str) -> str:
    """Build a regex pattern that matches a keyword and common inflections."""
    # Multi-word phrases and hyphenated/underscored terms.
    if " " in kw_clean or "-" in kw_clean or "_" in kw_clean:
        tokens = [re.escape(t) for t in re.split(r"[\s\-_]+", kw_clean) if t]
        return r"\b" + r"[\s\-_]+".join(tokens) + r"\b"

    # -tion → verb forms (resolution → resolve, resolving, …)
    if kw_clean.endswith("tion") and len(kw_clean) > 5:
        stem = re.escape(kw_clean[:-4])
        return rf"\b(?:{re.escape(kw_clean)}s?|{stem}t(?:e|es|ed|ing)?|{stem[:-1]}v(?:e|es|ed|ing)?)\b"
    # -ment → verb forms (alignment → align, aligning, …)
    if kw_clean.endswith("ment") and len(kw_clean) > 5:
        stem = re.escape(kw_clean[:-4])
        return rf"\b(?:{re.escape(kw_clean)}s?|{stem}(?:s|ed|ing|e)?)\b"
    # -e ending (cache → caching, cached, …)
    if kw_clean.endswith("e") and len(kw_clean) > 3:
        stem = re.escape(kw_clean[:-1])
        return rf"\b(?:{re.escape(kw_clean)}s?|{stem}(?:ing|ed|es|able|ability)?)\b"
    # -y ending (delivery → deliveries, …)
    if kw_clean.endswith("y") and len(kw_clean) > 3:
        stem = re.escape(kw_clean[:-1])
        return rf"\b(?:{re.escape(kw_clean)}|{stem}(?:ies|ied|ying))\b"
    # Default: base + common suffixes.
    base = re.escape(kw_clean)
    return rf"\b(?:{base}|{base}(?:s|es|ed|ing)?)\b"


def score_relevance(answer: str, expected_keywords: list[str]) -> dict[str, Any]:
    """Score relevance of an answer against expected keywords (0-100).

    Uses regex-based matching with grammatical inflection support and a
    calibrated tiered scoring curve.
    """
    if not answer or not answer.strip():
        return {
            "score": 0,
            "matched_keywords": [],
            "unmatched_keywords": list(expected_keywords),
            "keyword_coverage_ratio": 0.0,
            "total_expected": len(expected_keywords),
            "total_matched": 0,
            "message": "Answer is empty. Relevance score is 0.",
        }

    if not expected_keywords:
        return {
            "score": 100,
            "matched_keywords": [],
            "unmatched_keywords": [],
            "keyword_coverage_ratio": 1.0,
            "total_expected": 0,
            "total_matched": 0,
            "message": "No expected keywords specified.",
        }

    text_lower = answer.lower()
    matched_keywords: list[str] = []
    unmatched_keywords: list[str] = []

    for kw in expected_keywords:
        kw_clean = kw.lower().strip()
        if not kw_clean:
            continue
        pattern = _build_keyword_pattern(kw_clean)
        if re.search(pattern, text_lower, flags=re.IGNORECASE):
            matched_keywords.append(kw)
        else:
            unmatched_keywords.append(kw)

    total_expected = len(expected_keywords)
    total_matched = len(matched_keywords)
    coverage_ratio = total_matched / max(total_expected, 1)

    # Calibrated scoring curve:
    #   >= 70% coverage -> 90-100 score
    #   >= 45% coverage -> 75-89 score
    #   >= 25% coverage -> 50-74 score
    #   <  25% coverage -> 0-49 score
    if total_expected == 0:
        score = 100
    elif total_matched == 0:
        score = 0
    elif coverage_ratio >= 0.70:
        score = min(100, int(round(90 + ((coverage_ratio - 0.70) / 0.30) * 10)))
    elif coverage_ratio >= 0.45:
        score = int(round(75 + ((coverage_ratio - 0.45) / 0.25) * 14))
    elif coverage_ratio >= 0.25:
        score = int(round(50 + ((coverage_ratio - 0.25) / 0.20) * 24))
    else:
        score = max(5, int(round((coverage_ratio / 0.25) * 45)))

    if score >= 80:
        message = f"High relevance ({score}/100). Hit {total_matched}/{total_expected} expected concepts."
    elif score >= 50:
        tops = ", ".join(unmatched_keywords[:3])
        message = f"Moderate relevance ({score}/100). Hit {total_matched}/{total_expected}. Consider: {tops}."
    else:
        tops = ", ".join(unmatched_keywords[:4])
        message = f"Low relevance ({score}/100). Hit only {total_matched}/{total_expected}. Missed: {tops}."

    return {
        "score": score,
        "matched_keywords": matched_keywords,
        "unmatched_keywords": unmatched_keywords,
        "keyword_coverage_ratio": round(coverage_ratio, 2),
        "total_expected": total_expected,
        "total_matched": total_matched,
        "message": message,
    }

