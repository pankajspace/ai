"""Sentence Embedding & Similarity Service.

This service demonstrates how text embeddings work:
1. Encodes text into dense numeric vectors using SentenceTransformer ("all-MiniLM-L6-v2", 384 dims).
2. Computes cosine similarity between two sentences using dot product and vector norms.
3. Provides dimension count and vector preview values.

Run directly:
    python projects/ai-pocs/server/services/09_embedding.py
"""

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field
from numpy import dot
from numpy.linalg import norm
from sentence_transformers import SentenceTransformer

load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class EmbeddingRequest(BaseModel):
    """Input payload for text embedding and similarity comparison."""

    text1: str = Field(
        default="A cat is sleeping on the couch",
        description="First text to encode",
    )
    text2: str = Field(
        default="A kitten is napping on the sofa",
        description="Second text to encode and compare",
    )


class EmbeddingResponse(BaseModel):
    """Output payload containing similarity score and vector previews."""

    text1: str
    text2: str
    similarity: float
    dimensions: int
    preview_text1: list[float]
    preview_text2: list[float]


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
_embedding_model: SentenceTransformer | None = None


def compute_similarity(
    text1: str = "A cat is sleeping on the couch",
    text2: str = "A kitten is napping on the sofa",
) -> dict:
    """Compute embeddings for two texts and calculate their cosine similarity.

    Args:
        text1: First input text.
        text2: Second input text.

    Returns:
        Dictionary matching EmbeddingResponse fields.
    """
    global _embedding_model
    # ① Load (or reuse cached) compact 384-dimensional SentenceTransformer embedding model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    model = _embedding_model

    # ② Encode both texts into 384-dimensional dense vectors
    v1 = model.encode(text1)
    v2 = model.encode(text2)

    # ③ Compute cosine similarity using dot product divided by the product of vector norms
    norm_product = float(norm(v1) * norm(v2))
    similarity = float(dot(v1, v2) / norm_product) if norm_product > 0 else 0.0

    # ④ Return similarity score, vector dimensionality, and 5-value vector previews
    return {
        "text1": text1,
        "text2": text2,
        "similarity": round(similarity, 4),
        "dimensions": int(v1.shape[0]),
        "preview_text1": [round(float(x), 4) for x in v1[:5]],
        "preview_text2": [round(float(x), 4) for x in v2[:5]],
    }


# ---------------------------------------------------------------------------
# Standalone CLI Verification
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("--- Sentence Embedding & Similarity Service ---")
    s1 = "A cat is sleeping on the couch"
    s2 = "A kitten is napping on the sofa"
    result = compute_similarity(s1, s2)
    print(f"Sentence 1: '{s1}'")
    print(f"Sentence 2: '{s2}'")
    print(f"Vector dimensions: {result['dimensions']}")
    print(f"Vector 1 preview: {result['preview_text1']}")
    print(f"Vector 2 preview: {result['preview_text2']}")
    print(f"Cosine similarity: {result['similarity']}")
