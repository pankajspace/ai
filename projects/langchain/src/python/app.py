"""Flask server exposing summarize, chat, and agent endpoints.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``.  This lets us register the entire Blueprint under a runtime
  URL prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/", "/summarize",
  etc.  In production Nginx forwards ``/langchain/...`` traffic to the container
  and PATH_PREFIX is set to "/langchain", keeping every URL consistent.
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML
  page can call the API even if it is served from a different origin during
  development.
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from agent import ask
from chat import reply
from summarizer import summarize

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# PATH_PREFIX is set by the deployment environment (e.g. "/langchain") so the
# app works correctly behind an Nginx location block.  Locally it is empty
# string, which mounts all routes at the root.
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

# app.py lives in src/python, while index.html, css/, and js/ live in src/.
STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))

# Allow cross-origin requests from any origin.  In production you would
# restrict this to the specific front-end domain.
CORS(app)

# A Blueprint groups related routes.  We register it once at the bottom with
# the runtime PATH_PREFIX, avoiding any hardcoded path strings in the routes.
bp = Blueprint("main", __name__)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@bp.route("/")
def index():
    """Serve index.html, injecting the correct API base URL for the environment."""
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    # The HTML file ships with 'data-api-base=""' (empty = relative URL, works
    # locally).  For production we replace it with the actual path prefix so
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


@bp.route("/summarize", methods=["POST"])
def summarizer():
    """Scrape a URL and return a LangChain-generated markdown summary.

    Request body (JSON): ``{ "url": "<website URL>" }``
    Response (JSON):     ``{ "result": "<markdown summary>" }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400 (missing url)
                         or HTTP 500 (API / scraping error)
    """
    data = request.get_json(force=True)
    url = (data.get("url") or "").strip()
    # Validate at the boundary — return 400 immediately rather than letting
    # the scraper make a request with an empty URL.
    if not url:
        return jsonify({"error": "A website URL is required."}), 400
    try:
        text = summarize(url)
        return jsonify({"result": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/scrape", methods=["POST"])
def scrape():
    """Scrape a URL and return its cleaned text.

    Request body (JSON): ``{ "url": "<website URL>" }``
    Response (JSON):     ``{ "result": "<cleaned text>" }``
    Error response:      ``{ "error": "<message>" }``
    """
    data = request.get_json(force=True)
    url = (data.get("url") or "").strip()
    if not url:
        return jsonify({"error": "A website URL is required."}), 400
    try:
        from scraper import fetch_website_contents
        text = fetch_website_contents(url)
        return jsonify({"result": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/chat", methods=["POST"])
def chat():
    """Reply to a message using the conversation history for memory.

    Request body (JSON)::

        { "message": "<user message>", "history": [ {"role", "content"}, ... ] }

    Response (JSON): ``{ "result": "<assistant reply>" }``
    Error response:  ``{ "error": "<message>" }`` with HTTP 400 (missing message)
                     or HTTP 500 (API error)
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    # history is optional; default to an empty conversation for the first turn.
    history = data.get("history") or []
    if not message:
        return jsonify({"error": "A message is required."}), 400
    try:
        text = reply(message, history)
        response = jsonify({"result": text})
        # Chat replies are turn-specific — never cache them.
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/agent", methods=["POST"])
def shop_agent():
    """Answer a shopping question, letting the agent call its price tool.

    Request body (JSON): ``{ "message": "<user message>" }``
    Response (JSON):     ``{ "result": "<assistant reply>" }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400 (missing
                         message) or HTTP 500 (API error)
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A message is required."}), 400
    try:
        text = ask(message)
        return jsonify({"result": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

# Register all Blueprint routes under the optional path prefix.  This single
# line is the only place where PATH_PREFIX is applied — every route above is
# written as a relative path (e.g. "/chat") and the prefix is prepended here.
app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    # Run the development server.  0.0.0.0 makes the app reachable from
    # outside the container; port 5000 is mapped to host port 8081 by
    # docker-compose.yml.
    app.run(host="0.0.0.0", port=5000)
