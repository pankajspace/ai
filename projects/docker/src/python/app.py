"""Flask server proxying browser requests to internal Docker demo services.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``. This lets us register the entire Blueprint under a runtime URL
  prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/",
  "/quickbite/predict", etc. In production Nginx forwards ``/docker/...``
  traffic to the container and PATH_PREFIX is set to "/docker".
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML
  page can call the API even if it is served from a different origin during
  development.
- Proxy routes forward browser requests to internal Docker services
  (quickbite, scalergpt, deskbuddy-agent) using service-name networking.
"""

import os
from pathlib import Path

import requests as http_client
from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

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


def service_status(url):
    """Report downstream availability without failing the browser status probe."""
    data, status = proxy_request("GET", url)
    return {"available": status == 200, **data}


# ---------------------------------------------------------------------------
# Routes — Static files
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
    return jsonify(service_status(f"{QUICKBITE_URL}/"))


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
    return jsonify(service_status(f"{SCALERGPT_URL}/"))


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
    return jsonify(service_status(f"{DESKBUDDY_URL}/"))


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
