FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
# Install PyTorch CPU-only first — skips ~2 GB of unnecessary NVIDIA CUDA
# libraries that torch pulls by default. This project runs on CPU only.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the embedding + reranker models so they're baked into the image
# and don't need to be fetched at container startup (which can be slow or hang).
# Both downloads share one layer so they're cached (and restored) as a unit.
RUN python -c "from sentence_transformers import SentenceTransformer, CrossEncoder; SentenceTransformer('all-MiniLM-L6-v2'); CrossEncoder('cross-encoder/ms-marco-MiniLM-L6-v2')"

COPY src/ ./src/

ENV PYTHONPATH=src/python
# Model is baked in — tell HuggingFace to never contact the Hub at runtime.
# This eliminates the "unauthenticated requests" warning and prevents hangs.
ENV HF_HUB_OFFLINE=1

EXPOSE 5000
