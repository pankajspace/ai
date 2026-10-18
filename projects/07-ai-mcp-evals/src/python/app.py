"""Flask server for 07-ai-mcp-evals."""

import asyncio
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


mod_mcp_client = _load_service("01_mcp_client.py", "mcp_client")
mod_mcp_agent = _load_service("02_mcp_agent.py", "mcp_agent")
mod_mcp_evals = _load_service("03_mcp_evals.py", "mcp_evals")


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


@bp.route("/api/mcp-client", methods=["POST"])
def mcp_client_route():
    data = request.get_json(force=True, silent=True) or {}
    tool_name = data.get("tool_name") or "get_live_score"
    tool_args = data.get("tool_args") or {"teams": "India vs West Indies"}
    try:
        res = asyncio.run(mod_mcp_client.run_mcp_client(tool_name, tool_args))
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/mcp-agent", methods=["POST"])
def mcp_agent_route():
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or data.get("message") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        res = asyncio.run(mod_mcp_agent.run_mcp_agent(question))
        res["result"] = res.get("answer", "")
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/mcp-evals", methods=["POST"])
def mcp_evals_route():
    try:
        res = asyncio.run(mod_mcp_evals.run_mcp_evals_suite())
        res["result"] = f"Evaluation Suite Accuracy: {res['accuracy_percentage']}% ({res['passed_cases']}/{res['total_cases']} passed)"
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
