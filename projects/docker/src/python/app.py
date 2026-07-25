"""Flask server exposing the Docker Quiz endpoints and proxying to example services.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``. This lets us register the entire Blueprint under a runtime URL
  prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/", "/quiz",
  etc. In production Nginx forwards ``/docker/...`` traffic to the container
  and PATH_PREFIX is set to "/docker", keeping every URL consistent.
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML
  page can call the API even if it is served from a different origin during
  development.
- Proxy routes forward browser requests to internal Docker services
  (quickbite, scalergpt, deskbuddy-agent) using service-name networking.

To add a feature: create a module under ``src/python/`` (see ``quiz.py``),
import its function here, and add a matching ``@bp.route(...)`` handler.
"""

import os
from pathlib import Path

import requests as http_client
from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from quiz import get_question, check_answer

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# PATH_PREFIX is set by the deployment environment (e.g. "/docker") so the app
# works correctly behind an Nginx location block. Locally it is an empty
# string, which mounts all routes at the root.
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

# Internal service URLs — these use Docker Compose service names, never IPs.
QUICKBITE_URL = "http://quickbite:8000"
SCALERGPT_URL = "http://scalergpt:8000"
DESKBUDDY_URL = "http://deskbuddy-agent:9000"

# Timeout for proxy requests to example services (seconds).
PROXY_TIMEOUT = 30


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def proxy_request(method, url, json_body=None):
    """Forward a request to an internal service and return its JSON response.

    Returns a tuple of (response_dict, http_status_code). On connection
    errors, returns a helpful error message instead of crashing.
    """
    try:
        if method == "GET":
            resp = http_client.get(url, timeout=PROXY_TIMEOUT)
        else:
            resp = http_client.post(url, json=json_body, timeout=PROXY_TIMEOUT)
        return resp.json(), resp.status_code
    except http_client.ConnectionError:
        service = url.split("//")[1].split(":")[0]
        return {
            "error": f"Service '{service}' is not running. "
                     f"Start it with: docker compose up {service}"
        }, 503
    except Exception as e:
        return {"error": str(e)}, 500


# ---------------------------------------------------------------------------
# Routes — Quiz
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


@bp.route("/quiz", methods=["POST"])
def quiz_route():
    """Return a random Docker quiz question.

    Request body (JSON): ``{}`` or ``{ "id": <int> }``
    Response (JSON):     ``{ "id": <int>, "question": "...", "choices": [...], "total": <int> }``
    """
    data = request.get_json(force=True) if request.data else {}
    question_id = data.get("id")
    return jsonify(get_question(question_id))


@bp.route("/quiz/check", methods=["POST"])
def quiz_check_route():
    """Validate the user's answer for a quiz question.

    Request body (JSON): ``{ "id": <int>, "answer": <int> }``
    Response (JSON):     ``{ "correct": <bool>, "correct_index": <int>,
                             "explanation": "...", "answer_index": <int> }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400.
    """
    data = request.get_json(force=True)
    question_id = data.get("id")
    answer_index = data.get("answer")

    if question_id is None or answer_index is None:
        return jsonify({"error": "Both 'id' and 'answer' are required."}), 400

    result = check_answer(question_id, answer_index)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)


# ---------------------------------------------------------------------------
# Routes — QuickBite ETA (Level 1, keyless)
# ---------------------------------------------------------------------------


@bp.route("/quickbite/predict", methods=["POST"])
def quickbite_predict():
    """Proxy ETA prediction to the QuickBite FastAPI service."""
    body = request.get_json(force=True)
    data, status = proxy_request("POST", f"{QUICKBITE_URL}/predict", body)
    return jsonify(data), status


@bp.route("/quickbite/status")
def quickbite_status():
    """Check if QuickBite service is running."""
    data, status = proxy_request("GET", f"{QUICKBITE_URL}/")
    return jsonify(data), status


# ---------------------------------------------------------------------------
# Routes — ScalerGPT (Level 2, needs OPENAI_API_KEY)
# ---------------------------------------------------------------------------


@bp.route("/scalergpt/ask", methods=["POST"])
def scalergpt_ask():
    """Proxy RAG question to the ScalerGPT FastAPI service."""
    body = request.get_json(force=True)
    data, status = proxy_request("POST", f"{SCALERGPT_URL}/ask", body)
    return jsonify(data), status


@bp.route("/scalergpt/status")
def scalergpt_status():
    """Check if ScalerGPT service is running and how many docs are indexed."""
    data, status = proxy_request("GET", f"{SCALERGPT_URL}/")
    return jsonify(data), status


@bp.route("/scalergpt/ingest", methods=["POST"])
def scalergpt_ingest():
    """Trigger document ingestion on the ScalerGPT service.

    This runs ingest.py inside the scalergpt container via a simple POST.
    Note: This is a simplified proxy — in production you'd use docker exec.
    """
    data, status = proxy_request("GET", f"{SCALERGPT_URL}/")
    if status != 200:
        return jsonify(data), status
    return jsonify(data), status


# ---------------------------------------------------------------------------
# Routes — DeskBuddy (Level 3, needs OPENAI_API_KEY)
# ---------------------------------------------------------------------------


@bp.route("/deskbuddy/chat", methods=["POST"])
def deskbuddy_chat():
    """Proxy chat message to the DeskBuddy agent service."""
    body = request.get_json(force=True)
    data, status = proxy_request("POST", f"{DESKBUDDY_URL}/chat", body)
    return jsonify(data), status


@bp.route("/deskbuddy/status")
def deskbuddy_status():
    """Check if DeskBuddy agent service is running."""
    data, status = proxy_request("GET", f"{DESKBUDDY_URL}/")
    return jsonify(data), status


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

# Register all Blueprint routes under the optional path prefix. This single
# line is the only place where PATH_PREFIX is applied — every route above is
# written as a relative path (e.g. "/quiz") and the prefix is prepended here.
app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    # Run the development server. 0.0.0.0 makes the app reachable from outside
    # the container; port 5000 is mapped to the host port in docker-compose.yml.
    app.run(host="0.0.0.0", port=5000)
