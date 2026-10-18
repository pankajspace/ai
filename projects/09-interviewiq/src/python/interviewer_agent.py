"""Interviewer agent — Ask 4 (bonus): a second, specialised agent.

The Evaluator agent in ``agent.py`` scores answers. This agent has a single,
different job: look at how the candidate has done so far and decide which
**category** the next question should come from. It never evaluates answers
and never touches the Evaluator's tools — it only *reads* the shared session
memory.

Kept deliberately simple (no A2A protocol, no agent cards, no network hops
between agents): a second agent with its own system prompt, called in
sequence by a small orchestrator (``run_multi_agent.py`` on the CLI, the
``GET /next-question`` route in ``app.py`` for the web UI). That is the
"orchestrator + specialised agents" pattern in its smallest working form.

When no LLM key is configured, a deterministic rule of thumb makes the same
kind of decision so the feature still works offline.
"""

import json
import re

from config import get_openai_client
from interview_bank import QUESTIONS

# A relevance score below this counts as a weak answer (sample weak answers
# score 0–22, sample strong answers score 98–100).
WEAK_THRESHOLD = 60

# Categories are grouped into two families so "stay close" vs "switch for
# breadth" has a meaning even though the bank has one question per category.
CATEGORY_FAMILIES = {
    "Behavioral": "people",
    "Leadership": "people",
    "Technical": "engineering",
    "System Design": "engineering",
    "Problem-Solving": "engineering",
}

SYSTEM_PROMPT = (
    "You are the Interviewer half of InterviewIQ's two-agent mock interview "
    "system. A separate Evaluator agent scores every answer; you never score "
    "answers yourself.\n"
    "Your only job: choose the category of the NEXT question from the list of "
    "categories that are still available, based on how the candidate has done "
    "so far.\n"
    "Category families: people = Behavioral, Leadership; engineering = "
    "Technical, System Design, Problem-Solving.\n"
    "Rule of thumb: after a weak answer (relevance below "
    f"{WEAK_THRESHOLD}/100), stay in the same family so the candidate gets "
    "another shot at similar skills; after a strong answer, switch family to "
    "test breadth. For the very first question, start with Behavioral if it "
    "is available.\n"
    'Reply with JSON only: {"category": "<one available category>", '
    '"reason": "<one short sentence addressed to the candidate>"}'
)


class InterviewerAgent:
    """Chooses the next question's category from shared session memory."""

    def __init__(self, client=None, model: str | None = None):
        # ① reuse an injected client (tests) or the configured provider
        if client is not None:
            self._client, self._model = client, model
        else:
            self._client, self._model = get_openai_client()

    # -- Public API ----------------------------------------------------------

    def choose_next(self, memory) -> dict | None:
        """Pick the next unanswered question for the candidate.

        Args:
            memory: The Evaluator's ``InterviewSessionMemory`` (read-only).

        Returns:
            ``{"category", "reason", "source", "question"}`` where ``source``
            is ``"llm"`` or ``"rules"``, or ``None`` when every question in the
            bank has already been answered.
        """
        # ① work out which questions and categories are still unanswered
        answered_ids = {t["question_id"] for t in memory.turns}
        remaining = [q for q in QUESTIONS if q["id"] not in answered_ids]
        if not remaining:
            return None
        available = list(dict.fromkeys(q["category"] for q in remaining))

        # ② ask the LLM first; fall back to the rule of thumb on any problem
        decision = None
        if self._client and len(available) > 1:
            decision = self._ask_llm(memory, available)
        if decision is None:
            decision = self._rule_based(memory, available)

        # ③ hand back the first unanswered question in the chosen category
        question = next(q for q in remaining if q["category"] == decision["category"])
        return {**decision, "question": question}

    # -- Internal helpers ----------------------------------------------------

    @staticmethod
    def build_summary(memory, available: list[str]) -> str:
        """Plain-English recap of the session that the LLM reads."""
        # ① describe the opening move when nothing has been answered yet
        turns = memory.turns
        lines = []
        if not turns:
            lines.append("This is the first question of the session.")
        else:
            # ② list each turn's category and headline scores in order
            lines.append(f"Answers so far ({len(turns)}):")
            for t in turns:
                r = t["results"]
                rel = r.get("score_relevance", {}).get("score", 0)
                star = r.get("check_star_structure", {}).get("star_score", 0)
                fillers = r.get("detect_filler_words", {}).get("total_filler_count", 0)
                lines.append(
                    f"- Turn {t['turn_id']} [{t['category']}]: relevance {rel}/100, "
                    f"STAR {star}%, fillers {fillers}"
                )
            # ③ call out the most recent answer, which drives the rule of thumb
            last = turns[-1]
            last_rel = last["results"].get("score_relevance", {}).get("score", 0)
            verdict = "weak" if last_rel < WEAK_THRESHOLD else "strong"
            lines.append(
                f"Most recent answer: {last['category']} ({last_rel}/100, {verdict})."
            )
        # ④ list the only categories the agent is allowed to pick
        lines.append(f"Available categories: {', '.join(available)}.")
        return "\n".join(lines)

    def _ask_llm(self, memory, available: list[str]) -> dict | None:
        """Let the LLM choose; return ``None`` if the reply is unusable."""
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": self.build_summary(memory, available)},
        ]
        try:
            # ① one plain chat call — this agent needs no tools
            response = self._client.chat.completions.create(
                model=self._model, messages=messages,
            )
            content = response.choices[0].message.content or ""
        except Exception:
            return None

        # ② accept only a category that is actually still available
        category, reason = self._parse_reply(content, available)
        if not category:
            return None
        return {
            "category": category,
            "reason": reason or f"The Interviewer chose {category} next.",
            "source": "llm",
        }

    @staticmethod
    def _parse_reply(content: str, available: list[str]) -> tuple[str | None, str]:
        """Pull ``(category, reason)`` out of a JSON-ish or plain-text reply."""
        lookup = {c.lower(): c for c in available}
        # ① prefer a JSON object, even if the model wrapped it in extra text
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
                category = lookup.get(str(data.get("category", "")).strip().lower())
                if category:
                    return category, str(data.get("reason", "")).strip()
            except (json.JSONDecodeError, AttributeError):
                pass
        # ② otherwise accept the first available category named in the text
        lowered = content.lower()
        for key, category in lookup.items():
            if key in lowered:
                return category, ""
        return None, ""

    @staticmethod
    def _rule_based(memory, available: list[str]) -> dict:
        """Deterministic fallback that follows the same rule of thumb."""
        turns = memory.turns
        # ① open with Behavioral when possible
        if not turns:
            category = "Behavioral" if "Behavioral" in available else available[0]
            return {
                "category": category,
                "reason": f"Opening with a {category} question to warm up.",
                "source": "rules",
            }

        # ② stay in the family after a weak answer, switch after a strong one
        last = turns[-1]
        last_rel = last["results"].get("score_relevance", {}).get("score", 0)
        last_family = CATEGORY_FAMILIES.get(last["category"])
        weak = last_rel < WEAK_THRESHOLD
        if weak:
            preferred = [c for c in available if CATEGORY_FAMILIES.get(c) == last_family]
        else:
            preferred = [c for c in available if CATEGORY_FAMILIES.get(c) != last_family]
        category = (preferred or available)[0]

        # ③ explain the choice in one short sentence
        if weak and preferred:
            reason = (
                f"Your {last['category']} answer scored {last_rel}/100, so staying "
                f"with {last_family} skills — try {category} next."
            )
        elif not weak and preferred:
            reason = (
                f"Strong {last['category']} answer ({last_rel}/100) — switching "
                f"to {category} to test breadth."
            )
        else:
            reason = f"{category} is the next unanswered category."
        return {"category": category, "reason": reason, "source": "rules"}
