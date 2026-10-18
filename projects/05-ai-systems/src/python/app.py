"""Flask server for 05-ai-systems."""

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
    file_path = _CUR_DIR / filename
    spec = importlib.util.spec_from_file_location(f"services.{alias}", file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module from {file_path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[f"services.{alias}"] = mod
    spec.loader.exec_module(mod)
    return mod


mod_prompt = _load_service("01_prompting_strategies.py", "prompting_strategies")
mod_syco = _load_service("02_sycophancy_trap.py", "sycophancy_trap")
mod_refund = _load_service("03_refund_bench.py", "refund_bench")


@bp.before_request
def enforce_rate_limit():
    if request.method == "POST":
        blocked, msg, retry_after = check_rate_limit(
            request, max_requests=30, window_seconds=3600
        )
        if blocked:
            resp = jsonify({"error": msg})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp


@bp.route("/")
def index():
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    html = html.replace('data-api-base=""', f'data-api-base="{PATH_PREFIX}"')
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
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or "").strip()
    expected = (data.get("expected_answer") or "").strip()
    model = data.get("model") or "gpt-4o-mini"
    temp = float(data.get("temperature", 0.7))
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        res = mod_prompt.run_prompting_strategies(question, expected, model, temp)
        res["result"] = f"Benchmark evaluated across {len(res.get('strategies', []))} prompting strategies."
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/sycophancy-trap", methods=["POST"])
def sycophancy_trap_route():
    data = request.get_json(force=True, silent=True) or {}
    case_type = data.get("case_type") or "Math Gaslight"
    model = data.get("model") or "gpt-4o-mini"
    temp = float(data.get("temperature", 0.7))
    try:
        res = mod_syco.run_sycophancy_trap(case_type, model, temp)
        res["result"] = f"Final Verdict: {res.get('final_verdict')}"
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/refund-bench", methods=["POST"])
def refund_bench_route():
    data = request.get_json(force=True, silent=True) or {}
    complaint_text = (data.get("complaint_text") or "").strip()
    bench = data.get("bench") or "mixed3"
    cap = float(data.get("cap", 50.0))
    if not complaint_text:
        return jsonify({"error": "Complaint text cannot be empty"}), 400
    try:
        res = mod_refund.run_refund_bench(complaint_text, bench, cap)
        res["result"] = f"Adjudication completed: {res.get('settlement', {}).get('disposition', 'REVIEW')}"
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
