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
    # ① download and cache the cross-encoder only on first use
    if _reranker is None:
        _reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")
    # ② return the cached reranker for all later requests
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
    # ① retrieve many fast bi-encoder candidates from the vector store
    candidates = db.similarity_search(question, k=initial_k)
    # ② stop early if the vector store found no matches
    if not candidates:
        return []
    # ③ load the slower but more accurate cross-encoder reranker
    reranker = _get_reranker()
    # ④ pair the same question with every candidate chunk
    pairs = [(question, c.page_content) for c in candidates]
    # ⑤ score each question-and-chunk pair for relevance
    scores = reranker.predict(pairs)
    # ⑥ sort by score only so tied scores never compare Document objects
    # Sort by score only. Sorting whole (score, Document) tuples breaks when
    # two scores tie, because Python then compares the Document objects, which
    # don't support "<" ("'<' not supported between instances of 'Document'").
    ranked = sorted(zip(scores, candidates), key=lambda pair: pair[0], reverse=True)
    # ⑦ return just the highest-ranked document chunks
    return [c for _, c in ranked[:top_k]]


if __name__ == "__main__":
    # ① load embeddings so Chroma can query the persisted demo index
    embedder = get_embedder()
    # ② open the existing Chroma index built by index.py
    db = Chroma(persist_directory="./chroma_db", embedding_function=embedder)
    # ③ choose a sample query for reranked retrieval
    question = "What is the return policy?"
    # ④ retrieve and rerank the most relevant chunks
    results = retrieve_with_rerank(db, question)
    # ⑤ print the query and reranked chunk contents
    print(f"Q: {question}")
    for i, doc in enumerate(results):
        print(f"  {i + 1}. {doc.page_content}")
