"""Flask server for 06-ai-systems."""

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


mod_prompt = _load_service("01_prompting_strategies.py", "prompting_strategies")
mod_syco = _load_service("02_sycophancy_trap.py", "sycophancy_trap")
mod_refund = _load_service("03_refund_bench.py", "refund_bench")


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


@bp.route("/api/prompting-strategies", methods=["POST"])
def prompting_strategies_route():
    # ① Parse question, expected_answer, model, and temperature from JSON body
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or "").strip()
    expected = (data.get("expected_answer") or "").strip()
    model = data.get("model") or "gpt-4o-mini"
    temp = float(data.get("temperature", 0.7))
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        # ② Run Direct, Zero-Shot CoT, and Few-Shot CoT benchmark in 01_prompting_strategies.py
        res = mod_prompt.run_prompting_strategies(question, expected, model, temp)
        res["result"] = f"Benchmark evaluated across {len(res.get('strategies', []))} prompting strategies."
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/sycophancy-trap", methods=["POST"])
def sycophancy_trap_route():
    # ① Parse case_type, model, and temperature from JSON body
    data = request.get_json(force=True, silent=True) or {}
    case_type = data.get("case_type") or "Math Gaslight"
    model = data.get("model") or "gpt-4o-mini"
    temp = float(data.get("temperature", 0.7))
    try:
        # ② Run the multi-turn sycophancy trap evaluation in 02_sycophancy_trap.py
        res = mod_syco.run_sycophancy_trap(case_type, model, temp)
        res["result"] = f"Final Verdict: {res.get('final_verdict')}"
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/refund-bench", methods=["POST"])
def refund_bench_route():
    # ① Parse complaint_text, judge bench layout, and auto-approval cap from JSON body
    data = request.get_json(force=True, silent=True) or {}
    complaint_text = (data.get("complaint_text") or "").strip()
    bench = data.get("bench") or "mixed3"
    cap = float(data.get("cap", 2000.0))
    if not complaint_text:
        return jsonify({"error": "Complaint text cannot be empty"}), 400
    try:
        # ② Execute the 4-stage multi-judge dispute adjudication pipeline in 03_refund_bench.py
        res = mod_refund.run_refund_bench(complaint_text, bench, cap)
        res["result"] = (
            f"Approved Refund: ₹{res.get('total_approved_refund', 0):.0f} "
            f"| Held for Review: ₹{res.get('total_held_for_review', 0):.0f}"
        )
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
