"""Sentence Embeddings & Cosine Similarity.

This script demonstrates how text embeddings capture semantic meaning:
1. Encodes two sentences into 384-dimensional dense numeric vectors using the local
   `SentenceTransformer("all-MiniLM-L6-v2")` model (no API key required).
2. Computes cosine similarity (`dot(v1, v2) / (||v1|| * ||v2||)`) to measure how closely
   the two vectors point in the same semantic direction (1.0 = identical meaning, ~0.0 = unrelated).
3. Displays vector dimensionality, 5-value vector previews, and the similarity score.

Run locally (from this folder):
    pip install -r requirements.txt
    python 02_embedding.py

Run with Docker Compose (from this folder):
    docker compose run --rm 02_embedding
"""

from numpy import dot
from numpy.linalg import norm
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ① Pick two sentences to compare - uncomment another pair to test different semantic relationships
text1, text2 = "A cat is sleeping on the couch", "A kitten is napping on the sofa"  # same meaning, different words -> ~0.76
# text1, text2 = "I love pizza", "Pizza is my favourite food"                      # similar -> ~0.87
# text1, text2 = "A cat is sleeping on the couch", "The stock market fell today"   # unrelated -> ~0.0
# text1, text2 = "The bank approved my loan", "We had a picnic on the river bank"  # same word, different meaning -> ~0.29

# ---------------------------------------------------------------------------
# Embedding Model & Vector Encoding
# ---------------------------------------------------------------------------
# ② Load the compact 384-dimensional SentenceTransformer embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# ③ Encode both sentences into 384-dimensional dense vectors
v1 = model.encode(text1)
v2 = model.encode(text2)

# ---------------------------------------------------------------------------
# Cosine Similarity Calculation & Output
# ---------------------------------------------------------------------------
# ④ Compute cosine similarity using dot product divided by the product of vector norms:
#   similarity = dot(v1, v2) / (||v1|| * ||v2||)
similarity = float(dot(v1, v2) / (norm(v1) * norm(v2)))

# ⑤ Print vector dimensionality, 5-value vector previews, and cosine similarity score
print(f"Sentence 1: '{text1}'")
print(f"Sentence 2: '{text2}'")
print(f"Vector dimensions: {len(v1)}")
print(f"Vector 1 preview: {[round(float(x), 4) for x in v1[:5]]}")
print(f"Vector 2 preview: {[round(float(x), 4) for x in v2[:5]]}")
print(f"Cosine similarity: {similarity:.4f}")
