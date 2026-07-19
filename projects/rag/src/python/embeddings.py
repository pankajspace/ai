"""Embedding demo: encode text into vectors and compute cosine similarity.

This module shows how sentence embeddings work — encode two pieces of text
into high-dimensional vectors, then measure their semantic closeness with
cosine similarity.  The embedding model (``all-MiniLM-L6-v2``) runs locally
and needs no API key.

Can be run directly:  ``docker compose run --rm embeddings``
"""

from numpy import dot
from numpy.linalg import norm

from config import get_embedder


def compare_similarity(text_a: str, text_b: str) -> float:
    """Encode two texts and return their cosine similarity (0–1).

    Args:
        text_a: First text to compare.
        text_b: Second text to compare.

    Returns:
        A float between 0 (unrelated) and 1 (semantically identical).
    """
    embedder = get_embedder()
    v1 = embedder.embed_query(text_a)
    v2 = embedder.embed_query(text_b)
    return float(dot(v1, v2) / (norm(v1) * norm(v2)))


if __name__ == "__main__":
    a = "A cat is sleeping on the couch"
    b = "A kitten is napping on the sofa"
    score = compare_similarity(a, b)
    print(f'"{a}"')
    print(f'"{b}"')
    print(f"Cosine similarity: {score:.4f}")
