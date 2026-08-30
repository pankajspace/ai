"""Flask server exposing InterviewIQ evaluation endpoints.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``.  This lets us register the entire Blueprint under a runtime URL
  prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/", "/evaluate",
  etc.  In production Nginx forwards ``/interviewiq/...`` traffic to the
  container and PATH_PREFIX is set to "/interviewiq", keeping every URL
  consistent.
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML
  page can call the API even if it is served from a different origin during
  development.
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from agent import EvaluatorAgent, InterviewSessionMemory
from interview_bank import get_all_questions, get_question_by_id

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# PATH_PREFIX is set by the deployment environment (e.g. "/interviewiq") so
# the app works correctly behind an Nginx location block.  Locally it is an
# empty string, which mounts all routes at the root.
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

# app.py lives in src/python, while index.html, css/, and js/ live in src/.
STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))

# Allow cross-origin requests from any origin.  In production you would
# restrict this to the specific front-end domain.
CORS(app)

# A Blueprint groups related routes.  We register it once at the bottom with
# the runtime PATH_PREFIX, avoiding any hardcoded path strings in the routes.
bp = Blueprint("main", __name__)

# Shared session memory and evaluator agent (single-process, not multi-user).
_memory = InterviewSessionMemory()
_agent = EvaluatorAgent(memory=_memory)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@bp.route("/")
def index():
    """Serve index.html, injecting the correct API base URL for the environment."""
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    # The HTML file ships with 'data-api-base=""' (empty = relative URL, works
    # locally).  For production we replace it with the actual path prefix so
    # all fetch() calls in the browser target the right endpoint.
    html = html.replace('data-api-base=""', f'data-api-base="{PATH_PREFIX}"')
    return app.response_class(html, mimetype="text/html")


@bp.route("/css/<path:filename>")
def css(filename):
    """Serve stylesheets from the src/css directory."""
    return app.send_static_file(os.path.join("css", filename))


@bp.route("/js/<path:filename>")
def js(filename):
    """Serve scripts from the src/js directory."""
    return app.send_static_file(os.path.join("js", filename))


@bp.route("/questions", methods=["GET"])
def questions():
    """Return all interview questions from the bank.

    Response (JSON): ``[{"id": 1, "category": "...", "question": "...", ...}, ...]``
    """
    return jsonify(get_all_questions())


@bp.route("/evaluate", methods=["POST"])
def evaluate():
    """Evaluate a candidate's answer to an interview question.

    Request body (JSON): ``{"question_id": 1, "answer": "..."}``
    Response (JSON): ``{"turn": 1, "feedback": "...", "relevance_evaluation": {...},
        "star_evaluation": {...}, "filler_evaluation": {...}}``
    """
    data = request.get_json(force=True)
    question_id = data.get("question_id")
    answer = (data.get("answer") or "").strip()

    if not answer:
        return jsonify({"error": "An answer is required."}), 400

    q = get_question_by_id(question_id)
    if not q:
        return jsonify({"error": f"Question ID {question_id} not found."}), 400

    try:
        result = _agent.evaluate_answer(q, answer)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/coach", methods=["POST"])
def coach():
    """Handle a free-form meta-question from the candidate.

    Request body (JSON): ``{"query": "How am I doing?"}``
    Response (JSON): ``{"response": "..."}``
    """
    data = request.get_json(force=True)
    message = (data.get("query") or data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "A question is required."}), 400

    try:
        reply = _agent.ask_agent(message)
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/scorecard", methods=["GET"])
def scorecard():
    """Return live session scorecard and running average.

    Response (JSON): ``{"scorecard": [...], "average_relevance": 75.5,
        "total_questions": 3, "weakest_area": {...}}``
    """
    return jsonify({
        "scorecard": _memory.get_scorecard(),
        "average_relevance": _memory.get_average_relevance(),
        "total_questions": _memory.get_total_questions(),
        "weakest_area": _memory.get_weakest_area(),
    })


@bp.route("/report", methods=["GET"])
def report():
    """Generate the aggregated final assessment report.

    Response (JSON): ``{"report_text": "...", "total_questions": 3, ...}``
    """
    try:
        return jsonify(_memory.generate_final_report_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/reset", methods=["POST"])
def reset():
    """Clear session memory and start a fresh interview.

    Response (JSON): ``{"status": "ok", "message": "Session reset successfully."}``
    """
    _agent.reset()
    return jsonify({"status": "ok", "message": "Session reset successfully."})


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

# Register all Blueprint routes under the optional path prefix.  This single
# line is the only place where PATH_PREFIX is applied — every route above is
# written as a relative path (e.g. "/evaluate") and the prefix is prepended.
app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    # Run the development server.  0.0.0.0 makes the app reachable from
    # outside the container; port 5000 is mapped to host port 8085 by
    # docker-compose.yml.
    app.run(host="0.0.0.0", port=5000)
