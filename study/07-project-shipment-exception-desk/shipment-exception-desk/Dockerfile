FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src:/app

WORKDIR /app

# Install dependencies first for Docker caching
COPY src/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . /app

EXPOSE 8080

# Default to running the Gradio web UI
CMD ["python", "app.py"]

