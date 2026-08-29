# agent.py -- INSTRUCTOR REFERENCE (fully implemented)
# ============================================================
#  InterviewIQ -- the Agent
#  Tool-calling loop (Class 2) + provider switch (Class 3),
#  extended with:
#    - structured (dict) tool results, aggregated into a report
#    - session memory across turns
#    - a free-form entry point (ask_agent) for meta-questions
#      like "how am I doing so far?" -- this is what
#      memory_check.py exercises.
# ============================================================

import os, json
from dotenv import load_dotenv, find_dotenv
from openai import OpenAI, BadRequestError
from tools import detect_filler_words, check_star_structure, score_relevance

load_dotenv(find_dotenv(), override=True)

# ---- Provider switch (same idea as Class 3) --------------------------------
PROVIDER = "groq"   # "groq" (free) or "openai"

if PROVIDER == "groq":
    MODEL = "openai/gpt-oss-20b"
    client = OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
else:
    MODEL = "gpt-4o-mini"
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---- Session memory: a running scorecard for this interview ---------------
# each entry: {"question": ..., "answer": ..., "results": {tool_name: dict}}
session_log = []

# ---- Tool schema (the "menu" the model reads) ------------------------------
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "detect_filler_words",
            "description": "Count filler words (um, like, basically, etc.) in a candidate's answer.",
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
            "description": "Check whether a behavioral answer covers Situation, Task, Action, Result.",
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
            "description": "Score how many expected keywords/concepts for the question appear in the answer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "answer": {"type": "string"},
                    "expected_keywords": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["answer", "expected_keywords"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_final_report",
            "description": "Summarise the whole interview session so far, including the weakest area. Call this whenever the candidate asks how they're doing, what their weakest area is, or for an overall report -- at any point in the session, not only at the end.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]


def generate_final_report(_args=None):
    """Aggregate session_log into a report: per-question notes + the weakest area."""
    if not session_log:
        return "No answers scored yet."

    lines = [f"Interview Report -- {len(session_log)} question(s) answered so far\n"]
    relevance_scores = []   # (score, question) so we can find the weakest one
    total_fillers = 0

    for i, entry in enumerate(session_log, 1):
        results = entry["results"]
        lines.append(f"Q{i}: {entry['question']}")

        if "detect_filler_words" in results:
            r = results["detect_filler_words"]
            total_fillers += r["total"]
            lines.append(f"   - Filler words: {r['total']} ({r['verdict']})")

        if "check_star_structure" in results:
            r = results["check_star_structure"]
            star_note = "all stages present" if r["all_present"] else f"missing {', '.join(r['missing'])}"
            lines.append(f"   - STAR structure: {star_note}")

        if "score_relevance" in results:
            r = results["score_relevance"]
            relevance_scores.append((r["score"], entry["question"]))
            lines.append(f"   - Relevance: {r['score']}/100 (missed: {r['missed'] or 'none'})")

    if relevance_scores:
        avg = round(sum(s for s, _ in relevance_scores) / len(relevance_scores))
        weakest_score, weakest_q = min(relevance_scores, key=lambda pair: pair[0])
        lines.append(f"\nAverage relevance score: {avg}/100")
        lines.append(f"Weakest area: \"{weakest_q}\" (relevance {weakest_score}/100)")

    lines.append(f"Total filler words across the session: {total_fillers}")
    return "\n".join(lines)


TOOL_FUNCTIONS = {
    "detect_filler_words": lambda args: detect_filler_words(args["answer"]),
    "check_star_structure": lambda args: check_star_structure(args["answer"]),
    "score_relevance": lambda args: score_relevance(args["answer"], args["expected_keywords"]),
    "generate_final_report": generate_final_report,
}

SYSTEM_PROMPT = """You are InterviewIQ, an AI mock-interview coach.
For every candidate answer, call the relevant evaluation tools
(filler words, STAR structure, relevance) before giving feedback.
Keep feedback short, specific, and encouraging.
If the candidate asks how they're doing, what their weakest area is,
or for an overall report -- at any point in the session -- call
generate_final_report and answer using what it returns."""


MAX_TOOL_ROUNDS = 5
MAX_GLITCH_RETRIES = 3


def _create_with_retry(**kwargs):
    """client.chat.completions.create, retried on Groq's gpt-oss-20b
    tool-name glitch (it occasionally leaks a harmony format token into
    the tool name, e.g. "score_relevance<|channel|>commentary", which
    Groq rejects as an unknown tool). Regenerating almost always fixes it,
    since the glitch is non-deterministic sampling noise, not a request
    problem.
    """
    last_error = None
    for _ in range(MAX_GLITCH_RETRIES):
        try:
            return client.chat.completions.create(**kwargs)
        except BadRequestError as e:
            if getattr(e, "code", None) != "tool_use_failed":
                raise
            last_error = e
    raise last_error


def _run_loop(messages, results_out=None):
    """Shared tool-calling loop: send messages, run any requested tools,
    send the results back, return the model's final reply text.
    If `results_out` (a dict) is passed, tool results are also recorded
    into it by tool name -- used by run_turn() to build a session_log entry.

    gpt-oss-20b (via Groq) tends to call one tool per round rather than
    all at once, so this keeps offering tools (tool_choice="auto") across
    several rounds until the model stops calling them -- forcing
    tool_choice="none" too early makes Groq error out with
    "Tool choice is none, but model called a tool" when the model still
    wants another round.
    """
    for _ in range(MAX_TOOL_ROUNDS):
        response = _create_with_retry(
            model=MODEL, messages=messages, tools=TOOLS_SCHEMA, tool_choice="auto"
        )
        msg = response.choices[0].message

        if not msg.tool_calls:
            return msg.content

        messages.append(msg)
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments) if call.function.arguments else {}
            fn = TOOL_FUNCTIONS[call.function.name]
            result = fn(args)   # dict (or a string, for generate_final_report)
            if results_out is not None and call.function.name != "generate_final_report":
                results_out[call.function.name] = result
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": result if isinstance(result, str) else json.dumps(result),
            })

    # Ran out of rounds -- ask for a final answer without offering tools.
    response = _create_with_retry(model=MODEL, messages=messages)
    return response.choices[0].message.content


def run_turn(question: str, answer: str, expected_keywords: list):
    """One interview turn: candidate answers `question`; agent evaluates it
    and the turn is recorded into session_log."""
    user_msg = (
        f"Question: {question}\n"
        f"Candidate's answer: {answer}\n"
        f"Expected keywords for this question: {expected_keywords}\n"
        f"Evaluate this answer using the available tools, then give short feedback."
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]

    results = {}
    feedback = _run_loop(messages, results_out=results)
    session_log.append({"question": question, "answer": answer, "results": results})
    return feedback


def ask_agent(user_message: str):
    """Free-form entry point for meta-questions ("how am I doing so far?",
    "what's my weakest area?") that aren't tied to a specific interview_bank
    question. Uses the same tools and the same session_log."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]
    return _run_loop(messages)


def ask_for_final_report():
    """A direct call the CLI/UI can use at the end of the mock interview."""
    return generate_final_report()
