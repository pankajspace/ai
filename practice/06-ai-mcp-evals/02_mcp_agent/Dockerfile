# 1. Base image: small official Python 3.12
FROM python:3.12-slim

# 2. Print output straight away and don't write .pyc files
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# 3. All following commands run inside /app
WORKDIR /app

# 4. Install dependencies first - Docker caches this layer until requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the script and the MCP server
COPY cricket_server.py .
COPY main.py .

# 6. Run it
ENTRYPOINT ["python", "main.py"]

