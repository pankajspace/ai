"""Flask server for 04-ai-aws-strands."""

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


s_hello = _load_service("01_hello_world_agent.py", "s_hello")
s_langgraph = _load_service("02_hello_world_langgraph.py", "s_langgraph")
s_fn_tool = _load_service("03_function_to_tool.py", "s_fn_tool")
s_tip = _load_service("04_tip_calculator.py", "s_tip")
s_sales = _load_service("05_multi_tool_sales.py", "s_sales")
s_inv = _load_service("06_custom_tool_inventory.py", "s_inv")
s_calc = _load_service("07_prebuilt_tools.py", "s_calc")
s_multi_pre = _load_service("08_multi_prebuilt_tools.py", "s_multi_pre")
s_aws = _load_service("09_use_aws.py", "s_aws")
s_cls_tool = _load_service("10_class_based_tools.py", "s_cls_tool")
s_async_tool = _load_service("11_async_tools.py", "s_async_tool")
s_travel = _load_service("12_travel_assistant.py", "s_travel")


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


@bp.route("/api/hello-world-agent", methods=["POST"])
def hello_world_route():
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or data.get("message") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400
    try:
        res = s_hello.run_hello_world_agent(prompt)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/langgraph-agent", methods=["POST"])
def langgraph_route():
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or data.get("message") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400
    try:
        res = s_langgraph.run_langgraph_agent(prompt)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/function-to-tool", methods=["POST"])
def function_to_tool_route():
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or data.get("message") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        res = s_fn_tool.run_function_to_tool_agent(question)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/tip-calculator", methods=["POST"])
def tip_calculator_route():
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        res = s_tip.run_tip_calculator_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/multi-tool-sales", methods=["POST"])
def multi_tool_sales_route():
    data = request.get_json(force=True, silent=True) or {}
    task = (data.get("task") or data.get("message") or "").strip()
    if not task:
        return jsonify({"error": "Task cannot be empty"}), 400
    try:
        res = s_sales.run_multi_tool_sales_agent(task)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/custom-inventory", methods=["POST"])
def custom_inventory_route():
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or data.get("message") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        res = s_inv.run_custom_inventory_agent(question)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/prebuilt-calculator", methods=["POST"])
def prebuilt_calculator_route():
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        res = s_calc.run_prebuilt_calculator_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/multi-prebuilt-tools", methods=["POST"])
def multi_prebuilt_tools_route():
    data = request.get_json(force=True, silent=True) or {}
    task = (data.get("task") or data.get("message") or "").strip()
    if not task:
        return jsonify({"error": "Task cannot be empty"}), 400
    try:
        res = s_multi_pre.run_multi_prebuilt_tools_agent(task)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/use-aws", methods=["POST"])
def use_aws_route():
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or data.get("message") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400
    try:
        res = s_aws.run_use_aws_agent(prompt)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/class-based-tools", methods=["POST"])
def class_based_tools_route():
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        res = s_cls_tool.run_class_based_tools_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/async-tools", methods=["POST"])
def async_tools_route():
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        res = asyncio.run(s_async_tool.run_async_tools_agent(query))
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/travel-assistant", methods=["POST"])
def travel_assistant_route():
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        res = s_travel.run_travel_assistant_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
