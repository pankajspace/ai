# ── Stage 1: dependency installer ──────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install dependencies into an isolated prefix so the runtime stage stays lean
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: runtime image ──────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Port the FastAPI / uvicorn server listens on
EXPOSE 7860

# Run as non-root for better security
RUN adduser --disabled-password --gecos "" appuser
USER appuser

CMD ["python", "app.py"]
