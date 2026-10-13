# AI Projects Server (FastAPI)

Minimal FastAPI backend service designed for a multi-container Docker Compose architecture.

## Overview

1. Service: FastAPI application serving HTTP endpoints.
2. Architecture: Multi-container setup where each project backend runs as an isolated service alongside a single shared React client container.
3. Development mode: Supports hot-reload both locally and via Docker volume mounts.

## File Structure

1. `main.py`: Single-file FastAPI app with CORS middleware and sample endpoints.
2. `requirements.txt`: Minimal dependencies (`fastapi` and `uvicorn`).
3. `Dockerfile`: Container image build instructions for Python 3.12-slim.
4. `.dockerignore`: Excludes virtual environments and temporary files from container builds.
5. `.env.example`: Configuration variables for port and host.

## Running the Server

### Option 1: Multi-Container via Docker Compose (Recommended)

From the project root (`projects/ai-projects/`):

1. Start all services (client and server):
   ```bash
   docker compose up --build
   ```
2. Access the server at `http://localhost:8000`.
3. Access interactive Swagger documentation at `http://localhost:8000/docs`.
4. Access the React client at `http://localhost:5173`.

### Option 2: Standalone Container

From the `projects/ai-projects/server` directory:

1. Build the Docker image:
   ```bash
   docker build -t ai-projects-server .
   ```
2. Run the container:
   ```bash
   docker run -p 8000:8000 ai-projects-server
   ```

### Option 3: Local Python Execution

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## Endpoints

1. `GET /`: Basic service status check.
2. `GET /health`: Healthcheck endpoint for Docker and monitoring.
3. `GET /api/items`: Returns sample list of items.
4. `POST /api/items`: Accepts a JSON item (`{"title": "...", "description": "..."}`) and adds it to the list.
5. `GET /api/items/{item_id}`: Retrieves an item by its ID.

