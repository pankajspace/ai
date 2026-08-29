"""InterviewIQ Agent and Session Memory Implementation.

Provides:
1. InterviewSessionMemory: Stateful multi-turn memory tracking candidate answers,
   tool results, aggregate metrics (average relevance, true weakest area), and scorecard.
2. EvaluatorAgent: Tool-calling AI evaluator agent supporting Groq, OpenAI, and
   offline deterministic fallback. Supports per-answer evaluation and mid-session meta-Q&A.
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime
from typing import Any

from dotenv import load_dotenv

from interview_bank import QUESTIONS, get_question_by_id
from tools import check_star_structure, detect_filler_words, score_relevance

# Load environment variables
load_dotenv()


class InterviewSessionMemory:
    """Manages multi-turn memory and session-wide aggregations for an interview."""

    def __init__(self) -> None:
        self.turns: list[dict[str, Any]] = []
        self.start_time: str = datetime.now().isoformat()

    def add_turn(
        self,
        question_id: int,
        question: str,
        category: str,
        expected_keywords: list[str],
        answer: str,
        filler_evaluation: dict[str, Any],
        star_evaluation: dict[str, Any],
        relevance_evaluation: dict[str, Any],
        tools_called: list[str],
        feedback: str,
    ) -> dict[str, Any]:
        """Record an evaluated turn into session memory."""
        turn_id = len(self.turns) + 1
        turn = {
            "turn_id": turn_id,
            "question_id": question_id,
            "question": question,
            "category": category,
            "expected_keywords": expected_keywords,
            "answer": answer,
            "filler_evaluation": filler_evaluation,
            "star_evaluation": star_evaluation,
            "relevance_evaluation": relevance_evaluation,
            "relevance_score": relevance_evaluation.get("score", 0),
            "star_score": star_evaluation.get("star_score", 0.0),
            "filler_count": filler_evaluation.get("total_filler_count", 0),
            "tools_called": tools_called,
            "feedback": feedback,
            "timestamp": datetime.now().isoformat(),
        }
        self.turns.append(turn)
        return turn

    def get_total_questions(self) -> int:
        """Return count of answered questions."""
        return len(self.turns)

    def get_average_relevance(self) -> float:
        """Calculate arithmetic mean of relevance scores across all turns."""
        if not self.turns:
            return 0.0
        total = sum(t["relevance_score"] for t in self.turns)
        return round(total / len(self.turns), 1)

    def get_weakest_area(self) -> dict[str, Any] | None:
        """Identify the question/area with the lowest relevance score across all turns.

        Guaranteed not to default to the latest turn; computes true global minimum.
        """
        if not self.turns:
            return None

        # Sort primarily by lowest relevance_score, then lowest star_score, then highest filler_count
        weakest = min(
            self.turns,
            key=lambda t: (
                t["relevance_score"],
                t["star_score"],
                -t["filler_count"],
            ),
        )
        return {
            "turn_id": weakest["turn_id"],
            "question_id": weakest["question_id"],
            "question": weakest["question"],
            "category": weakest["category"],
            "relevance_score": weakest["relevance_score"],
            "star_score": weakest["star_score"],
            "filler_count": weakest["filler_count"],
            "feedback": weakest["feedback"],
            "matched_keywords": weakest["relevance_evaluation"].get("matched_keywords", []),
            "unmatched_keywords": weakest["relevance_evaluation"].get("unmatched_keywords", []),
        }

    def get_strongest_area(self) -> dict[str, Any] | None:
        """Identify the question/area with the highest relevance score across all turns."""
        if not self.turns:
            return None

        strongest = max(
            self.turns,
            key=lambda t: (
                t["relevance_score"],
                t["star_score"],
                -t["filler_count"],
            ),
        )
        return {
            "turn_id": strongest["turn_id"],
            "question_id": strongest["question_id"],
            "question": strongest["question"],
            "category": strongest["category"],
            "relevance_score": strongest["relevance_score"],
            "star_score": strongest["star_score"],
            "filler_count": strongest["filler_count"],
            "feedback": strongest["feedback"],
        }

    def get_scorecard(self) -> list[dict[str, Any]]:
        """Return a structured summary list suitable for scorecards and Gradio tables."""
        card = []
        for t in self.turns:
            card.append({
                "Turn": t["turn_id"],
                "Category": t["category"],
                "Question": (t["question"][:55] + "...") if len(t["question"]) > 55 else t["question"],
                "Relevance Score": f"{t['relevance_score']}/100",
                "STAR Score": f"{t['star_score']}%",
                "Fillers": t["filler_count"],
            })
        return card

    def get_category_breakdown(self) -> dict[str, dict[str, Any]]:
        """Compute category-wise average performance."""
        cat_stats: dict[str, list[dict[str, Any]]] = {}
        for t in self.turns:
            cat = t["category"]
            if cat not in cat_stats:
                cat_stats[cat] = []
            cat_stats[cat].append(t)

        breakdown = {}
        for cat, items in cat_stats.items():
            avg_rel = round(sum(i["relevance_score"] for i in items) / len(items), 1)
            avg_star = round(sum(i["star_score"] for i in items) / len(items), 1)
            breakdown[cat] = {
                "count": len(items),
                "avg_relevance": avg_rel,
                "avg_star": avg_star,
            }
        return breakdown

    def generate_final_report(self) -> dict[str, Any]:
        """Generate comprehensive final aggregated interview performance report."""
        if not self.turns:
            return {
                "total_questions": 0,
                "average_relevance": 0.0,
                "weakest_area": None,
                "strongest_area": None,
                "total_fillers": 0,
                "report_text": "No questions have been answered yet in this session.",
            }

        total_questions = len(self.turns)
        avg_relevance = self.get_average_relevance()
        weakest = self.get_weakest_area()
        strongest = self.get_strongest_area()
        total_fillers = sum(t["filler_count"] for t in self.turns)
        avg_fillers_per_turn = round(total_fillers / total_questions, 1)

        # Star compliance: percentage of turns with >= 75% STAR score
        star_compliant_turns = sum(1 for t in self.turns if t["star_score"] >= 75.0)
        star_rate = round((star_compliant_turns / total_questions) * 100, 1)

        category_breakdown = self.get_category_breakdown()

        # Build readable report markdown
        report_lines = [
            "# 🎯 InterviewIQ Final Assessment Report",
            f"**Total Questions Answered:** {total_questions} | **Average Relevance Score:** {avg_relevance}/100",
            f"**Total Filler Words:** {total_fillers} (avg {avg_fillers_per_turn}/turn) | **STAR Framework Mastery:** {star_rate}%",
            "",
            "## 📊 Key Highlights & Aggregations",
        ]

        if strongest:
            report_lines.append(
                f"1. **Strongest Area:** {strongest['category']} (Score: {strongest['relevance_score']}/100)\n"
                f"   - Question: *\"{strongest['question']}\"*"
            )

        if weakest:
            report_lines.append(
                f"2. **Weakest Area (Needs Focus):** {weakest['category']} (Score: {weakest['relevance_score']}/100)\n"
                f"   - Question: *\"{weakest['question']}\"*\n"
                f"   - Missing Concepts: {', '.join(weakest['unmatched_keywords'][:5]) if weakest['unmatched_keywords'] else 'None'}"
            )

        report_lines.append("\n## 📈 Category Breakdown")
        for cat, stats in category_breakdown.items():
            report_lines.append(
                f"- **{cat}**: {stats['count']} question(s) | Avg Relevance: {stats['avg_relevance']}/100 | Avg STAR: {stats['avg_star']}%"
            )

        report_lines.append("\n## 💡 Coach Recommendations")
        if avg_relevance >= 80:
            report_lines.append("- **Knowledge Depth**: Excellent domain grasp and comprehensive keyword coverage across responses.")
        elif avg_relevance >= 60:
            report_lines.append("- **Knowledge Depth**: Solid baseline; focus on articulating deeper architectural trade-offs and metrics.")
        else:
            report_lines.append("- **Knowledge Depth**: Review core concepts for lower-scoring questions, particularly in " + (weakest['category'] if weakest else 'all areas') + ".")

        if total_fillers > total_questions * 2:
            report_lines.append(f"- **Delivery**: High filler word frequency ({total_fillers} total). Practice deliberate pauses before speaking.")
        else:
            report_lines.append("- **Delivery**: Clean, articulate delivery with minimal filler words.")

        if star_rate < 75:
            report_lines.append("- **Structure**: Strengthen STAR structure on behavioral and problem-solving questions, particularly quantifiable Results.")
        else:
            report_lines.append("- **Structure**: Consistently strong STAR narrative covering Situation, Task, Action, and measurable Results.")

        report_text = "\n".join(report_lines)

        return {
            "total_questions": total_questions,
            "average_relevance": avg_relevance,
            "weakest_area": weakest,
            "strongest_area": strongest,
            "total_fillers": total_fillers,
            "star_compliance_rate": star_rate,
            "category_breakdown": category_breakdown,
            "report_text": report_text,
        }

    def reset(self) -> None:
        """Clear all session memory."""
        self.turns.clear()
        self.start_time = datetime.now().isoformat()


# Tool definitions for LLM tool calling (OpenAI function calling standard)
EVALUATOR_TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "detect_filler_words",
            "description": "Scans candidate answer for speech filler words/phrases like 'um', 'like', 'basically', 'you know' and returns exact counts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "answer": {"type": "string", "description": "The candidate's response text."}
                },
                "required": ["answer"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_star_structure",
            "description": "Evaluates whether the candidate's answer covers Situation, Task, Action, and Result components of the STAR framework.",
            "parameters": {
                "type": "object",
                "properties": {
                    "answer": {"type": "string", "description": "The candidate's response text."}
                },
                "required": ["answer"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "score_relevance",
            "description": "Scores technical and domain relevance (0-100) based on expected keywords and key concepts present in the answer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "answer": {"type": "string", "description": "The candidate's response text."},
                    "expected_keywords": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of expected concepts or keywords for this question."
                    }
                },
                "required": ["answer", "expected_keywords"]
            }
        }
    }
]


class EvaluatorAgent:
    """Tool-calling evaluator agent with session memory and meta-question coaching."""

    def __init__(self, memory: InterviewSessionMemory | None = None) -> None:
        self.memory = memory or InterviewSessionMemory()
        self.client = None
        self.provider = "none"
        self.model_name = os.getenv("MODEL_NAME", "").strip()

        # Check for API keys: Groq first, then OpenAI
        groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()

        if groq_api_key and groq_api_key != "your_groq_api_key_here":
            try:
                from groq import Groq
                self.client = Groq(api_key=groq_api_key)
                self.provider = "groq"
                if not self.model_name:
                    self.model_name = "llama-3.3-70b-versatile"
            except Exception as e:
                print(f"[EvaluatorAgent] Groq client initialization warning: {e}")

        if not self.client and openai_api_key and openai_api_key != "your_openai_api_key_here":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=openai_api_key)
                self.provider = "openai"
                if not self.model_name:
                    self.model_name = "gpt-4o-mini"
            except Exception as e:
                print(f"[EvaluatorAgent] OpenAI client initialization warning: {e}")

    def execute_tool(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Execute one of the registered evaluation tools."""
        if tool_name == "detect_filler_words":
            return detect_filler_words(arguments.get("answer", ""))
        elif tool_name == "check_star_structure":
            return check_star_structure(arguments.get("answer", ""))
        elif tool_name == "score_relevance":
            return score_relevance(
                arguments.get("answer", ""),
                arguments.get("expected_keywords", [])
            )
        else:
            return {"error": f"Unknown tool: {tool_name}"}

    def _generate_fallback_feedback(
        self,
        question_data: dict[str, Any],
        answer: str,
        filler_res: dict[str, Any],
        star_res: dict[str, Any],
        relevance_res: dict[str, Any],
    ) -> str:
        """Deterministic rule-based feedback generator for offline / fallback mode."""
        score = relevance_res.get("score", 0)
        category = question_data.get("category", "General")
        matched = relevance_res.get("matched_keywords", [])
        unmatched = relevance_res.get("unmatched_keywords", [])
        filler_count = filler_res.get("total_filler_count", 0)
        star_covered = star_res.get("covered_components", [])
        star_missing = star_res.get("missing_components", [])

        # Construct encouraging, constructive feedback
        feedback_parts = []

        if score >= 80:
            feedback_parts.append(
                f"🌟 **Outstanding response!** You demonstrated strong mastery of {category} concepts, "
                f"incorporating key terminology like *{', '.join(matched[:3])}*."
            )
        elif score >= 50:
            feedback_parts.append(
                f"👍 **Solid answer with good fundamentals.** You covered essential concepts like *{', '.join(matched[:2])}*, "
                f"but could elevate the response further by addressing *{', '.join(unmatched[:2])}*."
            )
        else:
            feedback_parts.append(
                f"💡 **Promising start, but needs more depth.** To make this {category} answer stand out, "
                f"make sure to explicitly discuss *{', '.join(unmatched[:3])}*."
            )

        # Structure feedback
        if star_res.get("is_star_complete", False):
            feedback_parts.append("Your structure was crisp and followed the STAR framework seamlessly.")
        elif star_missing:
            feedback_parts.append(f"Structure tip: Strengthen your **{', '.join(star_missing)}** section to provide a complete narrative.")

        # Filler feedback
        if filler_count > 2:
            fillers_list = list(filler_res.get("detected_fillers", {}).keys())
            feedback_parts.append(f"Watch out for speech crutches: noticed {filler_count} filler word(s) ({', '.join(fillers_list)}).")

        return " ".join(feedback_parts)

    def evaluate_answer(
        self,
        question_data: dict[str, Any],
        answer: str,
    ) -> dict[str, Any]:
        """Evaluate a candidate's answer using tools, generate feedback, and record turn.

        Args:
            question_data: Dictionary containing question id, category, question text, expected_keywords.
            answer: Candidate's response text.

        Returns:
            Dictionary containing feedback, tool outputs, and updated session metrics.
        """
        question = question_data.get("question", "")
        category = question_data.get("category", "General")
        expected_keywords = question_data.get("expected_keywords", [])
        question_id = question_data.get("id", 1)

        # Run tools directly (tools are deterministic and required for memory)
        filler_res = detect_filler_words(answer)
        star_res = check_star_structure(answer)
        relevance_res = score_relevance(answer, expected_keywords)
        tools_called = ["detect_filler_words", "check_star_structure", "score_relevance"]

        feedback = ""

        # If an LLM client is available, prompt the LLM with tool outputs for rich synthesis
        if self.client:
            try:
                system_prompt = (
                    "You are InterviewIQ, an empathetic and insightful AI mock-interview coach. "
                    "Given an interview question, candidate answer, and automated tool evaluation results, "
                    "produce a concise (2-4 sentences), encouraging, and actionable piece of feedback. "
                    "Highlight strong technical concepts, call out structural gaps (like missing STAR parts) "
                    "or filler words gently, and offer a concrete tip for improvement."
                )

                user_prompt = (
                    f"Question Category: {category}\n"
                    f"Question: {question}\n"
                    f"Candidate Answer: {answer}\n\n"
                    f"Tool Findings:\n"
                    f"- Relevance Score: {relevance_res.get('score')}/100 (Matched: {relevance_res.get('matched_keywords')}, Missing: {relevance_res.get('unmatched_keywords')[:4]})\n"
                    f"- STAR Structure: Covered {star_res.get('covered_components')}, Missing {star_res.get('missing_components')}\n"
                    f"- Filler Words: {filler_res.get('total_filler_count')} total ({filler_res.get('detected_fillers')})\n\n"
                    f"Provide short, encouraging, and constructive coaching feedback:"
                )

                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.7,
                    max_tokens=250,
                )
                feedback = response.choices[0].message.content.strip()
            except Exception as e:
                print(f"[EvaluatorAgent] LLM feedback call failed ({e}), falling back to rule-based feedback.")
                feedback = self._generate_fallback_feedback(question_data, answer, filler_res, star_res, relevance_res)
        else:
            feedback = self._generate_fallback_feedback(question_data, answer, filler_res, star_res, relevance_res)

        # Store into session memory
        turn = self.memory.add_turn(
            question_id=question_id,
            question=question,
            category=category,
            expected_keywords=expected_keywords,
            answer=answer,
            filler_evaluation=filler_res,
            star_evaluation=star_res,
            relevance_evaluation=relevance_res,
            tools_called=tools_called,
            feedback=feedback,
        )

        return {
            "turn": turn,
            "feedback": feedback,
            "filler_evaluation": filler_res,
            "star_evaluation": star_res,
            "relevance_evaluation": relevance_res,
            "session_avg_relevance": self.memory.get_average_relevance(),
            "total_questions_answered": self.memory.get_total_questions(),
        }

    def ask_agent(self, query: str) -> str:
        """Handle mid-session meta-questions about the candidate's overall progress.

        Examples:
        - "How am I doing so far?"
        - "What's my weakest area?"
        - "What should I improve on?"
        - "Which question had the lowest score?"

        Args:
            query: The candidate's question to the coach.

        Returns:
            A tailored, memory-aware coaching response.
        """
        if self.memory.get_total_questions() == 0:
            return "You haven't answered any questions yet in this session! Pick a question from the question bank to get started."

        total_q = self.memory.get_total_questions()
        avg_rel = self.memory.get_average_relevance()
        weakest = self.memory.get_weakest_area()
        strongest = self.memory.get_strongest_area()
        scorecard = self.memory.get_scorecard()

        # If LLM client is available, generate dynamic response with injected session state
        if self.client:
            try:
                system_prompt = (
                    "You are InterviewIQ, an expert mock-interview coach. The candidate is asking a mid-session meta-question "
                    "about their cumulative interview performance. Answer accurately using the provided session memory. "
                    "CRITICAL: When asked about their weakest area, you MUST name the question and category with the lowest relevance score, "
                    "NOT just the most recent question. Be supportive, concise, and give concrete advice."
                )

                context_summary = (
                    f"Session Memory Data:\n"
                    f"- Total Questions Answered: {total_q}\n"
                    f"- Cumulative Average Relevance Score: {avg_rel}/100\n"
                    f"- Weakest Area: Question #{weakest['turn_id']} in '{weakest['category']}' with score {weakest['relevance_score']}/100: \"{weakest['question']}\" (Missing concepts: {', '.join(weakest['unmatched_keywords'][:4])})\n"
                    f"- Strongest Area: Question #{strongest['turn_id']} in '{strongest['category']}' with score {strongest['relevance_score']}/100: \"{strongest['question']}\"\n"
                    f"- All Turns Summary: {json.dumps(scorecard)}\n\n"
                    f"Candidate Question: {query}"
                )

                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": context_summary},
                    ],
                    temperature=0.6,
                    max_tokens=300,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"[EvaluatorAgent] LLM meta-query failed ({e}), using memory fallback.")

        # Fallback deterministic meta-response using true session memory aggregations
        query_lower = query.lower()
        if any(w in query_lower for w in ["weak", "worst", "lowest", "struggle", "improve", "bad"]):
            missing = f" (Key missing concepts: {', '.join(weakest['unmatched_keywords'][:3])})" if weakest and weakest['unmatched_keywords'] else ""
            return (
                f"Based on your {total_q} answered question(s), your **weakest area** is **{weakest['category']}** "
                f"on Question #{weakest['turn_id']} (*\"{weakest['question']}\"*) with a relevance score of **{weakest['relevance_score']}/100**.{missing}\n\n"
                f"Your overall session average relevance is **{avg_rel}/100**. Focus on including more domain terminology and quantifiable results for {weakest['category']} questions!"
            )
        elif any(w in query_lower for w in ["strong", "best", "highest", "excel"]):
            return (
                f"Your **strongest performance** so far is in **{strongest['category']}** "
                f"on Question #{strongest['turn_id']} (*\"{strongest['question']}\"*) where you scored **{strongest['relevance_score']}/100**!\n\n"
                f"Your cumulative average across all {total_q} question(s) is **{avg_rel}/100**."
            )
        else:
            # General "how am I doing"
            return (
                f"So far across {total_q} question(s), you have an average relevance score of **{avg_rel}/100**.\n\n"
                f"1. **Strongest Area:** {strongest['category']} ({strongest['relevance_score']}/100)\n"
                f"2. **Weakest Area:** {weakest['category']} ({weakest['relevance_score']}/100 on \"{weakest['question'][:50]}...\")\n\n"
                f"Keep going! Make sure to maintain crisp STAR structure and keep filler words to a minimum."
            )
