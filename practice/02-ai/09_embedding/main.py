"""Sentence Embeddings & Cosine Similarity.

An embedding model turns text into a list of numbers (a vector). Sentences
with similar meaning get vectors that point in a similar direction, which we
measure with cosine similarity (1 = same meaning, ~0 = unrelated).
To compare other sentences, change the pair in step 1.

No API key needed - the model runs on your machine. The first local run
downloads it (~90 MB); the Docker image downloads it at build time.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 09_embedding .
    docker run --rm 09_embedding
"""

from numpy import dot
from numpy.linalg import norm
from sentence_transformers import SentenceTransformer

# 1. Inputs - two sentences to compare; uncomment another pair to try it
text1, text2 = "A cat is sleeping on the couch", "A kitten is napping on the sofa"  # same meaning, different words -> ~0.76
# text1, text2 = "I love pizza", "Pizza is my favourite food"                      # similar -> ~0.87
# text1, text2 = "A cat is sleeping on the couch", "The stock market fell today"   # unrelated -> ~0.0
# text1, text2 = "The bank approved my loan", "We had a picnic on the river bank"  # same word, different meaning -> ~0.29

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
