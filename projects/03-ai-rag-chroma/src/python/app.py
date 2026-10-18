"""Flask server for 03-ai-rag-chroma."""

import importlib.util
import os
import sys
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS
from rate_limiter import check_rate_limit

load_dotenv(find_dotenv())

PATH_PREFIX = os.environ.get("PATH_PREFIX", "")
STATIC_DIR = Path(__file__).resolve().parents[1]
app = Flask(__name__, static_folder=str(STATIC_DIR))
CORS(app)

bp = Blueprint("main", __name__)

_CUR_DIR = Path(__file__).resolve().parent


def _load_service(filename: str, alias: str):
    # ① Resolve the numbered service file path and create its import spec
    file_path = _CUR_DIR / filename
    spec = importlib.util.spec_from_file_location(f"services.{alias}", file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module from {file_path}")
    # ② Register and execute the module so its functions can be called by routes
    mod = importlib.util.module_from_spec(spec)
    sys.modules[f"services.{alias}"] = mod
    spec.loader.exec_module(mod)
    return mod


mod_chunk = _load_service("01_chunking.py", "chunking")
mod_embed = _load_service("02_embedding.py", "embedding")
mod_rag = _load_service("03_rag.py", "rag")


@bp.before_request
def enforce_rate_limit():
    # ① Only rate-limit mutating POST requests
    if request.method == "POST":
        # ② Check whether this client has exceeded 30 requests per hour
        blocked, msg, retry_after = check_rate_limit(
            request, max_requests=30, window_seconds=3600
        )
        if blocked:
            # ③ Return HTTP 429 with Retry-After header when rate-limited
            resp = jsonify({"error": msg})
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp


@bp.route("/")
def index():
    # ① Read index.html and inject the runtime PATH_PREFIX into data-api-base
    with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
        html = f.read()
    html = html.replace('data-api-base=""', f'data-api-base="{PATH_PREFIX}"')
    # ② Return the patched HTML page
    return app.response_class(html, mimetype="text/html")


@bp.route("/css/<path:filename>")
def css(filename):
    return app.send_static_file(os.path.join("css", filename))


@bp.route("/js/<path:filename>")
def js(filename):
    return app.send_static_file(os.path.join("js", filename))


@bp.route("/explanation/<path:filename>")
@bp.route("/info/<path:filename>")
def explanation_pages(filename):
    return app.send_static_file(os.path.join("explanation", filename))


@bp.route("/theory/<path:filename>")
def theory_pages(filename):
    """Serve the theory documentation pages from src/theory."""
    return app.send_static_file(os.path.join("theory", filename))


@bp.route("/api/chunk", methods=["POST"])
def chunking_service():
    # ① Parse text, chunk_size, and chunk_overlap from the JSON request body
    data = request.get_json(force=True, silent=True) or {}
    text = (data.get("text") or "").strip()
    chunk_size = int(data.get("chunk_size") or 250)
    chunk_overlap = int(data.get("chunk_overlap") or 40)
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
    try:
        # ② Split the text into overlapping chunks via 01_chunking.py and return JSON
        chunks = mod_chunk.chunk_text(text, chunk_size, chunk_overlap)
        return jsonify({
            "result": f"Split document into {len(chunks)} chunks (size {chunk_size}, overlap {chunk_overlap}).",
            "total_chunks": len(chunks),
            "chunk_size": chunk_size,
            "chunk_overlap": chunk_overlap,
            "chunks": chunks,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/embedding", methods=["POST"])
def embedding_service():
    # ① Parse both input strings and validate that neither is empty
    data = request.get_json(force=True, silent=True) or {}
    text1 = (data.get("text1") or "").strip()
    text2 = (data.get("text2") or "").strip()
    if not text1 or not text2:
        return jsonify({"error": "Both text1 and text2 are required"}), 400
    try:
        # ② Compute vector embeddings and cosine similarity via 02_embedding.py
        res = mod_embed.compute_similarity(text1, text2)
        res["result"] = f"Cosine Similarity: {res['similarity']:.4f} (Dimension: {res['dimensions']})"
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@bp.route("/api/rag", methods=["POST"])
def rag_service():
    # ① Parse the source paragraph and user question from the JSON request body
    data = request.get_json(force=True, silent=True) or {}
    paragraph = (data.get("paragraph") or "").strip()
    question = (data.get("question") or data.get("message") or "").strip()
    if not paragraph or not question:
        return jsonify({"error": "Both paragraph and question are required"}), 400
    try:
        # ② Execute the Chroma RAG pipeline in 03_rag.py and return answer + sources
        res = mod_rag.answer_rag(paragraph, question)
        res["result"] = res["answer"]
        return jsonify(res)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


app.register_blueprint(bp, url_prefix=PATH_PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
