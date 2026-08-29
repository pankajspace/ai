"""Evaluation tools for InterviewIQ.

Deterministic, rule-based tools for evaluating candidate interview answers:
1. detect_filler_words: Identifies and counts speech filler words/phrases.
2. check_star_structure: Analyzes answers for Situation, Task, Action, Result components.
3. score_relevance: Evaluates answer relevance (0-100) against expected keywords and concepts.
"""

import re
from typing import Any

# Standard filler words and conversational crutch phrases
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

# Cue words and phrase patterns for STAR framework detection
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


def detect_filler_words(answer: str) -> dict[str, Any]:
    """Detect and count filler words and verbal pauses in a candidate's answer.

    Args:
        answer: The candidate's interview answer text.

    Returns:
        A structured dictionary containing detected fillers, counts, and summary.
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

    # Compute word count for density calculation
    words = re.findall(r"\b\w+\b", text_lower)
    word_count = len(words)
    density = round((total_count / max(word_count, 1)) * 100, 1)

    if total_count > 0:
        details = ", ".join(f"{k} ({v})" for k, v in sorted(detected_fillers.items(), key=lambda x: -x[1]))
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


def check_star_structure(answer: str) -> dict[str, Any]:
    """Evaluate whether an interview answer covers the STAR framework components.

    Components:
    - Situation: Background context or setting.
    - Task: Challenge, responsibility, or goal.
    - Action: Concrete steps taken by the candidate.
    - Result: Measurable outcome, quantifiable impact, or conclusion.

    Args:
        answer: The candidate's interview answer text.

    Returns:
        A structured dictionary with coverage status for each STAR component,
        overall score, and recommendations.
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
            "message": "Answer is empty. Please provide a detailed response covering Situation, Task, Action, and Result.",
        }

    text_lower = answer.lower()
    covered: list[str] = []
    missing: list[str] = []
    components_status: dict[str, bool] = {}

    for component, patterns in STAR_PATTERNS.items():
        found = False
        for pattern in patterns:
            if re.search(pattern, text_lower, flags=re.IGNORECASE):
                found = True
                break
        components_status[component.lower()] = found
        if found:
            covered.append(component)
        else:
            missing.append(component)

    total_components = 4
    star_score = round((len(covered) / total_components) * 100, 1)
    is_complete = len(covered) == total_components

    if is_complete:
        message = "Outstanding! The answer clearly covers all 4 components of the STAR framework."
    elif len(covered) >= 2:
        missing_str = ", ".join(missing)
        message = f"Good structure ({star_score}% STAR score). Consider strengthening: {missing_str}."
    else:
        missing_str = ", ".join(missing)
        message = f"Weak structure ({star_score}% STAR score). Missing key components: {missing_str}."

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


def _build_keyword_pattern(kw_clean: str) -> str:
    """Build a regex pattern that matches keyword and common grammatical inflections."""
    if " " in kw_clean or "-" in kw_clean or "_" in kw_clean:
        tokens = [re.escape(t) for t in re.split(r"[\s\-_]+", kw_clean) if t]
        return r"\b" + r"[\s\-_]+".join(tokens) + r"\b"

    if kw_clean.endswith("tion") and len(kw_clean) > 5:
        stem = re.escape(kw_clean[:-4])
        # Matches resolution, resolve, resolving, resolved, communication, communicate, etc.
        return rf"\b(?:{re.escape(kw_clean)}s?|{stem}t(?:e|es|ed|ing)?|{stem[:-1]}v(?:e|es|ed|ing)?)\b"
    elif kw_clean.endswith("ment") and len(kw_clean) > 5:
        stem = re.escape(kw_clean[:-4])
        return rf"\b(?:{re.escape(kw_clean)}s?|{stem}(?:s|ed|ing|e)?)\b"
    elif kw_clean.endswith("e") and len(kw_clean) > 3:
        stem = re.escape(kw_clean[:-1])
        return rf"\b(?:{re.escape(kw_clean)}s?|{stem}(?:ing|ed|es|able|ability)?)\b"
    elif kw_clean.endswith("y") and len(kw_clean) > 3:
        stem = re.escape(kw_clean[:-1])
        return rf"\b(?:{re.escape(kw_clean)}|{stem}(?:ies|ied|ying))\b"
    else:
        base = re.escape(kw_clean)
        return rf"\b(?:{base}|{base}(?:s|es|ed|ing)?)\b"


def score_relevance(answer: str, expected_keywords: list[str]) -> dict[str, Any]:
    """Score the relevance of an answer against expected keywords on a scale of 0-100.

    Args:
        answer: The candidate's interview answer text.
        expected_keywords: List of domain-specific keywords and concepts.

    Returns:
        A structured dictionary with relevance score, matched/unmatched keywords,
        and coverage percentage.
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
    # >= 70% coverage -> 90 - 100 score
    # >= 45% coverage -> 75 - 89 score
    # >= 25% coverage -> 50 - 74 score
    # < 25% coverage  -> 0 - 49 score
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
        quality = "High"
        message = f"High relevance ({score}/100). Hit {total_matched}/{total_expected} expected technical concepts."
    elif score >= 50:
        quality = "Moderate"
        message = f"Moderate relevance ({score}/100). Hit {total_matched}/{total_expected} expected concepts. Consider mentioning: {', '.join(unmatched_keywords[:3])}."
    else:
        quality = "Low"
        message = f"Low relevance ({score}/100). Hit only {total_matched}/{total_expected} expected concepts. Lacked coverage of key areas: {', '.join(unmatched_keywords[:4])}."

    return {
        "score": score,
        "quality": quality,
        "matched_keywords": matched_keywords,
        "unmatched_keywords": unmatched_keywords,
        "keyword_coverage_ratio": round(coverage_ratio, 2),
        "total_expected": total_expected,
        "total_matched": total_matched,
        "message": message,
    }
