# Docker Quiz Lab

An interactive Docker quiz app that tests your knowledge of Docker concepts,
commands, and best practices — drawn from the study notes. Built with
Flask + Docker, wired for the shared Nginx path-prefix routing.

This project also contains **three standalone example projects** from the Docker
masterclass, each demonstrating increasingly complex Docker patterns. Each
example lives under `src/` with its own Dockerfile(s) and runs independently.

---

## Quick Start

```bash
# 1. Copy .env (no keys needed — quiz is keyless)
cp .env.example .env

# 2. Start Docker Desktop, then:
docker compose up web

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

1. `/docker/` — Single-page quiz UI.
2. `POST /docker/quiz` — Returns a random Docker question with 4 choices.
3. `POST /docker/quiz/check` — Validates the user's answer and returns the explanation.

## Environment Variables

1. `PATH_PREFIX` — Set to `/docker` in production; empty locally.

No API keys required. The quiz runs entirely from a built-in question bank.

## Project Structure

```
projects/docker/
├── Dockerfile                   # Main project (quiz web app)
├── docker-compose.yml           # Quiz app compose (port 8083:5000)
├── requirements.txt
├── .env.example
├── .gitignore
├── deploy.yml.template
├── README.md
└── src/
    ├── index.html               # Quiz UI
    ├── css/style.css            # Dark theme + quiz styles
    ├── js/main.js               # Quiz interaction logic
    ├── python/                  # Quiz app Python source
    │   ├── app.py               # Flask server (Blueprint + PATH_PREFIX)
    │   ├── config.py            # .env loader
    │   └── quiz.py              # Question bank + get/check functions
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

## Features

### Docker Quiz (keyless)

~20 questions covering:
- Dockerfile anatomy (FROM, WORKDIR, COPY, RUN, CMD, EXPOSE)
- Layer caching and build optimization
- Docker Compose (services, volumes, networking)
- Port mapping (host vs container, internal vs published)
- Secrets management (.env, env_file, never ENV in Dockerfile)
- Debugging commands (ps -a, logs, exec)
- Volumes (persistent data, down vs down -v)
- Container networking (service names, internal ports)

---

## Example Projects (standalone, simpler → complex)

Three self-contained Docker demo projects from the masterclass, ordered by
complexity. Each has its own Dockerfile(s), requirements, and README with
step-by-step run instructions. They are **not** part of the main Flask app —
they run independently.

### Level 1 — QuickBite ETA (`src/quick-bite-eta/`) · 1 container

ML model (sklearn + FastAPI) served in a **single container** via
`docker build` + `docker run`. Covers the Docker fundamentals: Dockerfile
anatomy, layer caching, port mapping, `.dockerignore`, and the photograph rule.
No API keys required.

```bash
cd src/quick-bite-eta
docker build -t quickbite-eta:v1 .
docker run -d -p 8000:8000 --name eta-service quickbite-eta:v1
```

### Level 2 — ScalerGPT (`src/scaler-gpt/`) · 2 containers

RAG chatbot (FastAPI + OpenAI + ChromaDB) as a **two-container** Compose app.
Builds on Level 1 by adding secrets via `.env`, multi-container orchestration
with `docker compose`, service-name networking, volumes for persistent data,
and the "started ≠ ready" lesson with retry loops. Requires `OPENAI_API_KEY`.

```bash
cd src/scaler-gpt
cp .env.example .env    # add your OPENAI_API_KEY
docker compose up -d --build
```

### Level 3 — DeskBuddy (`src/desk-buddy/`) · 3 containers

Agentic AI system with **three containers** (agent + tools + Redis), each
with its own Dockerfile and code. Builds on Level 2 by adding microservice
separation, private networking (tools has no published port), the agent
think→act→observe loop, and stateful conversation memory. Requires
`OPENAI_API_KEY`.

```bash
cd src/desk-buddy
cp .env.example .env    # add your OPENAI_API_KEY
docker compose up -d --build
```

---

## Deployment

Copy `deploy.yml.template` to `.github/workflows/deploy-docker.yml` and replace
every `PROJECT_NAME` token with `docker`. See `projects/PROJECTS.md` for full
instructions.
