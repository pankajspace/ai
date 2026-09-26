"""Flask server for AI Systems Lab: Prompting Benchmark, Sycophancy Trap, and The Refund Bench.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) registered with ``PATH_PREFIX``.
- Rate limiting enforces 10 POST requests per hour per IP.
- Endpoints return JSON with ``result`` payload for frontend consumption.
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from config import TEMPERATURE_CHOICES
from prompt_benchmark import STRATEGY_CHOICES, run_benchmark_for_question
from rate_limiter import check_rate_limit
from refund_bench import BENCH_CHOICES, CAP_CHOICES, adjudicate_dispute
from sycophancy import PUSHBACK_CHOICES, run_sycophancy_test

PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))
CORS(app)

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


@bp.after_request
def add_no_cache_headers(response):
    """Disable client-side caching for HTML, CSS, and JS to prevent stale UI."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@bp.route("/")
def index():
    """Serve index.html, injecting the correct API base URL for the environment."""
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
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


def read_choice(data: dict, name: str, allowed, default: str):
    """Return a dropdown value, ``default`` if absent, or None if it is not allowed."""
    value = str(data.get(name) or default)
    return value if value in allowed else None


def invalid_choice(name: str, allowed):
    return jsonify({"error": f"Invalid {name}. Choose one of: {', '.join(allowed)}."}), 400


@bp.route("/benchmark", methods=["POST"])
def benchmark_route():
    """Run Prompting Strategy Benchmark (Direct vs Zero-Shot CoT vs Few-Shot CoT)."""
    data = request.get_json(force=True) or {}
    message = (data.get("message") or data.get("question") or "").strip()
    if not message:
        return jsonify({"error": "A question is required."}), 400
    strategy = read_choice(data, "strategy", STRATEGY_CHOICES, "all")
    if strategy is None:
        return invalid_choice("strategy", STRATEGY_CHOICES)
    temperature = read_choice(data, "temperature", TEMPERATURE_CHOICES, "0.7")
    if temperature is None:
        return invalid_choice("temperature", TEMPERATURE_CHOICES)

    model_choice = data.get("model")
    try:
        results = run_benchmark_for_question(
            message,
            model_choice=model_choice,
            strategy=strategy,
            temperature=TEMPERATURE_CHOICES[temperature],
        )
        return jsonify({"result": results})
    except Exception as e:
        return jsonify({"error": f"Benchmark evaluation failed: {str(e)}"}), 500


@bp.route("/sycophancy", methods=["POST"])
def sycophancy_route():
    """Run the escalating pushback sycophancy evaluation."""
    data = request.get_json(force=True) or {}
    message = (data.get("message") or data.get("case_id") or "").strip()
    if not message:
        return jsonify({"error": "A test case ID or question is required."}), 400
    pushbacks = read_choice(data, "pushbacks", PUSHBACK_CHOICES, "3")
    if pushbacks is None:
        return invalid_choice("pushbacks", PUSHBACK_CHOICES)
    temperature = read_choice(data, "temperature", TEMPERATURE_CHOICES, "0.7")
    if temperature is None:
        return invalid_choice("temperature", TEMPERATURE_CHOICES)

    model_choice = data.get("model")
    try:
        results = run_sycophancy_test(
            message,
            model_choice=model_choice,
            pushbacks=int(pushbacks),
            temperature=TEMPERATURE_CHOICES[temperature],
        )
        return jsonify({"result": results})
    except Exception as e:
        return jsonify({"error": f"Sycophancy test failed: {str(e)}"}), 500


@bp.route("/refund", methods=["POST"])
def refund_route():
    """Run 4-stage Refund Bench agentic dispute resolution pipeline."""
    data = request.get_json(force=True) or {}
    message = (data.get("message") or data.get("complaint") or "").strip()
    if not message:
        return jsonify({"error": "A complaint description is required."}), 400
    bench = read_choice(data, "bench", BENCH_CHOICES, "mixed3")
    if bench is None:
        return invalid_choice("bench", BENCH_CHOICES)
    cap = read_choice(data, "cap", CAP_CHOICES, "2000")
    if cap is None:
        return invalid_choice("cap", CAP_CHOICES)

    try:
        results = adjudicate_dispute(message, bench=bench, cap=CAP_CHOICES[cap])
        return jsonify({"result": results})
    except Exception as e:
        return jsonify({"error": f"Refund adjudication failed: {str(e)}"}), 500


# ---------------------------------------------------------------------------
# Blueprint registration & entry point
# ---------------------------------------------------------------------------

app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
