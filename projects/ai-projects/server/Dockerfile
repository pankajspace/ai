# Use an official lightweight Python runtime as the base image
# Debian-based 'slim' reduces image size while retaining essential runtime dependencies
FROM python:3.12-slim

# Set the working directory inside the container
# All subsequent instructions (COPY, RUN, CMD) run relative to this path
WORKDIR /app

# Copy dependency definition file first to leverage Docker layer caching.
# Docker reuses cached layers if requirements.txt hasn't changed, speeding up rebuilds.
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir prevents pip from saving download cache files, keeping the image size small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code into the container
COPY . .

# Inform Docker that the container listens on port 8000 at runtime.
# Note: EXPOSE serves as documentation; port mapping (-p 8000:8000) is still required at run time.
EXPOSE 8000

# Start the FastAPI/ASGI server using Uvicorn
# - "main:app": Entry point pointing to the FastAPI instance `app` in `main.py`
# - "--host", "0.0.0.0": Bind to all network interfaces so external requests reach the container
# - "--port", "8000": Port to listen on
# - "--reload": Enable hot-reloading for code changes during development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
