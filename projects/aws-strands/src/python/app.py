"""Flask server exposing the AWS Strands agent demos.

Each demo runs a real Strands agent on Amazon Bedrock:
  * ``/ask``       — a plain, tool-less agent (Module 1).
  * ``/math``      — a pre-built calculator tool (Module 2).
  * ``/tip``       — a tool-enabled tip calculator (Module 2).
  * ``/inventory`` — a custom tool checking stock (Module 2).
  * ``/sales``     — multi-tool planning: query, analyse, email (Module 2).
  * ``/stock``     — class-based, stateful inventory tools (Module 2).
  * ``/warehouse`` — async tools running lookups in parallel (Module 2).
  * ``/travel``    — a multi-tool travel assistant (Module 3 capstone).

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``.  This lets us register the entire Blueprint under a runtime URL
  prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/", "/ask", etc.
  In production Nginx forwards ``/aws-strands/…`` traffic to the container and
  PATH_PREFIX is set to "/aws-strands".
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML page
  can call the API even if it is served from a different origin during
  development.
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from hello_agent import ask
from inventory_agent import check
from math_agent import solve
from sales_agent import report
from stock_agent import manage
from tip_agent import calculate
from travel_agent import plan
from warehouse_agent import lookup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

# app.py lives in src/python, while index.html, css/, js/ live in src/.
STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))

CORS(app)

bp = Blueprint("main", __name__)


# ---------------------------------------------------------------------------
# Page + asset routes
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


@bp.route("/info/<path:filename>")
def info(filename):
    """Serve the "how this demo works" explainer pages from src/info."""
    return app.send_static_file(os.path.join("info", filename))


# ---------------------------------------------------------------------------
# Demo API routes
# ---------------------------------------------------------------------------


@bp.route("/ask", methods=["POST"])
def ask_route():
    """Answer a prompt with a plain, tool-less agent (Module 1).

    Request body (JSON): ``{ "message": "<prompt>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A prompt is required."}), 400
    try:
        return jsonify({"result": ask(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/tip", methods=["POST"])
def tip_route():
    """Answer a natural-language tip question via a tool-enabled agent (Module 2).

    Request body (JSON): ``{ "message": "<tip question>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A question is required."}), 400
    try:
        return jsonify({"result": calculate(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/math", methods=["POST"])
def math_route():
    """Answer a math question via the pre-built calculator tool (Module 2).

    Request body (JSON): ``{ "message": "<math question>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A question is required."}), 400
    try:
        return jsonify({"result": solve(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/inventory", methods=["POST"])
def inventory_route():
    """Check stock with a custom tool (Module 2). Try PROD-123, PROD-456, PROD-789.

    Request body (JSON): ``{ "message": "<stock question>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A question is required."}), 400
    try:
        return jsonify({"result": check(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/sales", methods=["POST"])
def sales_route():
    """Run a multi-tool sales request: query, analyse, email (Module 2).

    Request body (JSON): ``{ "message": "<sales request>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A request is required."}), 400
    try:
        return jsonify({"result": report(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/stock", methods=["POST"])
def stock_route():
    """Check or update stock with class-based, stateful tools (Module 2).

    Request body (JSON): ``{ "message": "<stock request>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A request is required."}), 400
    try:
        return jsonify({"result": manage(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/warehouse", methods=["POST"])
def warehouse_route():
    """Look up stock across warehouses in parallel via async tools (Module 2).

    Request body (JSON): ``{ "message": "<warehouse question>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A question is required."}), 400
    try:
        return jsonify({"result": lookup(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/travel", methods=["POST"])
def travel_route():
    """Plan a trip with the multi-tool travel assistant (Module 3 capstone).

    Request body (JSON): ``{ "message": "<trip description>" }``
    Response (JSON):     ``{ "result": "<agent reply>" }``
    """
    data = request.get_json(force=True)
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "A trip description is required."}), 400
    try:
        return jsonify({"result": plan(message)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
