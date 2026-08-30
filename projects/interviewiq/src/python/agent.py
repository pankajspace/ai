"""InterviewIQ Agent — tool-calling evaluator with session memory.

Architecture
------------
- **InterviewSessionMemory**: append-only session store with on-demand
  aggregation methods and anti-recency-bias weakest-area detection.
- **EvaluatorAgent**: wraps the LLM client and the genuine tool-calling loop
  (the LLM *chooses* which tools to invoke, just like the class-notes
  reference) plus session memory.

The key design choice: tools return structured *dicts*, and the LLM decides
dynamically which tools to call via the OpenAI function-calling API.  This
is the authentic ReAct-style agent pattern taught in the class.
"""

import json

from openai import BadRequestError

from config import get_openai_client
from tools import check_star_structure, detect_filler_words, score_relevance

# ---------------------------------------------------------------------------
# Session memory
# ---------------------------------------------------------------------------


class InterviewSessionMemory:
    """Append-only session store for interview turns.

    Each turn records the question, answer, and the structured dict results
    returned by each evaluation tool.
    """

    def __init__(self):
        self._turns: list[dict] = []

    @property
    def turns(self) -> list[dict]:
        return list(self._turns)

    @property
    def turn_count(self) -> int:
        return len(self._turns)

    def add_turn(
        self, question: str, answer: str, results: dict,
        category: str = "", question_id: int = 0,
        expected_keywords: list | None = None,
    ) -> None:
        self._turns.append({
            "turn_id": len(self._turns) + 1,
            "question_id": question_id,
            "question": question,
            "category": category,
            "expected_keywords": expected_keywords or [],
            "answer": answer,
            "results": results,
        })

    def get_weakest_area(self) -> dict | None:
        """Return the turn with the lowest composite score.

        Uses a 3-key sort (relevance ASC, star_score ASC, filler_count DESC)
        to explicitly avoid recency bias — the weakest area is the globally
        worst turn, not the most recent one.
        """
        if not self._turns:
            return None

        def sort_key(turn):
            r = turn["results"]
            rel = r.get("score_relevance", {}).get("score", 50)
            star = r.get("check_star_structure", {}).get("star_score", 50)
            fillers = r.get("detect_filler_words", {}).get("total_filler_count", 0)
            # Lower relevance, lower STAR, higher fillers = weaker.
            return (rel, star, -fillers)

        weakest = min(self._turns, key=sort_key)
        rel_data = weakest["results"].get("score_relevance", {})
        star_data = weakest["results"].get("check_star_structure", {})
        filler_data = weakest["results"].get("detect_filler_words", {})
        return {
            "turn_id": weakest["turn_id"],
            "question_id": weakest["question_id"],
            "question": weakest["question"],
            "category": weakest["category"],
            "relevance_score": rel_data.get("score", 0),
            "star_score": star_data.get("star_score", 0),
            "filler_count": filler_data.get("total_filler_count", 0),
            "unmatched_keywords": rel_data.get("unmatched_keywords", []),
        }

    def get_strongest_area(self) -> dict | None:
        """Return the turn with the highest composite score."""
        if not self._turns:
            return None

        def sort_key(turn):
            r = turn["results"]
            rel = r.get("score_relevance", {}).get("score", 50)
            star = r.get("check_star_structure", {}).get("star_score", 50)
            fillers = r.get("detect_filler_words", {}).get("total_filler_count", 0)
            return (rel, star, -fillers)

        strongest = max(self._turns, key=sort_key)
        rel_data = strongest["results"].get("score_relevance", {})
        star_data = strongest["results"].get("check_star_structure", {})
        filler_data = strongest["results"].get("detect_filler_words", {})
        return {
            "turn_id": strongest["turn_id"],
            "question_id": strongest["question_id"],
            "question": strongest["question"],
            "category": strongest["category"],
            "relevance_score": rel_data.get("score", 0),
            "star_score": star_data.get("star_score", 0),
            "filler_count": filler_data.get("total_filler_count", 0),
        }

    def get_average_relevance(self) -> float:
        scores = [
            t["results"].get("score_relevance", {}).get("score", 0)
            for t in self._turns
            if "score_relevance" in t["results"]
        ]
        return round(sum(scores) / len(scores), 1) if scores else 0.0

    def get_total_questions(self) -> int:
        return len(self._turns)

    def get_scorecard(self) -> list[dict]:
        """Return a structured summary list for the scorecard table."""
        card = []
        for t in self._turns:
            r = t["results"]
            rel = r.get("score_relevance", {}).get("score", 0)
            star = r.get("check_star_structure", {}).get("star_score", 0)
            fillers = r.get("detect_filler_words", {}).get("total_filler_count", 0)
            q_text = t["question"]
            card.append({
                "Turn": t["turn_id"],
                "Category": t["category"],
                "Question": (q_text[:55] + "...") if len(q_text) > 55 else q_text,
                "Relevance Score": f"{rel}/100",
                "STAR Score": f"{star}%",
                "Fillers": fillers,
            })
        return card

    def get_category_breakdown(self) -> dict:
        """Compute category-wise average performance."""
        cat_stats: dict[str, list] = {}
        for t in self._turns:
            cat = t["category"]
            if cat not in cat_stats:
                cat_stats[cat] = []
            r = t["results"]
            cat_stats[cat].append({
                "relevance_score": r.get("score_relevance", {}).get("score", 0),
                "star_score": r.get("check_star_structure", {}).get("star_score", 0),
            })
        breakdown = {}
        for cat, items in cat_stats.items():
            avg_rel = round(sum(i["relevance_score"] for i in items) / len(items), 1)
            avg_star = round(sum(i["star_score"] for i in items) / len(items), 1)
            breakdown[cat] = {"count": len(items), "avg_relevance": avg_rel, "avg_star": avg_star}
        return breakdown

    def generate_final_report_dict(self) -> dict:
        """Generate a comprehensive report as a dict with report_text markdown."""
        if not self._turns:
            return {
                "total_questions": 0,
                "average_relevance": 0.0,
                "weakest_area": None,
                "strongest_area": None,
                "total_fillers": 0,
                "report_text": "No questions have been answered yet in this session.",
            }

        total_questions = len(self._turns)
        avg_relevance = self.get_average_relevance()
        weakest = self.get_weakest_area()
        strongest = self.get_strongest_area()
        total_fillers = sum(
            t["results"].get("detect_filler_words", {}).get("total_filler_count", 0)
            for t in self._turns
        )
        avg_fillers = round(total_fillers / total_questions, 1)
        star_compliant = sum(
            1 for t in self._turns
            if t["results"].get("check_star_structure", {}).get("star_score", 0) >= 75
        )
        star_rate = round((star_compliant / total_questions) * 100, 1)
        category_breakdown = self.get_category_breakdown()

        lines = [
            "# 🎯 InterviewIQ Final Assessment Report",
            f"**Total Questions Answered:** {total_questions} | "
            f"**Average Relevance Score:** {avg_relevance}/100",
            f"**Total Filler Words:** {total_fillers} (avg {avg_fillers}/turn) | "
            f"**STAR Framework Mastery:** {star_rate}%",
            "",
            "## 📊 Key Highlights & Aggregations",
        ]
        if strongest:
            lines.append(
                f"1. **Strongest Area:** {strongest['category']} "
                f"(Score: {strongest['relevance_score']}/100)\n"
                f"   - Question: *\"{strongest['question']}\"*"
            )
        if weakest:
            missed = ", ".join(weakest.get("unmatched_keywords", [])[:5]) or "None"
            lines.append(
                f"2. **Weakest Area (Needs Focus):** {weakest['category']} "
                f"(Score: {weakest['relevance_score']}/100)\n"
                f"   - Question: *\"{weakest['question']}\"*\n"
                f"   - Missing Concepts: {missed}"
            )
        lines.append("\n## 📈 Category Breakdown")
        for cat, stats in category_breakdown.items():
            lines.append(
                f"- **{cat}**: {stats['count']} question(s) | "
                f"Avg Relevance: {stats['avg_relevance']}/100 | "
                f"Avg STAR: {stats['avg_star']}%"
            )
        lines.append("\n## 💡 Coach Recommendations")
        if avg_relevance >= 80:
            lines.append("- **Knowledge Depth**: Excellent domain grasp and comprehensive keyword coverage.")
        elif avg_relevance >= 60:
            lines.append("- **Knowledge Depth**: Solid baseline; focus on articulating deeper architectural trade-offs.")
        else:
            weak_cat = weakest["category"] if weakest else "all areas"
            lines.append(f"- **Knowledge Depth**: Review core concepts, particularly in {weak_cat}.")
        if total_fillers > total_questions * 2:
            lines.append(f"- **Delivery**: High filler word frequency ({total_fillers} total). Practice deliberate pauses.")
        else:
            lines.append("- **Delivery**: Clean, articulate delivery with minimal filler words.")
        if star_rate < 75:
            lines.append("- **Structure**: Strengthen STAR structure, particularly quantifiable Results.")
        else:
            lines.append("- **Structure**: Consistently strong STAR narrative with measurable Results.")

        return {
            "total_questions": total_questions,
            "average_relevance": avg_relevance,
            "weakest_area": weakest,
            "strongest_area": strongest,
            "total_fillers": total_fillers,
            "star_compliance_rate": star_rate,
            "category_breakdown": category_breakdown,
            "report_text": "\n".join(lines),
        }

    def clear(self) -> None:
        self._turns.clear()


# ---------------------------------------------------------------------------
# Tool schema (the "menu" the LLM reads)
# ---------------------------------------------------------------------------

TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "detect_filler_words",
            "description": (
                "Count filler words (um, like, basically, etc.) in a "
                "candidate's answer and compute density per 100 words."
            ),
            "parameters": {
                "type": "object",
                "properties": {"answer": {"type": "string"}},
                "required": ["answer"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_star_structure",
            "description": (
                "Check whether a behavioral answer covers Situation, Task, "
                "Action, Result (the STAR framework) and return a percentage "
                "score."
            ),
            "parameters": {
                "type": "object",
                "properties": {"answer": {"type": "string"}},
                "required": ["answer"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "score_relevance",
            "description": (
                "Score how many expected keywords/concepts for the question "
                "appear in the answer, using a 0-100 calibrated scale."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "answer": {"type": "string"},
                    "expected_keywords": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
                "required": ["answer", "expected_keywords"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_final_report",
            "description": (
                "Summarise the whole interview session so far, including the "
                "weakest area. Call this whenever the candidate asks how "
                "they're doing, what their weakest area is, or for an overall "
                "report — at any point in the session, not only at the end."
            ),
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

SYSTEM_PROMPT = (
    "You are InterviewIQ, an AI mock-interview coach.\n"
    "For every candidate answer, call the relevant evaluation tools "
    "(filler words, STAR structure, relevance) before giving feedback.\n"
    "Keep feedback short, specific, and encouraging.\n"
    "If the candidate asks how they're doing, what their weakest area is, "
    "or for an overall report — at any point in the session — call "
    "generate_final_report and answer using what it returns."
)

MAX_TOOL_ROUNDS = 5
MAX_GLITCH_RETRIES = 3


# ---------------------------------------------------------------------------
# Evaluator agent
# ---------------------------------------------------------------------------


class EvaluatorAgent:
    """Tool-calling evaluator agent with session memory.

    Uses the authentic ReAct-style tool-calling loop: the LLM dynamically
    decides which tools to invoke via the function-calling API.
    """

    def __init__(self, memory: InterviewSessionMemory | None = None):
        self.memory = memory or InterviewSessionMemory()
        self._client, self._model = get_openai_client()

        # Register the tool functions.  generate_final_report is a method on
        # this instance so it can access self.memory.
        self._tool_functions = {
            "detect_filler_words": lambda args: detect_filler_words(args["answer"]),
            "check_star_structure": lambda args: check_star_structure(args["answer"]),
            "score_relevance": lambda args: score_relevance(
                args["answer"], args["expected_keywords"]
            ),
            "generate_final_report": lambda _args: self.generate_final_report(),
        }

    # -- Public API ----------------------------------------------------------

    def evaluate_answer(
        self, question_data: dict, answer: str
    ) -> dict:
        """Evaluate one interview answer and record the turn.

        Args:
            question_data: Dict with keys ``question``, ``expected_keywords``,
                ``category``, ``id``.
            answer: The candidate's answer text.

        Returns a structured dict with ``turn``, ``feedback``,
        ``relevance_evaluation``, ``star_evaluation``, ``filler_evaluation``
        that the UI's ``renderEvaluationResult`` expects.
        """
        question = question_data["question"]
        expected_keywords = question_data.get("expected_keywords", [])
        category = question_data.get("category", "")
        question_id = question_data.get("id", 0)

        if not self._client:
            return self._deterministic_evaluate(
                question, answer, expected_keywords, category, question_id,
            )

        user_msg = (
            f"Question: {question}\n"
            f"Candidate's answer: {answer}\n"
            f"Expected keywords for this question: {expected_keywords}\n"
            f"Evaluate this answer using the available tools, then give "
            f"short feedback."
        )
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]

        results: dict = {}
        feedback = self._run_loop(messages, results_out=results)
        self.memory.add_turn(
            question, answer, results,
            category=category,
            question_id=question_id,
            expected_keywords=expected_keywords,
        )

        return {
            "turn": self.memory.turn_count,
            "feedback": feedback,
            "relevance_evaluation": results.get("score_relevance", {}),
            "star_evaluation": results.get("check_star_structure", {}),
            "filler_evaluation": results.get("detect_filler_words", {}),
        }

    def ask_agent(self, user_message: str) -> str:
        """Handle a free-form meta-question ("How am I doing?").

        Uses the same tool-calling loop — the LLM decides whether to call
        generate_final_report to answer the question.
        """
        if not self._client:
            return self.generate_final_report()

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ]
        return self._run_loop(messages)

    def generate_final_report(self) -> str:
        """Aggregate session memory into a formatted report.

        Called as a tool by the LLM, or directly by the UI.
        """
        turns = self.memory.turns
        if not turns:
            return "No answers scored yet."

        lines = [f"Interview Report — {len(turns)} question(s) answered so far\n"]
        relevance_scores: list[tuple[int, str]] = []
        total_fillers = 0

        for t in turns:
            results = t["results"]
            lines.append(f"Q{t['turn_id']}: {t['question']}")

            if "detect_filler_words" in results:
                r = results["detect_filler_words"]
                count = r.get("total_filler_count", 0)
                total_fillers += count
                density = r.get("filler_density_per_100_words", 0)
                lines.append(f"   - Filler words: {count} ({density}% density)")

            if "check_star_structure" in results:
                r = results["check_star_structure"]
                star = r.get("star_score", 0)
                if r.get("is_star_complete"):
                    note = "all stages present"
                else:
                    note = f"missing {', '.join(r.get('missing_components', []))}"
                lines.append(f"   - STAR structure: {star}% — {note}")

            if "score_relevance" in results:
                r = results["score_relevance"]
                score = r.get("score", 0)
                relevance_scores.append((score, t["question"]))
                missed = r.get("unmatched_keywords", [])
                missed_str = ", ".join(missed[:4]) if missed else "none"
                lines.append(f"   - Relevance: {score}/100 (missed: {missed_str})")

        if relevance_scores:
            avg = round(sum(s for s, _ in relevance_scores) / len(relevance_scores))
            weakest = self.memory.get_weakest_area()
            lines.append(f"\nAverage relevance score: {avg}/100")
            if weakest:
                w_score = weakest.get("relevance_score", "?")
                lines.append(
                    f'Weakest area: "{weakest["question"]}" '
                    f"(relevance {w_score}/100)"
                )

        lines.append(f"Total filler words across the session: {total_fillers}")
        return "\n".join(lines)

    def reset(self) -> None:
        """Clear session memory for a fresh start."""
        self.memory.clear()

    # -- Internal helpers ----------------------------------------------------

    def _create_with_retry(self, **kwargs):
        """Call ``client.chat.completions.create`` with retry for Groq glitches.

        Groq's gpt-oss-20b occasionally leaks a format token into the tool
        name (e.g. ``score_relevance<|channel|>commentary``), which Groq then
        rejects as unknown.  Regenerating almost always fixes it.
        """
        last_error = None
        for _ in range(MAX_GLITCH_RETRIES):
            try:
                return self._client.chat.completions.create(**kwargs)
            except BadRequestError as e:
                if getattr(e, "code", None) != "tool_use_failed":
                    raise
                last_error = e
        raise last_error

    def _run_loop(self, messages: list, results_out: dict | None = None) -> str:
        """Shared tool-calling loop (the authentic ReAct pattern).

        Sends messages to the LLM, executes whichever tools the LLM requests,
        appends the results back, and loops until the model stops calling
        tools (up to ``MAX_TOOL_ROUNDS``).

        If ``results_out`` (a dict) is passed, tool results are recorded into
        it by tool name — used by ``evaluate_answer`` to build a session turn.
        """
        for _ in range(MAX_TOOL_ROUNDS):
            response = self._create_with_retry(
                model=self._model,
                messages=messages,
                tools=TOOLS_SCHEMA,
                tool_choice="auto",
            )
            msg = response.choices[0].message

            if not msg.tool_calls:
                return msg.content or ""

            messages.append(msg)
            for call in msg.tool_calls:
                args = (
                    json.loads(call.function.arguments)
                    if call.function.arguments
                    else {}
                )
                fn = self._tool_functions[call.function.name]
                result = fn(args)

                # Record tool results for session logging (except the report
                # itself, which is meta-data, not per-answer evaluation).
                if (
                    results_out is not None
                    and call.function.name != "generate_final_report"
                ):
                    results_out[call.function.name] = result

                messages.append({
                    "role": "tool",
                    "tool_call_id": call.id,
                    "content": (
                        result if isinstance(result, str) else json.dumps(result)
                    ),
                })

        # Ran out of rounds — ask for a final answer without offering tools.
        response = self._create_with_retry(
            model=self._model, messages=messages
        )
        return response.choices[0].message.content or ""

    def _deterministic_evaluate(
        self, question: str, answer: str, expected_keywords: list[str],
        category: str = "", question_id: int = 0,
    ) -> dict:
        """Fallback evaluation when no LLM client is available.

        Runs all three tools deterministically and formats a plain-text
        summary.  No LLM synthesis.
        """
        filler = detect_filler_words(answer)
        star = check_star_structure(answer)
        relevance = score_relevance(answer, expected_keywords)

        results = {
            "detect_filler_words": filler,
            "check_star_structure": star,
            "score_relevance": relevance,
        }
        self.memory.add_turn(
            question, answer, results,
            category=category,
            question_id=question_id,
            expected_keywords=expected_keywords,
        )

        lines = [
            f"Relevance: {relevance['message']}",
            f"STAR: {star['message']}",
            f"Fillers: {filler['message']}",
        ]
        return {
            "turn": self.memory.turn_count,
            "feedback": "\n".join(lines),
            "relevance_evaluation": relevance,
            "star_evaluation": star,
            "filler_evaluation": filler,
        }

