# 1. Base image: small official Python 3.12
FROM python:3.12-slim

# 2. Print output straight away and don't write .pyc files
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# 3. All following commands run inside /app
WORKDIR /app

# 4. Install dependencies first - Docker caches this layer until requirements.txt changes
#    4a. CPU-only PyTorch (skips ~2 GB of unused NVIDIA CUDA packages)
#    4b. Everything else; sentence-transformers reuses the torch from 4a
COPY requirements.txt .
RUN pip install --no-cache-dir torch==2.14.1 --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# 5. Download the embedding model at build time, so each run starts instantly
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# 6. Copy the script
COPY main.py .

# 7. Run it
#    - API keys come from `docker run --env-file .env` (never baked into the image)
#    - anything after the image name is passed to main.py as arguments
ENTRYPOINT ["python", "main.py"]
