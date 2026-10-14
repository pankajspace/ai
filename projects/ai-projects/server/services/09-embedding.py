"""Sentence Embedding & Similarity Service.

This service demonstrates how text embeddings work:
1. Encodes text into dense numeric vectors using SentenceTransformer ("all-MiniLM-L6-v2", 384 dims).
2. Computes cosine similarity between two sentences using dot product and vector norms.
3. Provides dimension count and vector preview values.

Run directly:
    python projects/ai-projects/server/services/09-embedding.py
"""

import math
import os
from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())

_model = None


def _get_sentence_transformer():
    """Lazy load SentenceTransformer to optimize startup time."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            _model = None
    return _model


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
    model = _get_sentence_transformer()

    if model is not None:
        from numpy import dot
        from numpy.linalg import norm

        # Encode both texts into 384-dimensional dense vectors
        v1 = model.encode(text1)
        v2 = model.encode(text2)

        # Compute cosine similarity
        norm_product = float(norm(v1) * norm(v2))
        similarity = float(dot(v1, v2) / norm_product) if norm_product > 0 else 0.0

        dims = int(v1.shape[0])
        preview_1 = [round(float(x), 4) for x in v1[:5]]
        preview_2 = [round(float(x), 4) for x in v2[:5]]
    else:
        # Fallback using OpenAI embeddings if sentence-transformers is not yet installed
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            from openai import OpenAI
            client = OpenAI(
                api_key=api_key,
                base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            )
            resp = client.embeddings.create(
                model="text-embedding-3-small",
                input=[text1, text2],
            )
            v1 = resp.data[0].embedding
            v2 = resp.data[1].embedding

            dot_val = sum(a * b for a, b in zip(v1, v2))
            norm1 = math.sqrt(sum(a * a for a in v1))
            norm2 = math.sqrt(sum(b * b for b in v2))
            similarity = float(dot_val / (norm1 * norm2)) if norm1 * norm2 > 0 else 0.0

            dims = len(v1)
            preview_1 = [round(x, 4) for x in v1[:5]]
            preview_2 = [round(x, 4) for x in v2[:5]]
        else:
            raise RuntimeError(
                "Neither sentence-transformers nor OPENAI_API_KEY is available for embedding."
            )

    return {
        "text1": text1,
        "text2": text2,
        "similarity": round(similarity, 4),
        "dimensions": dims,
        "preview_text1": preview_1,
        "preview_text2": preview_2,
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
