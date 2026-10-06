"""Flask server for MCP & Evals Lab: MCP plumbing, a tool-calling agent, and evals.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``. This lets us register the entire Blueprint under a runtime URL
  prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/",
  "/plumbing", etc. In production Nginx forwards ``/mcp-evals/...`` traffic to
  the container and PATH_PREFIX is set to "/mcp-evals".
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML
  page can call the API even if it is served from a different origin during
  development.
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from agent import TOOLS_CHOICES, run_agent_report
from config import TEMPERATURE_CHOICES
from evals import AGENT_CHOICES, CASE_CHOICES, run_evals
from mcp_client import TOOL_CHOICES, run_plumbing
from rate_limiter import check_rate_limit

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# PATH_PREFIX is set by the deployment environment ("/mcp-evals") so
# the app works correctly behind an Nginx location block. Locally it is an
# empty string, which mounts all routes at the root.
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

# app.py lives in src/python, while index.html, css/, and js/ live in src/.
STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))

# Allow cross-origin requests from any origin. In production you would
# restrict this to the specific front-end domain.
CORS(app)

# A Blueprint groups related routes. We register it once at the bottom with
# the runtime PATH_PREFIX, avoiding any hardcoded path strings in the routes.
bp = Blueprint("main", __name__)


@bp.before_request
def enforce_rate_limit():
    """Enforce strict 10 requests per hour limit on all POST endpoints."""
    if request.method == "POST":
        blocked, msg, retry_after = check_rate_limit(
            request, max_requests=10, window_seconds=3600
        )
        if blocked:
            resp = jsonify({"error": msg})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@bp.route("/")
def index():
    """Serve index.html, injecting the correct API base URL for the environment."""
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    # The HTML file ships with 'data-api-base=""' (empty = relative URL, works
    # locally). For production we replace it with the actual path prefix so
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


def read_message() -> str:
    """Return the trimmed ``message`` field from the JSON body, or ''."""
    data = request.get_json(force=True, silent=True) or {}
    return str(data.get("message") or "").strip()


def read_choice(name: str, allowed, default: str) -> str | None:
    """Return a dropdown value from the JSON body, ``default`` if absent, or None if not allowed."""
    data = request.get_json(force=True, silent=True) or {}
    value = str(data.get(name) or default)
    return value if value in allowed else None


def invalid_choice(name: str, allowed):
    return jsonify({"error": f"Invalid {name}. Choose one of: {', '.join(map(str, allowed))}."}), 400


def feature_error(name: str, exc: Exception):
    """Log the failure; surface only the safe missing-key message to the browser."""
    app.logger.exception("%s failed", name)
    if isinstance(exc, RuntimeError) and "GROQ_API_KEY" in str(exc):
        return jsonify({"error": str(exc)}), 500
    return jsonify({"error": f"{name} failed. Please try again later."}), 500


@bp.route("/plumbing", methods=["POST"])
def plumbing_route():
    """Step 1: handshake -> tools/list -> tools/call on the MCP server, no LLM.

    Body: ``{"message": "<tool argument>", "tool": "get_live_score" | "get_player_stats"}``
    """
    # ① validate the tool argument (team names or player name)
    message = read_message()[:100]
    if not message:
        return jsonify({"error": "A tool argument (teams or player name) is required."}), 400
    # ② validate the selected tool against the server's tool names
    tool = read_choice("tool", TOOL_CHOICES, "get_live_score")
    if tool is None:
        return invalid_choice("tool", TOOL_CHOICES)
    try:
        # ③ run the MCP plumbing and return its text report
        return jsonify({"result": run_plumbing(message, tool)})
    except Exception as exc:
        return feature_error("MCP plumbing", exc)


@bp.route("/agent", methods=["POST"])
def agent_route():
    """Step 2: the LLM picks the MCP tool and its arguments; our code calls it.

    Body: ``{"message": "<question>", "tools": "on" | "off" | "both", "temperature": "0" | "0.7" | "1.2"}``
    """
    # ① validate the question
    message = read_message()[:300]
    if not message:
        return jsonify({"error": "A cricket question is required."}), 400
    # ② validate the tools mode and temperature
    tools = read_choice("tools", TOOLS_CHOICES, "on")
    if tools is None:
        return invalid_choice("tools", TOOLS_CHOICES)
    temperature = read_choice("temperature", TEMPERATURE_CHOICES, "0")
    if temperature is None:
        return invalid_choice("temperature", TEMPERATURE_CHOICES)
    try:
        # ③ run the agent loop and return its step-by-step log
        return jsonify({"result": run_agent_report(message, tools, TEMPERATURE_CHOICES[temperature])})
    except Exception as exc:
        return feature_error("Cricket agent", exc)


@bp.route("/evals", methods=["POST"])
def evals_route():
    """Step 3: run the eval suite (tool check + answer check) and report a score.

    Body: ``{"message": "all" | "1".."5", "agent": "on" | "off" | "both", "temperature": "0" | "0.7" | "1.2"}``
    """
    # ① validate the selected test case (the card's preset input)
    case = read_message()
    if not case:
        return jsonify({"error": "Choose a test case."}), 400
    if case not in CASE_CHOICES:
        return invalid_choice("test case", CASE_CHOICES)
    # ② validate the agent mode and temperature
    agent = read_choice("agent", AGENT_CHOICES, "on")
    if agent is None:
        return invalid_choice("agent", AGENT_CHOICES)
    temperature = read_choice("temperature", TEMPERATURE_CHOICES, "0")
    if temperature is None:
        return invalid_choice("temperature", TEMPERATURE_CHOICES)
    try:
        # ③ run the suite in parallel and return the graded report
        return jsonify({"result": run_evals(case, agent, TEMPERATURE_CHOICES[temperature])})
    except Exception as exc:
        return feature_error("Eval suite", exc)


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

# Register all Blueprint routes under the optional path prefix. This single
# line is the only place where PATH_PREFIX is applied — every route above is
# written as a relative path (e.g. "/plumbing") and the prefix is prepended here.
app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    # Run the development server. 0.0.0.0 makes the app reachable from outside
    # the container; port 5000 is mapped to the host port in docker-compose.yml.
    app.run(host="0.0.0.0", port=5000)
