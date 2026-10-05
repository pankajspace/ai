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
from rate_limiter import check_rate_limit

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


@bp.before_request
def enforce_rate_limit():
    """Enforce strict 10 requests per hour limit on all POST endpoints."""
    # ① rate-limit only POST requests because they run the demo features
    if request.method == "POST":
        # ② ask the shared limiter whether this request exceeds the quota
        blocked, msg, retry_after = check_rate_limit(
            request, max_requests=10, window_seconds=3600
        )
        # ③ return a 429 response with retry timing when the quota is spent
        if blocked:
            resp = jsonify({"error": msg})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp

# Server-side state for PDF chat — stores the in-memory Chroma index per
# session.  In a production multi-user app this would use a session store;
# for this learning project a single shared state is fine. It's a dict
# (not a plain variable) so the route functions below can mutate it in
# place without needing a `global` declaration.
_pdf_state = {"db": None}


def validate_textarea(value: str, label: str):
    """Validate required textarea content and enforce the shared size cap."""
    # ① reject missing text before the feature code runs
    if not value:
        return jsonify({"error": f"{label} is required."}), 400
    # ② reject oversized text so demos stay responsive
    if len(value) > MAX_TEXTAREA_CHARS:
        return jsonify({"error": f"{label} must be {MAX_TEXTAREA_CHARS} characters or fewer."}), 400
    # ③ signal that validation passed
    return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@bp.route("/")
def index():
    """Serve index.html, injecting the correct API base URL for the environment."""
    # ① read the static HTML shell from disk
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    # ② inject the runtime path prefix so browser fetch calls hit the API
    # The HTML file ships with 'data-api-base=""' (empty = relative URL, works
    # locally).  For production we replace it with the actual path prefix so
    # all fetch() calls in the browser target the right endpoint.
    html = html.replace('data-api-base=""', f'data-api-base="{PATH_PREFIX}"')
    # ③ return the customized HTML response
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
    # ① parse the JSON request body
    data = request.get_json(force=True)
    # ② normalize both input texts before validation
    text_a = (data.get("text_a") or "").strip()
    text_b = (data.get("text_b") or "").strip()
    # ③ require both texts so the similarity comparison is meaningful
    if not text_a or not text_b:
        return jsonify({"error": "Both text_a and text_b are required."}), 400
    try:
        # ④ compute cosine similarity and return a rounded JSON result
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
    # ① parse the JSON request body
    data = request.get_json(force=True)
    # ② normalize the submitted text before validation
    text = (data.get("text") or "").strip()
    # ③ enforce required text and the shared textarea size limit
    validation = validate_textarea(text, "Text")
    if validation:
        return validation
    try:
        # ④ split the text and return both chunks and count
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
    # ① parse the JSON request body
    data = request.get_json(force=True)
    # ② normalize the knowledge base and question
    knowledge = (data.get("knowledge_base") or "").strip()
    question = (data.get("question") or "").strip()
    # ③ validate the knowledge base before building an index
    validation = validate_textarea(knowledge, "Knowledge base")
    if validation:
        return validation
    # ④ require a question so the RAG chain has a query
    if not question:
        return jsonify({"error": "A question is required."}), 400
    try:
        # ⑤ turn each non-blank knowledge-base line into one document
        # One "document" per non-blank line of the pasted knowledge base.
        docs = [line.strip() for line in knowledge.splitlines() if line.strip()]
        # ⑥ build an in-memory index from this request only
        # persist_directory=None keeps the index in memory only — it's rebuilt
        # fresh from the request body on every call, nothing is written to disk.
        db, _ = build_index(docs, persist_directory=None)
        # ⑦ answer the question using the freshly built index
        answer = rag_answer(question, db=db)
        # ⑧ return the grounded answer as JSON
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
    # ① parse the JSON request body
    data = request.get_json(force=True)
    # ② normalize the knowledge base and question
    knowledge = (data.get("knowledge_base") or "").strip()
    question = (data.get("question") or "").strip()
    # ③ validate the knowledge base before building an index
    validation = validate_textarea(knowledge, "Knowledge base")
    if validation:
        return validation
    # ④ require a question so retrieval has a query
    if not question:
        return jsonify({"error": "A question is required."}), 400
    try:
        # ⑤ turn each non-blank knowledge-base line into one document
        docs = [line.strip() for line in knowledge.splitlines() if line.strip()]
        # ⑥ build an in-memory index from this request only
        db, _ = build_index(docs, persist_directory=None)
        # ⑦ retrieve and rerank the top chunks for the question
        reranked = retrieve_with_rerank(db, question, top_k=3)  # top_k is fixed here, not exposed as a request parameter
        # ⑧ extract plain text so the browser receives simple JSON
        results = [doc.page_content for doc in reranked]
        # ⑨ return the reranked results as JSON
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
    # ① parse the JSON request body
    data = request.get_json(force=True)
    # ② normalize the pasted PDF text before validation
    pdf_text = (data.get("pdf_text") or "").strip()
    # ③ validate required PDF text and the shared size limit
    validation = validate_textarea(pdf_text, "PDF text")
    if validation:
        return validation
    try:
        # ④ build and store the in-memory PDF index for later questions
        _pdf_state["db"] = build_pdf_text_index(pdf_text)
        # ⑤ confirm that the PDF text is ready for chat
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
    # ① parse the JSON request body
    data = request.get_json(force=True)
    # ② normalize and validate the question
    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"error": "A question is required."}), 400
    # ③ require a previously indexed PDF before answering
    if _pdf_state["db"] is None:
        return jsonify({"error": "Please add PDF text first."}), 400
    try:
        # ④ answer from the stored PDF index
        answer = ask_pdf(_pdf_state["db"], question)
        # ⑤ return the PDF-grounded answer as JSON
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
