"""Flask server for 03-ai-model-training-chromadb."""

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


mod_ml = _load_service("01_model_training.py", "model_training")
mod_chroma = _load_service("02_chromadb.py", "chromadb_rag")
mod_redis = _load_service("03_redis.py", "redis_agent")


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


@bp.route("/api/model-training", methods=["POST"])
def model_training_service():
    data = request.get_json(force=True, silent=True) or {}
    try:
        distance_km = float(data.get("distance_km", 4.5))
        prep_time_min = float(data.get("prep_time_min", 15.0))
        rider_available = int(data.get("rider_available", 1))
        is_raining = int(data.get("is_raining", 1))
        if distance_km <= 0 or prep_time_min <= 0:
            return jsonify({"error": "Distance and prep time must be positive."}), 400
        res = mod_ml.predict_delivery_eta(distance_km, prep_time_min, rider_available, is_raining)
        res["result"] = f"Predicted Arrival: {res['eta_minutes']} min 🍔"
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/chromadb", methods=["POST"])
def chromadb_service():
    data = request.get_json(force=True, silent=True) or {}
    question = (data.get("question") or data.get("message") or "").strip()
    if not question:
        return jsonify({"error": "Question cannot be empty"}), 400
    try:
        res = mod_chroma.ask_chromadb_notes(question)
        res["result"] = res["answer"]
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/redis", methods=["POST"])
def redis_agent_service():
    data = request.get_json(force=True, silent=True) or {}
    session_id = (data.get("session_id") or "demo").strip()
    message = (data.get("message") or "").strip()
    reset_session = bool(data.get("reset_session", False))
    if not session_id or (not reset_session and not message):
        return jsonify({"error": "Session ID and message are required"}), 400
    try:
        res = mod_redis.run_redis_agent(session_id, message, reset_session)
        res["result"] = res["answer"]
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
