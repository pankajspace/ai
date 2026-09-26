"""Flask server for AI Reliability Lab: four measured LLM reliability demos.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``. This lets us register the entire Blueprint under a runtime URL
  prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/",
  "/variance", etc. In production Nginx forwards ``/ai-reliability/...``
  traffic to the container and PATH_PREFIX is set to "/ai-reliability".
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML
  page can call the API even if it is served from a different origin during
  development.
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from config import TEMPERATURE_CHOICES
from cot import PROBLEMS, run_cot
from cot import STRATEGY_CHOICES as COT_STRATEGIES
from rate_limiter import check_rate_limit
from tool_errors import FAIL_ON_CALL_LABELS, PROMPT_CHOICES, run_error_injection
from tool_routing import DESCRIPTION_CHOICES, NAME_CHOICES, run_routing
from variance import STRATEGY_CHOICES as VARIANCE_STRATEGIES
from variance import run_variance

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# PATH_PREFIX is set by the deployment environment ("/ai-reliability") so
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


@bp.route("/info/<path:filename>")
def info(filename):
    """Serve the "how this demo works" explainer pages from src/info."""
    return app.send_static_file(os.path.join("info", filename))


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


@bp.route("/variance", methods=["POST"])
def variance_route():
    """Run Unconstrained vs Prompt-JSON vs Schema-enforced extraction on a review."""
    message = read_message()
    if not message:
        return jsonify({"error": "A customer review is required."}), 400
    strategy = read_choice("strategy", VARIANCE_STRATEGIES, "all")
    if strategy is None:
        return invalid_choice("strategy", VARIANCE_STRATEGIES)
    temperature = read_choice("temperature", TEMPERATURE_CHOICES, "0.7")
    if temperature is None:
        return invalid_choice("temperature", TEMPERATURE_CHOICES)
    try:
        return jsonify({"result": run_variance(message, strategy, TEMPERATURE_CHOICES[temperature])})
    except Exception:
        app.logger.exception("variance failed")
        return jsonify({"error": "Variance test failed. Please try again later."}), 500


@bp.route("/cot", methods=["POST"])
def cot_route():
    """Run Direct vs Chain-of-Thought prompting on one preset problem."""
    message = read_message().lower()
    if not message:
        return jsonify({"error": "A problem name is required."}), 400
    if message not in PROBLEMS:
        return jsonify({"error": f"Unknown problem. Choose one of: {', '.join(PROBLEMS)}."}), 400
    strategy = read_choice("strategy", COT_STRATEGIES, "both")
    if strategy is None:
        return invalid_choice("strategy", COT_STRATEGIES)
    temperature = read_choice("temperature", TEMPERATURE_CHOICES, "0.7")
    if temperature is None:
        return invalid_choice("temperature", TEMPERATURE_CHOICES)
    try:
        return jsonify({"result": run_cot(message, strategy, TEMPERATURE_CHOICES[temperature])})
    except Exception:
        app.logger.exception("cot failed")
        return jsonify({"error": "CoT comparison failed. Please try again later."}), 500


@bp.route("/routing", methods=["POST"])
def routing_route():
    """Route a weather question under the names x descriptions 2x2."""
    message = read_message()
    if not message:
        return jsonify({"error": "A weather question is required."}), 400
    names = read_choice("names", NAME_CHOICES, "both")
    if names is None:
        return invalid_choice("names", NAME_CHOICES)
    descriptions = read_choice("descriptions", DESCRIPTION_CHOICES, "both")
    if descriptions is None:
        return invalid_choice("descriptions", DESCRIPTION_CHOICES)
    try:
        return jsonify({"result": run_routing(message, names, descriptions)})
    except Exception:
        app.logger.exception("routing failed")
        return jsonify({"error": "Routing test failed. Please try again later."}), 500


@bp.route("/errors", methods=["POST"])
def errors_route():
    """Run the tool-error injection scenarios on a weather question."""
    message = read_message()
    if not message:
        return jsonify({"error": "A weather question is required."}), 400
    prompt = read_choice("prompt", PROMPT_CHOICES, "both")
    if prompt is None:
        return invalid_choice("prompt", PROMPT_CHOICES)
    fail_choices = [str(k) for k in FAIL_ON_CALL_LABELS]
    fail_on_call = read_choice("fail_on_call", fail_choices, "2")
    if fail_on_call is None:
        return invalid_choice("fail_on_call", fail_choices)
    try:
        return jsonify({"result": run_error_injection(message, prompt, int(fail_on_call))})
    except Exception:
        app.logger.exception("error injection failed")
        return jsonify({"error": "Error-injection test failed. Please try again later."}), 500


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

# Register all Blueprint routes under the optional path prefix. This single
# line is the only place where PATH_PREFIX is applied — every route above is
# written as a relative path (e.g. "/variance") and the prefix is prepended here.
app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    # Run the development server. 0.0.0.0 makes the app reachable from outside
    # the container; port 5000 is mapped to the host port in docker-compose.yml.
    app.run(host="0.0.0.0", port=5000)
