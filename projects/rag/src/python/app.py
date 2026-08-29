"""Flask server exposing embeddings, chunking, RAG Q&A, reranking, and PDF chat endpoints.

Architecture notes
------------------
- All routes are attached to a Blueprint (``bp``) instead of directly to
  ``app``.  This lets us register the entire Blueprint under a runtime
  URL prefix (``PATH_PREFIX``) without touching individual route strings.
- In local development PATH_PREFIX is empty, so routes are at "/", "/embeddings",
  etc.  In production Nginx forwards ``/rag/...`` traffic to the container
  and PATH_PREFIX is set to "/rag", keeping every URL consistent.
- flask-cors adds ``Access-Control-Allow-Origin: *`` headers so the HTML
  page can call the API even if it is served from a different origin during
  development.
"""

import os
from pathlib import Path

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS

from chunk import chunk_text
from embeddings import compare_similarity
from index import build_index
from rag import rag_answer
from rerank import retrieve_with_rerank
from pdf_chat import build_pdf_text_index, ask_pdf

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# PATH_PREFIX is set by the deployment environment (e.g. "/rag") so the
# app works correctly behind an Nginx location block.  Locally it is empty
# string, which mounts all routes at the root.
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")
MAX_TEXTAREA_CHARS = 1000

# app.py lives in src/python, while index.html, css/, and js/ live in src/.
STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))

# Allow cross-origin requests from any origin.  In production you would
# restrict this to the specific front-end domain.
CORS(app)

# A Blueprint groups related routes.  We register it once at the bottom with
# the runtime PATH_PREFIX, avoiding any hardcoded path strings in the routes.
bp = Blueprint("main", __name__)

# Server-side state for PDF chat — stores the in-memory Chroma index per
# session.  In a production multi-user app this would use a session store;
# for this learning project a single shared state is fine.
_pdf_state = {"db": None}


def validate_textarea(value: str, label: str):
    """Validate required textarea content and enforce the shared size cap."""
    if not value:
        return jsonify({"error": f"{label} is required."}), 400
    if len(value) > MAX_TEXTAREA_CHARS:
        return jsonify({"error": f"{label} must be {MAX_TEXTAREA_CHARS} characters or fewer."}), 400
    return None


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


@bp.route("/info/<path:filename>")
def info(filename):
    """Serve the "how this demo works" explainer pages from src/info."""
    return app.send_static_file(os.path.join("info", filename))


@bp.route("/embeddings", methods=["POST"])
def embeddings_route():
    """Compare two texts and return their cosine similarity.

    Request body (JSON): ``{ "text_a": "<text>", "text_b": "<text>" }``
    Response (JSON):     ``{ "result": { "similarity": 0.87 } }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400 or 500
    """
    data = request.get_json(force=True)
    text_a = (data.get("text_a") or "").strip()
    text_b = (data.get("text_b") or "").strip()
    if not text_a or not text_b:
        return jsonify({"error": "Both text_a and text_b are required."}), 400
    try:
        score = compare_similarity(text_a, text_b)
        return jsonify({"result": {"similarity": round(score, 4)}})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/chunk", methods=["POST"])
def chunk_route():
    """Split text into overlapping chunks.

    Request body (JSON): ``{ "text": "<long text>" }``
    Response (JSON):     ``{ "result": { "chunks": ["...", ...], "count": 3 } }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400 or 500
    """
    data = request.get_json(force=True)
    text = (data.get("text") or "").strip()
    validation = validate_textarea(text, "Text")
    if validation:
        return validation
    try:
        chunks = chunk_text(text)
        return jsonify({"result": {"chunks": chunks, "count": len(chunks)}})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/rag", methods=["POST"])
def rag_route():
    """Answer a question using a user-provided knowledge base.

    Request body (JSON): ``{ "knowledge_base": "<text>", "question": "<text>" }``
    Response (JSON):     ``{ "result": "<answer>" }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400 or 500
    """
    data = request.get_json(force=True)
    knowledge = (data.get("knowledge_base") or "").strip()
    question = (data.get("question") or "").strip()
    validation = validate_textarea(knowledge, "Knowledge base")
    if validation:
        return validation
    if not question:
        return jsonify({"error": "A question is required."}), 400
    try:
        docs = [line.strip() for line in knowledge.splitlines() if line.strip()]
        db, _ = build_index(docs, persist_directory=None)
        answer = rag_answer(question, db=db)
        return jsonify({"result": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/rerank", methods=["POST"])
def rerank_route():
    """Retrieve and rerank results from a user-provided knowledge base.

    Request body (JSON): ``{ "knowledge_base": "<text>", "question": "<text>" }``
    Response (JSON):     ``{ "result": { "results": ["...", ...] } }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400 or 500
    """
    data = request.get_json(force=True)
    knowledge = (data.get("knowledge_base") or "").strip()
    question = (data.get("question") or "").strip()
    validation = validate_textarea(knowledge, "Knowledge base")
    if validation:
        return validation
    if not question:
        return jsonify({"error": "A question is required."}), 400
    try:
        docs = [line.strip() for line in knowledge.splitlines() if line.strip()]
        db, _ = build_index(docs, persist_directory=None)
        reranked = retrieve_with_rerank(db, question, top_k=3)
        results = [doc.page_content for doc in reranked]
        return jsonify({"result": {"results": results}})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/pdf-index", methods=["POST"])
def pdf_index():
    """Index pasted PDF text in an in-memory vector store.

    Request body (JSON): ``{ "pdf_text": "<text copied from a PDF>" }``
    Response (JSON): ``{ "result": "PDF text indexed. Ask me anything about it." }``
    Error response:  ``{ "error": "<message>" }`` with HTTP 400 or 500
    """
    data = request.get_json(force=True)
    pdf_text = (data.get("pdf_text") or "").strip()
    validation = validate_textarea(pdf_text, "PDF text")
    if validation:
        return validation
    try:
        _pdf_state["db"] = build_pdf_text_index(pdf_text)
        return jsonify({"result": "PDF text indexed. Ask me anything about it."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/pdf-chat", methods=["POST"])
def pdf_chat():
    """Answer a question about the previously indexed PDF text.

    Request body (JSON): ``{ "question": "<text>" }``
    Response (JSON):     ``{ "result": "<answer>" }``
    Error response:      ``{ "error": "<message>" }`` with HTTP 400 or 500
    """
    data = request.get_json(force=True)
    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"error": "A question is required."}), 400
    if _pdf_state["db"] is None:
        return jsonify({"error": "Please add PDF text first."}), 400
    try:
        answer = ask_pdf(_pdf_state["db"], question)
        return jsonify({"result": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Blueprint registration + server entry point
# ---------------------------------------------------------------------------

# Register all Blueprint routes under the optional path prefix.  This single
# line is the only place where PATH_PREFIX is applied — every route above is
# written as a relative path (e.g. "/rag") and the prefix is prepended here.
app.register_blueprint(bp, url_prefix=PATH_PREFIX)


if __name__ == "__main__":
    # Run the development server.  0.0.0.0 makes the app reachable from
    # outside the container; port 5000 is mapped to host port 8082 by
    # docker-compose.yml.
    app.run(host="0.0.0.0", port=5000)
