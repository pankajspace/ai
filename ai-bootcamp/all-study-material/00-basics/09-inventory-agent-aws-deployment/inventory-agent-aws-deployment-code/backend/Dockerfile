FROM python:3.11-slim

# Set working directory to app root so relative paths (../db/) work correctly
WORKDIR /app

# Copy backend source and db schema
COPY backend/ ./backend/
COPY db/schema.sql ./db/schema.sql

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt

# The SQLite file lives on a persistent volume mounted at /app/data (EFS on AWS).
# NOTE: this is deliberately NOT /app/db — mounting there would hide schema.sql.
ENV DB_PATH=/app/data/inventory.db
ENV PORT=8000

EXPOSE 8000

# Health check without curl (not installed in python:slim)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,os; urllib.request.urlopen('http://127.0.0.1:' + os.environ.get('PORT','8000') + '/health', timeout=4)" || exit 1

# init_db.py is idempotent: creates schema + seeds sample data if not present
CMD ["sh", "-c", "python init_db.py && uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
