"""Flask server for 05-ai-aws-strands."""

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

# Ensure default AWS region is configured if not provided in environment
if "AWS_REGION" not in os.environ:
    os.environ["AWS_REGION"] = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
if "AWS_DEFAULT_REGION" not in os.environ:
    os.environ["AWS_DEFAULT_REGION"] = os.environ["AWS_REGION"]

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


@bp.route("/api/hello-world-agent", methods=["POST"])
def hello_world_route():
    # ① Parse prompt from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or data.get("message") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400
    try:
        # ② Invoke the Strands Hello World Agent in 01_hello_world_agent.py
        res = s_hello.run_hello_world_agent(prompt)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/langgraph-agent", methods=["POST"])
def langgraph_route():
    # ① Parse prompt from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or data.get("message") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400
    try:
        # ② Invoke the LangGraph + Bedrock Converse agent in 02_hello_world_langgraph.py
        res = s_langgraph.run_langgraph_agent(prompt)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/function-to-tool", methods=["POST"])
def function_to_tool_route():
    # ① Parse question from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or data.get("message") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        # ② Run the HTTP server health-check tool agent in 03_function_to_tool.py
        res = s_fn_tool.run_function_to_tool_agent(question)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/tip-calculator", methods=["POST"])
def tip_calculator_route():
    # ① Parse query from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        # ② Run the multi-parameter tip calculator agent in 04_tip_calculator.py
        res = s_tip.run_tip_calculator_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/multi-tool-sales", methods=["POST"])
def multi_tool_sales_route():
    # ① Parse task from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    task = (data.get("task") or data.get("message") or "").strip()
    if not task:
        return jsonify({"error": "Task cannot be empty"}), 400
    try:
        # ② Run the 3-tool sales pipeline agent in 05_multi_tool_sales.py
        res = s_sales.run_multi_tool_sales_agent(task)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/custom-inventory", methods=["POST"])
def custom_inventory_route():
    # ① Parse question from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or data.get("message") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        # ② Run the custom inventory lookup agent in 06_custom_tool_inventory.py
        res = s_inv.run_custom_inventory_agent(question)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/prebuilt-calculator", methods=["POST"])
def prebuilt_calculator_route():
    # ① Parse math query from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        # ② Run the prebuilt calculator tool agent in 07_prebuilt_tools.py
        res = s_calc.run_prebuilt_calculator_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/multi-prebuilt-tools", methods=["POST"])
def multi_prebuilt_tools_route():
    # ① Parse task from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    task = (data.get("task") or data.get("message") or "").strip()
    if not task:
        return jsonify({"error": "Task cannot be empty"}), 400
    try:
        # ② Run the http_request + calculator agent in 08_multi_prebuilt_tools.py
        res = s_multi_pre.run_multi_prebuilt_tools_agent(task)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/use-aws", methods=["POST"])
def use_aws_route():
    # ① Parse natural-language AWS prompt from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    prompt = (data.get("prompt") or data.get("message") or "").strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400
    try:
        # ② Run the prebuilt use_aws (boto3) agent in 09_use_aws.py
        res = s_aws.run_use_aws_agent(prompt)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/class-based-tools", methods=["POST"])
def class_based_tools_route():
    # ① Parse query from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        # ② Run the stateful InventoryTools class agent in 10_class_based_tools.py
        res = s_cls_tool.run_class_based_tools_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/async-tools", methods=["POST"])
def async_tools_route():
    # ① Parse query from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        # ② Run the async parallel warehouse tools agent in 11_async_tools.py
        res = asyncio.run(s_async_tool.run_async_tools_agent(query))
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/travel-assistant", methods=["POST"])
def travel_assistant_route():
    # ① Parse travel query from JSON payload and reject empty values
    data = request.get_json(force=True, silent=True) or {}
    query = (data.get("query") or data.get("message") or "").strip()
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    try:
        # ② Run the 4-tool travel assistant agent in 12_travel_assistant.py
        res = s_travel.run_travel_assistant_agent(query)
        res["result"] = res.get("response") or res.get("answer") or ""
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
