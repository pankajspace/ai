"""Flask server exposing joke and travel suggestion endpoints."""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from joke import get_joke
from travel import get_travel_suggestion

app = Flask(__name__, static_folder=".")
CORS(app)


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/joke", methods=["POST"])
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


@app.route("/travel", methods=["POST"])
def travel():
    data = request.get_json(force=True)
    city = (data.get("city") or "").strip() or "Bangalore"
    try:
        text = get_travel_suggestion(city)
        return jsonify({"result": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
