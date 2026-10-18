"""Flask server for 01-ai-basics."""

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


mod_travel = _load_service("01_chat_openai.py", "chat_openai")
mod_joke = _load_service("02_chat_groq.py", "chat_groq")
mod_summarize = _load_service("03_langchain_summarizer.py", "langchain_summarizer")
mod_memory = _load_service("04_langchain_memory_chat.py", "langchain_memory_chat")
mod_agent = _load_service("05_agent_one_tool.py", "agent_one_tool")
mod_lc_tool = _load_service("06_langchain_one_tool.py", "langchain_one_tool")
mod_lc_multi = _load_service("07_langchain_multi_tools.py", "langchain_multi_tools")


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


@bp.route("/api/travel", methods=["POST"])
def travel_suggestion():
    data = request.get_json(force=True, silent=True) or {}
    city = (data.get("city") or data.get("message") or "").strip()
    if not city:
        return jsonify({"error": "City cannot be empty"}), 400
    try:
        suggestion = mod_travel.get_travel_suggestion(city)
        return jsonify({"result": suggestion, "city": city, "suggestion": suggestion})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/joke", methods=["POST"])
def joke_generator():
    data = request.get_json(force=True, silent=True) or {}
    topic = (data.get("topic") or data.get("message") or "").strip()
    if not topic:
        return jsonify({"error": "Topic cannot be empty"}), 400
    try:
        joke = mod_joke.get_groq_joke(topic)
        return jsonify({"result": joke, "topic": topic, "joke": joke})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/summarize", methods=["POST"])
def summarizer_service():
    data = request.get_json(force=True, silent=True) or {}
    text = (data.get("text") or data.get("message") or "").strip()
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
    try:
        summary = mod_summarize.summarize(text)
        return jsonify({"result": summary, "summary": summary})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/memory-chat", methods=["POST"])
def memory_chat_service():
    data = request.get_json(force=True, silent=True) or {}
    message = (data.get("message") or "").strip()
    history = data.get("history") or []
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400
    try:
        reply, updated_history = mod_memory.chat_with_memory(message, history)
        return jsonify({"result": reply, "response": reply, "history": updated_history})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/agent", methods=["POST"])
def agent_service():
    data = request.get_json(force=True, silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400
    try:
        reply = mod_agent.run_agent_with_tool(message)
        return jsonify({"result": reply, "response": reply})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/langchain-one-tool", methods=["POST"])
def langchain_one_tool_service():
    data = request.get_json(force=True, silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400
    try:
        reply, tool_called = mod_lc_tool.run_langchain_one_tool(message)
        return jsonify({"result": reply, "response": reply, "tool_called": tool_called})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/multi-tool-agent", methods=["POST"])
def multi_tool_agent_service():
    data = request.get_json(force=True, silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400
    try:
        reply, tool_called = mod_lc_multi.run_multi_tool_agent(message)
        return jsonify({"result": reply, "response": reply, "tool_called": tool_called})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
