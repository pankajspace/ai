# AI Projects

A multi-container POC setup with a React (Vite) client and a FastAPI server powered by OpenAI GPT-4o mini.

## Architecture

1. **Client**: React + Vite frontend served on port `5173`.
2. **Server**: Lightweight FastAPI backend service running on port `8000` exposing the travel guide service.
3. **Orchestration**: Docker Compose manages each service as an isolated container connected over a local bridge network.

---

## Quickstart with Docker Compose

The simplest way to run both client and server together locally.

1. Ensure your `OPENAI_API_KEY` is exported or placed in a `.env` file in the root or server directory:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

2. Navigate to the project directory:
   ```bash
   cd projects/ai-projects
   ```

3. Build and start both containers:
   ```bash
   docker compose up --build
   ```
   *(To run in the background, append the `-d` flag: `docker compose up -d --build`)*

4. View live container logs:
   ```bash
   docker compose logs -f
   ```

5. Stop all running containers:
   ```bash
   docker compose down
   ```

---

## Running Individual Services with Docker

If you prefer building and running containers independently using standard Docker commands:

### 1. Run Server Service

1. Build the server image:
   ```bash
   docker build -t ai-projects-server ./server
   ```

2. Run the server container:
   ```bash
   docker run -d -p 8000:8000 -e OPENAI_API_KEY="$OPENAI_API_KEY" --name ai-projects-server ai-projects-server
   ```

### 2. Run Client Service

1. Build the client image:
   ```bash
   docker build -t ai-projects-client ./client
   ```

2. Run the client container:
   ```bash
   docker run -d -p 5173:5173 --name ai-projects-client ai-projects-client
   ```

---

## Service URLs

1. **React Client**: `http://localhost:5173`
2. **FastAPI Server**: `http://localhost:8000`
3. **Interactive Swagger API Docs**: `http://localhost:8000/docs`
4. **Health Check Endpoint**: `http://localhost:8000/health`
5. **Travel Suggestion Endpoint**: `POST http://localhost:8000/api/travel`

---

## Useful Docker Commands

1. Check container status:
   ```bash
   docker ps
   ```

2. Follow server logs:
   ```bash
   docker logs -f ai-projects-server
   ```

3. Follow client logs:
   ```bash
   docker logs -f ai-projects-client
   ```

4. Open a shell inside the server container:
   ```bash
   docker exec -it ai-projects-server sh
   ```

5. Stop and clean up standalone containers:
   ```bash
   docker stop ai-projects-server ai-projects-client
   docker rm ai-projects-server ai-projects-client
   ```
