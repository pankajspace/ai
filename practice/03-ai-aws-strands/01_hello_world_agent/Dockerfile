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

# 5. Copy the script
COPY main.py .

# 6. Run it
#    - AWS keys and configuration come from `docker run --env-file .env` (never baked into the image)
#    - anything after the image name is passed to main.py as arguments
ENTRYPOINT ["python", "main.py"]
