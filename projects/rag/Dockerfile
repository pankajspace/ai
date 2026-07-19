FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
# Install PyTorch CPU-only first — skips ~2 GB of unnecessary NVIDIA CUDA
# libraries that torch pulls by default. This project runs on CPU only.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

ENV PYTHONPATH=src

EXPOSE 5000
