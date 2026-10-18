"""Flask server for 07-ai-reliability."""

import importlib.util
import os
import sys
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS
from rate_limiter import check_rate_limit

load_dotenv(find_dotenv())

PATH_PREFIX = os.environ.get("PATH_PREFIX", "")
STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))
CORS(app)

bp = Blueprint("main", __name__)

_CUR_DIR = Path(__file__).resolve().parent


def _load_service(filename: str, alias: str):
    # ① Resolve the numbered service file path and create its import spec
    file_path = _CUR_DIR / filename
    spec = importlib.util.spec_from_file_location(f"services.{alias}", file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module from {file_path}")
    # ② Register and execute the module so its functions can be called by routes
    mod = importlib.util.module_from_spec(spec)
    sys.modules[f"services.{alias}"] = mod
    spec.loader.exec_module(mod)
    return mod


mod_cot = _load_service("01_cot_vs_direct.py", "cot_vs_direct")
mod_var = _load_service("02_variance_determinism.py", "variance_determinism")
mod_calib = _load_service("03_tool_schema_calibration.py", "tool_schema_calibration")
mod_err = _load_service("04_tool_error_injection.py", "tool_error_injection")


@bp.before_request
def enforce_rate_limit():
    # ① Only rate-limit mutating POST requests
    if request.method == "POST":
        # ② Check whether this client has exceeded 30 requests per hour
        blocked, msg, retry_after = check_rate_limit(
            request, max_requests=30, window_seconds=3600
        )
        if blocked:
            # ③ Return HTTP 429 with Retry-After header when rate-limited
            resp = jsonify({"error": msg})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp


@bp.route("/")
def index():
    # ① Read index.html and inject the runtime PATH_PREFIX into data-api-base
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    html = html.replace('data-api-base=""', f'data-api-base="{PATH_PREFIX}"')
    # ② Return the patched HTML page
    return app.response_class(html, mimetype="text/html")


@bp.route("/css/<path:filename>")
def css(filename):
    return app.send_static_file(os.path.join("css", filename))


@bp.route("/js/<path:filename>")
def js(filename):
    return app.send_static_file(os.path.join("js", filename))


@bp.route("/explanation/<path:filename>")
@bp.route("/info/<path:filename>")
def explanation_pages(filename):
    return app.send_static_file(os.path.join("explanation", filename))


@bp.route("/theory/<path:filename>")
def theory_pages(filename):
    """Serve the theory documentation pages from src/theory."""
    return app.send_static_file(os.path.join("theory", filename))


@bp.route("/api/cot-vs-direct", methods=["POST"])
def cot_vs_direct_route():
    # ① Parse problem_title from the JSON request body
    data = request.get_json(force=True, silent=True) or {}
    problem_title = data.get("problem_title") or "Spatial Navigation (Grid)"
    try:
        # ② Run Direct vs Chain-of-Thought benchmark in 01_cot_vs_direct.py
        res = mod_cot.run_cot_vs_direct_benchmark(problem_title)
        res["result"] = f"Direct: {'Correct' if res['direct_result']['is_correct'] else 'Failed'} | CoT: {'Correct' if res['cot_result']['is_correct'] else 'Failed'}"
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/variance-determinism", methods=["POST"])
def variance_determinism_route():
    # ① Parse review_text from the JSON request body and reject empty strings
    data = request.get_json(force=True, silent=True) or {}
    review_text = (data.get("review_text") or data.get("message") or "").strip()
    if not review_text:
        return jsonify({"error": "Review text cannot be empty"}), 400
    try:
        # ② Run the 3-strategy JSON determinism benchmark in 02_variance_determinism.py
        res = mod_var.run_variance_determinism_benchmark(review_text)
        res["result"] = f"Tested {len(res.get('strategies', []))} JSON extraction strategies."
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/tool-schema-calibration", methods=["POST"])
def tool_schema_calibration_route():
    # ① Parse query from the JSON request body and reject empty strings
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        # ② Run the 2x2 tool schema calibration matrix in 03_tool_schema_calibration.py
        res = mod_calib.run_tool_schema_calibration(query)
        res["result"] = res.get("analysis_summary", "Calibration complete.")
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/tool-error-injection", methods=["POST"])
def tool_error_injection_route():
    # ① Parse question from the JSON request body and reject empty strings
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or data.get("message") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        # ② Run the upstream 503 error injection benchmark in 04_tool_error_injection.py
        res = mod_err.run_tool_error_injection(question)
        res["result"] = f"Evaluated error handling across {len(res.get('scenarios', []))} prompt configurations."
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
