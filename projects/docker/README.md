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

## Development and Deployment

### Prerequisites and First Run

Complete the one-time setup in [../SETUP.md](../SETUP.md), start Docker, and
verify the daemon with `docker info`. Then run from the repository root:

```bash
cd projects/docker
cp .env.example .env
docker compose build web quickbite
docker compose up web quickbite
```

Open http://localhost:8083. This starts the keyless Level 1 demo. Source edits
to the gateway UI and Flask app under `src/` are mounted into `web`; rebuild a
standalone example service after changing its files.

To run all levels, add `OPENAI_API_KEY` to `.env`, then start the full stack:

```bash
docker compose up --build
```

Useful local commands:

```bash
docker compose ps
docker compose logs -f web quickbite
docker compose logs -f scalergpt scalergpt-chroma
docker compose logs -f deskbuddy-agent deskbuddy-tools deskbuddy-redis
docker compose down
docker compose down -v  # Also deletes Chroma and Redis demo data
```

On Linux, start Docker with `sudo systemctl start docker`. On macOS or Windows,
start Docker Desktop and wait until Docker reports that it is running.

### Commit

Create a feature branch and commit only this project from the repository root:

```bash
git checkout main && git pull origin main
git checkout -b feat/docker-short-description
git add projects/docker/
git commit -m "feat(docker): short description"
git push -u origin feat/docker-short-description
```

Open a pull request and squash-merge it into `main` after review.

### Production Deployment Status

Automatic deployment is not currently enabled: the repository does not contain
`.github/workflows/deploy-docker.yml`. The supplied `deploy.yml.template` builds
and publishes only the main Flask gateway image. It does not publish the
QuickBite, ScalerGPT, or DeskBuddy images, and its `--no-deps` deployment cannot
start those required services on EC2.

Before enabling production deployment, extend the deployment design so the
production Compose file has deployable images for all five application services
plus the Chroma and Redis dependencies. Then create the workflow from the
repository root and replace all placeholders:

```bash
cp projects/docker/deploy.yml.template .github/workflows/deploy-docker.yml
sed -i 's/PROJECT_NAME/docker/g' .github/workflows/deploy-docker.yml  # Linux
grep -n PROJECT_NAME .github/workflows/deploy-docker.yml             # No output expected
```

On macOS, use `sed -i '' 's/PROJECT_NAME/docker/g'` instead. Do not treat the
template-only workflow as a complete deployment for this multi-service project.

Once the workflow and production services are complete, changes under
`projects/docker/**` should publish to `techtoday/docker`, restart the `docker`
gateway and its required services, and be verified with:

```bash
curl -I https://app.techtoday.click/docker/
```

### Production Troubleshooting

For a `502 Bad Gateway`, run on EC2:

```bash
docker compose -f ~/docker-compose.yml ps
docker compose -f ~/docker-compose.yml logs --tail=50 docker
grep -A20 "^  docker:" ~/docker-compose.yml
```

The gateway must use `command: python src/python/app.py`,
`PATH_PREFIX=/docker`, and resolvable service names matching `quickbite`,
`scalergpt`, and `deskbuddy-agent`. Validate Compose before restarting the
affected services:

```bash
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/docker-compose.yml up -d docker
```

Rollback and manual deployment commands should be added here together with the
completed multi-image production workflow; the single-image procedure used by
the other container apps is not sufficient for this project.
