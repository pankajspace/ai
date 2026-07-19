"""Reranking: refine retrieval results with a cross-encoder.

A bi-encoder (the sentence-transformer used for indexing) is fast but
approximate. A cross-encoder scores each (question, candidate) pair more
accurately but is too slow to run over an entire corpus. The trick is to
retrieve many cheap candidates with the bi-encoder, then rerank the top
ones with the cross-encoder.

Can be run directly:  ``docker compose run --rm rerank``
"""

from sentence_transformers import CrossEncoder
from langchain_chroma import Chroma

from config import get_embedder

# Lazy-loaded cross-encoder — only downloaded when /rerank is first called,
# not at import time (which would block Flask startup).
_reranker = None


def _get_reranker():
    global _reranker
    if _reranker is None:
        _reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")
    return _reranker


def retrieve_with_rerank(
    db: Chroma,
    question: str,
    top_k: int = 3,
    initial_k: int = 25,
) -> list:
    """Retrieve candidates, then rerank with a cross-encoder.

    Args:
        db: A Chroma vector store to search.
        question: The user's query.
        top_k: Number of final results to return.
        initial_k: Number of cheap bi-encoder candidates to fetch before
            reranking (should be >> top_k).

    Returns:
        The *top_k* most relevant document chunks, reranked by the
        cross-encoder.
    """
    candidates = db.similarity_search(question, k=initial_k)
    if not candidates:
        return []
    reranker = _get_reranker()
    pairs = [(question, c.page_content) for c in candidates]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(scores, candidates), reverse=True)
    return [c for _, c in ranked[:top_k]]


if __name__ == "__main__":
    embedder = get_embedder()
    db = Chroma(persist_directory="./chroma_db", embedding_function=embedder)
    question = "What is the return policy?"
    results = retrieve_with_rerank(db, question)
    print(f"Q: {question}")
    for i, doc in enumerate(results):
        print(f"  {i + 1}. {doc.page_content}")
