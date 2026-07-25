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
    ├── quick-bite-eta/          # Example 1: single-container ML project
    │   ├── Dockerfile
    │   ├── app.py, train.py
    │   └── README.md
    ├── scaler-gpt/              # Example 2: two-container RAG project
    │   ├── Dockerfile
    │   ├── docker-compose.yml
    │   ├── app.py, ingest.py
    │   ├── docs/
    │   └── README.md
    └── desk-buddy/              # Example 3: three-container agentic project
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

## Example Projects (standalone)

These three directories under `src/` are self-contained Docker demo projects
from the masterclass. Each has its own Dockerfile(s), requirements, and README
with step-by-step run instructions. They are **not** part of the main Flask
app — they run independently.

### 1. QuickBite ETA (`src/quick-bite-eta/`)

ML model (sklearn + FastAPI) served in a single container. Demonstrates
Dockerfile anatomy, layer caching, port mapping, and `.dockerignore`.

```bash
cd src/quick-bite-eta
docker build -t quickbite-eta:v1 .
docker run -d -p 8000:8000 --name eta-service quickbite-eta:v1
```

### 2. ScalerGPT (`src/scaler-gpt/`)

RAG chatbot (FastAPI + OpenAI + ChromaDB) as a two-container Compose app.
Demonstrates secrets via `.env`, multi-container orchestration, service-name
networking, volumes, and the "started ≠ ready" lesson.

```bash
cd src/scaler-gpt
cp .env.example .env    # add your OPENAI_API_KEY
docker compose up -d --build
```

### 3. DeskBuddy (`src/desk-buddy/`)

Agentic system with three containers (agent + tools + Redis). Demonstrates
microservice separation, private networking (no published port), the agent
loop, and stateful memory.

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
