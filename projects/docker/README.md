# Docker Demo Lab

Interactive demos of three Docker projects from the Docker masterclass — from
a single ML container to a multi-service agentic system. Built with Flask +
Docker, wired for the shared Nginx path-prefix routing.

Each example lives under `src/` with its own Dockerfile(s), docker-compose
config, and runs as a separate service within the main compose file. The Flask
app proxies browser requests to each internal service.

---

## Quick Start

```bash
# 1. Copy .env
cp .env.example .env    # add OPENAI_API_KEY for Level 2 & 3

# 2. Start Docker Desktop, then:
docker compose up web quickbite -d        # Level 1 (keyless)
docker compose up -d                      # all 3 levels (needs API key for 2 & 3)

# 3. Open http://localhost:8083
```

---

## Project Details

1. **Type:** Container app.
2. **Folder:** `projects/docker/`.
3. **Production URL:** `https://app.techtoday.click/docker/`.
4. **Local dev URL:** `http://localhost:8083`.
5. **Container port:** `5000`.
6. **EC2 host port:** `5003`.
7. **ECR repository:** `techtoday/docker`.
8. **Path prefix:** `PATH_PREFIX=/docker`.

## Routes

1. `/docker/` — Demo Lab UI.
2. `POST /docker/quickbite/predict` — Proxy to QuickBite ETA service.
3. `POST /docker/scalergpt/ask` — Proxy to ScalerGPT service.
4. `POST /docker/deskbuddy/chat` — Proxy to DeskBuddy agent service.

## Environment Variables

1. `PATH_PREFIX` — Set to `/docker` in production; empty locally.
2. `OPENAI_API_KEY` — Required for ScalerGPT and DeskBuddy demos.

## Project Structure

```
projects/docker/
├── Dockerfile                   # Main project (Flask proxy + static UI)
├── docker-compose.yml           # All services (web + 3 example projects)
├── requirements.txt
├── .env.example
├── .gitignore
├── deploy.yml.template
├── README.md
└── src/
    ├── index.html               # Demo Lab UI
    ├── css/style.css            # Dark theme + demo form styles
    ├── js/main.js               # Demo interaction logic
    ├── python/                  # Flask proxy server
    │   ├── app.py               # Routes + proxy to internal services
    │   └── config.py            # .env loader
    ├── quick-bite-eta/          # Level 1 — 1 container (ML)
    │   ├── Dockerfile
    │   ├── app.py, train.py
    │   └── README.md
    ├── scaler-gpt/              # Level 2 — 2 containers (LLM + RAG)
    │   ├── Dockerfile
    │   ├── docker-compose.yml
    │   ├── app.py, ingest.py
    │   ├── docs/
    │   └── README.md
    └── desk-buddy/              # Level 3 — 3 containers (Agents)
        ├── docker-compose.yml
        ├── agent/ (Dockerfile + app.py)
        ├── tools/ (Dockerfile + app.py)
        └── README.md
```

---

## Example Projects (simpler → complex)

Three live Docker demo projects from the masterclass. Each runs as an
internal service and is accessible through the Flask proxy UI.

### Level 1 — QuickBite ETA (`src/quick-bite-eta/`) · 1 container

ML model (sklearn + FastAPI) served in a **single container** via
`docker build` + `docker run`. Covers the Docker fundamentals: Dockerfile
anatomy, layer caching, port mapping, `.dockerignore`, and the photograph rule.
No API keys required.

### Level 2 — ScalerGPT (`src/scaler-gpt/`) · 2 containers

RAG chatbot (FastAPI + OpenAI + ChromaDB) as a **two-container** Compose app.
Builds on Level 1 by adding secrets via `.env`, multi-container orchestration
with `docker compose`, service-name networking, volumes for persistent data,
and the "started ≠ ready" lesson with retry loops. Requires `OPENAI_API_KEY`.

### Level 3 — DeskBuddy (`src/desk-buddy/`) · 3 containers

Agentic AI system with **three containers** (agent + tools + Redis), each
with its own Dockerfile and code. Builds on Level 2 by adding microservice
separation, private networking (tools has no published port), the agent
think→act→observe loop, and stateful conversation memory. Requires
`OPENAI_API_KEY`.

---

## Deployment

Copy `deploy.yml.template` to `.github/workflows/deploy-docker.yml` and replace
every `PROJECT_NAME` token with `docker`. See `projects/PROJECTS.md` for full
instructions.
