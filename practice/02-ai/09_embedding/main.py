"""Sentence Embeddings & Cosine Similarity.

An embedding model turns text into a list of numbers (a vector). Sentences
with similar meaning get vectors that point in a similar direction, which we
measure with cosine similarity (1 = same meaning, ~0 = unrelated).

No API key needed - the model runs on your machine. The first local run
downloads it (~90 MB); the Docker image downloads it at build time.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py
    python main.py "I love pizza" "Pizza is my favourite food"

Run with Docker (from this folder):
    docker build -t 09_embedding .
    docker run --rm 09_embedding
    docker run --rm 09_embedding "I love pizza" "Pizza is my favourite food"
"""

import sys

from numpy import dot
from numpy.linalg import norm
from sentence_transformers import SentenceTransformer

# 1. Read two sentences from the command line (or use the defaults)
if len(sys.argv) > 2:
    text1, text2 = sys.argv[1], sys.argv[2]
else:
    text1 = "A cat is sleeping on the couch"
    text2 = "A kitten is napping on the sofa"

# 2. Load a small embedding model (384 numbers per sentence)
model = SentenceTransformer("all-MiniLM-L6-v2")

# 3. Encode each sentence into a vector
v1 = model.encode(text1)
v2 = model.encode(text2)

# 4. Cosine similarity = dot(v1, v2) / (|v1| * |v2|)
similarity = float(dot(v1, v2) / (norm(v1) * norm(v2)))

# 5. Print the results
print(f"Sentence 1: '{text1}'")
print(f"Sentence 2: '{text2}'")
print(f"Vector dimensions: {len(v1)}")
print(f"Vector 1 preview: {[round(float(x), 4) for x in v1[:5]]}")
print(f"Vector 2 preview: {[round(float(x), 4) for x in v2[:5]]}")
print(f"Cosine similarity: {similarity:.4f}")
