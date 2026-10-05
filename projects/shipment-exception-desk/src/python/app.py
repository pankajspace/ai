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
from rate_limiter import check_rate_limit
from session import clear_session, generate_daily_summary, get_triage_log

PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))
CORS(app)
bp = Blueprint("main", __name__)


@bp.before_request
def enforce_rate_limit():
    """Enforce strict 10 requests per hour limit on all POST endpoints."""
    # ① apply rate limits only to state-changing post requests
    if request.method == "POST":
        # ② ask the limiter whether this client has exceeded the hourly quota
        blocked, msg, retry_after = check_rate_limit(
            request, max_requests=10, window_seconds=3600
        )
        # ③ return http 429 with retry timing when the request is blocked
        if blocked:
            resp = jsonify({"error": msg})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp



@bp.route("/")
def index():
    """Serve index.html with API base injected for local/prod parity."""
    # ① read the static dashboard page from the configured static folder
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    # ② inject the deployment path prefix so browser api calls use the right base
    html = html.replace('data-api-base=""', f'data-api-base="{PATH_PREFIX}"')
    # ③ return the modified page as html
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
    # ① parse and normalize request fields from the json body
    data = request.get_json(force=True) or {}
    report_text = (data.get("report_text") or "").strip()
    shipment_value = data.get("shipment_value")
    customer_tier = (data.get("customer_tier") or "standard").strip().lower()

    # ② reject missing report text before invoking the ai workflow
    if not report_text:
        return jsonify({"detail": "Report text cannot be empty."}), 400

    # ③ convert shipment value to a number or return validation error
    try:
        shipment_value = float(shipment_value)
    except (TypeError, ValueError):
        return jsonify({"detail": "Shipment value must be a valid number."}), 400

    # ④ reject negative values because compensation cannot be negative
    if shipment_value < 0:
        return jsonify({"detail": "Shipment value cannot be negative."}), 400

    # ⑤ accept only supported service tiers for policy lookup
    if customer_tier not in {"standard", "premium"}:
        return jsonify({"detail": "Customer tier must be standard or premium."}), 400

    # ⑥ run the triage pipeline and return its structured result
    try:
        result = process_exception(
            report_text=report_text,
            shipment_value=shipment_value,
            customer_tier=customer_tier,
            log_to_session=True,
        )
        return jsonify(result)
    # ⑦ return pipeline errors as client-readable json
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
    # ① clear the in-memory ledger for a fresh demo session
    clear_session()
    # ② confirm the reset so the dashboard can refresh state
    return jsonify({"status": "session_cleared"})


app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    # ① start flask when this file is executed directly
    app.run(host="0.0.0.0", port=5000)
