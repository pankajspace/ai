# ==============================================================================
# AI POCs: FastAPI Backend Dockerfile
# Optimized for fast builds using Astral 'uv' and BuildKit wheel caching.
# Works seamlessly on local development (macOS) and cloud deployments (Linux CPU/GPU).
# ==============================================================================

# 1. Base Image: Lightweight official Python 3.12 Debian slim
# Keeps container image size minimal while providing essential runtime tools
FROM python:3.12-slim

# 2. Package Installer: Astral 'uv'
# uv is an extremely fast Python package and resolver written in Rust.
# It downloads wheels concurrently across all CPU cores and unzips them in parallel,
# dropping build times from several minutes down to seconds.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 3. Working Directory
# All subsequent commands (COPY, RUN, CMD) execute inside /app
WORKDIR /app

# 4. Dependency Caching Layer
# Copy only requirements.txt first to take advantage of Docker layer caching.
# Docker reuses this layer as long as requirements.txt does not change.
COPY requirements.txt .

# 5. Fast Dependency Installation with BuildKit Cache Mount
# - Step A: Install CPU-only PyTorch from PyTorch's official CPU repository.
#   This completely stops downloading ~1.5 GB of unused NVIDIA CUDA / cuDNN wheels.
# - Step B: Install remaining application dependencies from requirements.txt.
#   Since PyTorch is already installed, sentence-transformers and transformers
#   will reuse it and will never pull in any NVIDIA packages.
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install --system --index-url https://download.pytorch.org/whl/cpu torch && \
    uv pip install --system -r requirements.txt

# 6. Application Source Code
# Copy server application files into the container. Placed after dependency
# install so application code changes do not trigger a full package re-install.
COPY . .

# 7. Port Documentation
# Informs Docker that FastAPI Uvicorn listens on port 8000 at runtime.
EXPOSE 8000

# 8. Container Entrypoint
# Starts FastAPI server with Uvicorn:
# - 'main:app': Refers to the FastAPI application instance in main.py
# - '--host 0.0.0.0': Listens on all container interfaces for incoming network traffic
# - '--port 8000': Matches the exposed port mapped in docker-compose.yml
# - '--reload': Enables hot-reload for code edits during local development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
