"""Flask web server for Shipment Exception Desk.

Serves the dashboard UI and provides API endpoints for:
- /api/triage: process exception reports through the pipeline
- /api/log: fetch the current session triage ledger
- /api/summary: fetch aggregated KPI summary
- /api/reset: clear current in-memory session ledger
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from pipeline import process_exception
from session import clear_session, generate_daily_summary, get_triage_log

PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))
CORS(app)
bp = Blueprint("main", __name__)


@bp.route("/")
def index():
    """Serve index.html with API base injected for local/prod parity."""
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    html = html.replace('data-api-base=""', f'data-api-base="{PATH_PREFIX}"')
    return app.response_class(html, mimetype="text/html")


@bp.route("/css/<path:filename>")
def css(filename):
    """Serve stylesheets from src/css."""
    return app.send_static_file(os.path.join("css", filename))


@bp.route("/js/<path:filename>")
def js(filename):
    """Serve scripts from src/js."""
    return app.send_static_file(os.path.join("js", filename))


@bp.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "shipment-exception-desk"})


@bp.route("/api/triage", methods=["POST"])
def triage_report():
    """Process an incoming shipment exception report."""
    data = request.get_json(force=True) or {}
    report_text = (data.get("report_text") or "").strip()
    shipment_value = data.get("shipment_value")
    customer_tier = (data.get("customer_tier") or "standard").strip().lower()

    if not report_text:
        return jsonify({"detail": "Report text cannot be empty."}), 400

    try:
        shipment_value = float(shipment_value)
    except (TypeError, ValueError):
        return jsonify({"detail": "Shipment value must be a valid number."}), 400

    if shipment_value < 0:
        return jsonify({"detail": "Shipment value cannot be negative."}), 400

    if customer_tier not in {"standard", "premium"}:
        return jsonify({"detail": "Customer tier must be standard or premium."}), 400

    try:
        result = process_exception(
            report_text=report_text,
            shipment_value=shipment_value,
            customer_tier=customer_tier,
            log_to_session=True,
        )
        return jsonify(result)
    except Exception as exc:
        return jsonify({"detail": str(exc)}), 500


@bp.route("/api/log", methods=["GET"])
def fetch_log():
    """Return all triage records logged in the current session."""
    return jsonify(get_triage_log())


@bp.route("/api/summary", methods=["GET"])
def fetch_summary():
    """Return aggregated summary metrics and category breakdown."""
    return jsonify(generate_daily_summary())


@bp.route("/api/reset", methods=["POST"])
def reset_session():
    """Clear session records."""
    clear_session()
    return jsonify({"status": "session_cleared"})


app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
