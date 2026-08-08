"""Flask server for the AWS Strands SDK study reference app.

Serves an interactive catalog of the 14 example scripts from the
"AI Agents on AWS" masterclass.  Each lesson's source code is served
via API routes and displayed in the browser — no Bedrock calls are made
at runtime.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``.  This lets us register the entire Blueprint under a runtime URL
  prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/", "/api/…".
- In production Nginx forwards ``/aws-strands/…`` traffic to the container
  and PATH_PREFIX is set to "/aws-strands".
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from examples import get_modules, get_root_scripts, get_lesson

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
# Page Routes
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
# API Routes
# ---------------------------------------------------------------------------


@bp.route("/api/modules")
def api_modules():
    """Return the full module/lesson catalog as JSON.

    Response:
        {
            "modules": [ { id, title, description, accent, lessons: [...] } ],
            "root_scripts": [ { filename, title, description, source } ]
        }
    """
    return jsonify({
        "modules": get_modules(),
        "root_scripts": get_root_scripts(),
    })


@bp.route("/api/lesson/<module_id>/<filename>")
def api_lesson(module_id, filename):
    """Return a single lesson's source code and metadata.

    Response:
        { module, filename, title, description, source }
    """
    lesson = get_lesson(module_id, filename)
    if lesson is None:
        return jsonify({"error": "Lesson not found"}), 404
    return jsonify(lesson)


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
