# AI Projects Server (FastAPI)

Minimal FastAPI backend service hosting the OpenAI Travel Guide service in a multi-container architecture.

## Overview

1. Service: FastAPI application serving HTTP endpoints and integrating OpenAI `gpt-4o-mini`.
2. Architecture: Multi-container setup where each project backend runs as an isolated service alongside a single shared React client container.
3. Development mode: Supports hot-reload both locally and via Docker volume mounts.

## File Structure

1. `main.py`: FastAPI app with CORS middleware, health check, and route endpoints.
2. `services/chat_openai.py`: Self-contained service module holding schemas and OpenAI travel guide logic.
3. `services/chat_gemini.py`: Self-contained service module holding schemas and Google Gemini joke generator logic.
3. `requirements.txt`: Dependencies (`fastapi`, `uvicorn`, `openai`, `python-dotenv`).
4. `Dockerfile`: Container image build instructions for Python 3.12-slim.
5. `.dockerignore`: Excludes virtual environments, environment files, and temporary caches from container builds.
6. `.env.example`: Configuration variables for port, host, and API keys.

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
   docker run -p 8000:8000 -e OPENAI_API_KEY="$OPENAI_API_KEY" ai-projects-server
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
3. Ensure your OpenAI key is configured in the root `.env` (`projects/ai-projects/.env`).
4. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## Endpoints

1. `GET /`: Basic service status check.
2. `GET /health`: Healthcheck endpoint for Docker and monitoring.
3. `POST /api/travel`: Accepts JSON with a city (`{"city": "Bangalore"}`) and returns a witty activity suggestion from GPT-4o mini.
4. `POST /api/joke`: Accepts JSON with a topic (`{"topic": "programming"}`) and returns a funny joke from Google Gemini.
