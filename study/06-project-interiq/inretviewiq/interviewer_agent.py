"""Interviewer Agent for Multi-Agent InterviewIQ (Bonus Component).

The Interviewer Agent is a specialized agent responsible for:
1. Analyzing candidate performance history from session memory.
2. Dynamically determining the next competency/category to assess (e.g. probing weak areas or untested categories).
3. Selecting the next question from the question bank with conversational interviewer remarks.
"""

from __future__ import annotations

import os
from typing import Any

from agent import InterviewSessionMemory
from interview_bank import QUESTIONS, get_all_questions, get_question_categories


class InterviewerAgent:
    """Interviewer Agent that selects adaptive questions based on candidate performance."""

    def __init__(self, memory: InterviewSessionMemory | None = None) -> None:
        self.memory = memory or InterviewSessionMemory()
        self.client = None
        self.provider = "none"
        self.model_name = os.getenv("MODEL_NAME", "").strip()

        groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()

        if groq_api_key and groq_api_key != "your_groq_api_key_here":
            try:
                from groq import Groq
                self.client = Groq(api_key=groq_api_key)
                self.provider = "groq"
                if not self.model_name:
                    self.model_name = "llama-3.3-70b-versatile"
            except Exception:
                pass

        if not self.client and openai_api_key and openai_api_key != "your_openai_api_key_here":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=openai_api_key)
                self.provider = "openai"
                if not self.model_name:
                    self.model_name = "gpt-4o-mini"
            except Exception:
                pass

    def select_next_question(self, answered_question_ids: set[int] | None = None) -> tuple[dict[str, Any] | None, str]:
        """Select the next best question from the question bank.

        Strategy:
        1. If some categories have not been assessed yet, prioritize the first unassessed category.
        2. If all categories have at least one answer, check if there is a weak category (<50 score) and probe it.
        3. If all available questions have been answered, return None.

        Returns:
            Tuple of (question_dict, interviewer_introductory_remark)
        """
        all_q = get_all_questions()
        if answered_question_ids is None:
            answered_question_ids = set(t["question_id"] for t in self.memory.turns)

        available_questions = [q for q in all_q if q["id"] not in answered_question_ids]
        if not available_questions:
            return None, "We have completed all questions in the question bank for this interview!"

        # Determine answered categories and performance
        answered_cats = {t["category"] for t in self.memory.turns}
        all_cats = get_question_categories()
        unanswered_cats = [c for c in all_cats if c not in answered_cats]

        # Prioritize questions in unanswered categories first
        selected_q = None
        if unanswered_cats:
            target_cat = unanswered_cats[0]
            for q in available_questions:
                if q["category"] == target_cat:
                    selected_q = q
                    break

        # If no unanswered categories or none matched, check weak areas
        if not selected_q:
            weakest = self.memory.get_weakest_area()
            if weakest:
                weak_cat = weakest["category"]
                for q in available_questions:
                    if q["category"] == weak_cat:
                        selected_q = q
                        break

        # Default to first available question
        if not selected_q:
            selected_q = available_questions[0]

        # Generate contextual interviewer opening remark
        if self.memory.get_total_questions() == 0:
            intro = f"Welcome! Let's start with a {selected_q['category']} question."
        else:
            last_turn = self.memory.turns[-1]
            intro = (
                f"Thank you for that response. Next, I would like to assess your "
                f"experience with **{selected_q['category']}**."
            )

        return selected_q, intro
