"""Flask server exposing joke and travel suggestion endpoints."""

import os

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from joke import get_joke
from travel import get_travel_suggestion

# URL path prefix Nginx forwards under in production, e.g. "/ai-01".
# Unset locally, so routes are mounted at the root ("/", "/joke", "/travel").
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")

app = Flask(__name__, static_folder=".")
CORS(app)

bp = Blueprint("main", __name__)


@bp.route("/")
def index():
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    html = html.replace('const API = "";', f'const API = "{PATH_PREFIX}";')
    return app.response_class(html, mimetype="text/html")


@bp.route("/joke", methods=["POST"])
def joke():
    data = request.get_json(force=True)
    topic = (data.get("topic") or "").strip()
    try:
        text = get_joke(topic)
        response = jsonify({"result": text})
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/travel", methods=["POST"])
def travel():
    data = request.get_json(force=True)
    city = (data.get("city") or "").strip() or "Bangalore"
    try:
        text = get_travel_suggestion(city)
        return jsonify({"result": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
