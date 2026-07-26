# Docker Demo Lab

Interactive demos of three Docker projects from the Docker masterclass — from
a single ML container to a multi-service agentic system. Built with Flask +
Docker, wired for the shared Nginx path-prefix routing.

Each example lives under `src/` with its own Dockerfile(s), docker-compose
config, and runs as a separate service within the main compose file. The Flask
app proxies browser requests to each internal service.

---

## Development and Deployment

### Prerequisites

Complete the one-time Docker setup in [../SETUP.md](../SETUP.md). This project
needs Docker Engine and the Docker Compose v2 plugin; Python and Node.js are not
required on the host. Verify both Docker components before continuing:

```bash
docker info
docker compose version
```

On Linux, start the daemon with `sudo systemctl start docker`. If Docker reports
a socket permission error after adding yourself to the `docker` group, log out
and back in. On macOS or Windows, start Docker Desktop and wait until it reports
that Docker is running.

### Environment Setup

Start at the repository root, then enter the project directory. Run all local
Docker commands in the rest of this guide from `projects/docker/`:

```bash
cd projects/docker
```

### First Run: Level 1 (No API Key)

One command builds and starts the default gateway plus QuickBite example in
detached mode. No `.env` file or API key is needed. `--wait` prevents the
command from returning until both healthchecks pass:

```bash
docker compose up -d --build --wait
```

Open <http://localhost:8083>. Verify the gateway and prediction route from the
terminal if needed:

```bash
curl -I http://localhost:8083/
curl -X POST http://localhost:8083/quickbite/predict \
  -H "Content-Type: application/json" \
  -d '{"distance_km":3.2,"prep_time_min":12,"rider_available":1,"is_raining":0}'
```

If Compose does not recognize `--wait`, update the Compose v2 plugin. As a
temporary fallback, omit `--wait` and run `docker compose ps` until `web` and
`quickbite` both show `healthy` before opening the URL.

### Run Level 2: ScalerGPT

Create `.env`, add a real `OPENAI_API_KEY`, then enable the Level 2 profile.
Compose automatically starts the gateway plus the QuickBite and Chroma
dependencies:

```bash
cp .env.example .env
docker compose --profile level2 up -d --build --wait
```

ScalerGPT cannot answer until its sample notes have been embedded into Chroma.
Run this once on first startup and again after changing files under
`src/scaler-gpt/docs/`:

```bash
docker compose exec scalergpt python ingest.py
curl http://localhost:8083/scalergpt/status
```

The status response should report `docs_indexed` greater than zero. Ingestion
and questions make paid OpenAI API calls.

### Run Level 3: DeskBuddy

With a real `OPENAI_API_KEY` in `.env`, enable the Level 3 profile. Compose
automatically starts the gateway, QuickBite, the agent, the private tools
service, and Redis:

```bash
docker compose --profile level3 up -d --build --wait
curl http://localhost:8083/deskbuddy/status
```

Use the DeskBuddy form at <http://localhost:8083>. Redis stores conversation
history by `session_id` in the `deskbuddy_memory` volume.

### Run All Levels

A real `OPENAI_API_KEY` is required. Start all seven services, then ingest the
ScalerGPT documents:

```bash
docker compose --profile level2 --profile level3 up -d --build --wait
docker compose exec scalergpt python ingest.py
docker compose ps
```

Use `-d` for normal development. Running `docker compose up --build` without
`-d` attaches the terminal to all logs; pressing `Ctrl+C` then stops the stack.

### Daily Development

The gateway mounts `src/` into the `web` container. HTML, CSS, and JavaScript
changes are visible after a browser refresh. After changing
`src/python/app.py`, restart the Python process and wait for it to become ready:

```bash
docker compose restart web
docker compose up -d --wait web
```

Rebuild `web` after changing its `Dockerfile` or root `requirements.txt`:

```bash
docker compose up -d --build --wait web
```

The three example projects are copied into their images, not mounted. Rebuild
the service whose source or dependencies changed:

```bash
docker compose up -d --build --wait quickbite
docker compose up -d --build --wait scalergpt
docker compose up -d --build --wait deskbuddy-agent
docker compose up -d --build --wait deskbuddy-tools
```

After changing `.env`, recreate the key-dependent containers so they receive
the new value:

```bash
docker compose up -d --force-recreate --wait scalergpt deskbuddy-agent
```

Inspect status, logs, or a container shell with:

```bash
docker compose ps -a
docker compose logs --tail=100 web quickbite
docker compose logs --tail=100 scalergpt scalergpt-chroma
docker compose logs --tail=100 deskbuddy-agent deskbuddy-tools deskbuddy-redis
docker compose logs -f web
docker compose exec web sh
docker compose exec scalergpt sh
```

`Ctrl+C` stops log following without stopping detached containers.

Stop containers while preserving Chroma and Redis data:

```bash
docker compose down
```

Delete containers and both persistent data volumes only when a clean reset is
intended:

```bash
docker compose down -v
```

### Local Troubleshooting

Start with container state and the logs for any service that is `unhealthy`,
`restarting`, `exited`, or missing from the normal `docker compose ps` output:

```bash
docker compose ps -a
docker compose logs --tail=100 web quickbite
docker compose logs --tail=100 scalergpt scalergpt-chroma
docker compose logs --tail=100 deskbuddy-agent deskbuddy-tools deskbuddy-redis
```

Common failures:

1. **`.env` does not exist:** Level 1 does not need it. For Level 2 or 3, run
    `cp .env.example .env` and add a real API key.
2. **`OPENAI_API_KEY is missing`:** put a real key in `.env`, then recreate the
    key-dependent services with
    `docker compose up -d --force-recreate --wait scalergpt deskbuddy-agent`.
3. **OpenAI `401`, `AuthenticationError`, or `insufficient_quota`:** replace the
    key or add API credit; a ChatGPT subscription does not include API credit.
4. **ScalerGPT says no documents are indexed:** run
    `docker compose exec scalergpt python ingest.py`.
5. **A first request resets or refuses the connection:** use the documented
    `--wait` startup command and confirm the gateway is `healthy`.
6. **`port 8083 is already allocated`:** stop this stack with
    `docker compose down`, or identify the other listener with
    `sudo lsof -i :8083`.
7. **A dependency fails its healthcheck:** inspect its logs and health details:

```bash
docker inspect --format '{{.Name}} {{json .State.Health}}' \
    docker-quickbite docker-scalergpt docker-scalergpt-chroma \
    docker-deskbuddy-agent docker-deskbuddy-tools docker-deskbuddy-redis
```

For a clean local recovery that preserves data, remove stale containers and
rebuild:

```bash
docker compose down --remove-orphans
docker compose up -d --build --wait
```

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

---

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

## Project Details

1. **Type:** Container app.
2. **Folder:** `projects/docker/`.
3. **Production URL:** `https://app.techtoday.click/docker/`.
4. **Local dev URL:** `http://localhost:8083`.
5. **Container port:** `5000`.
6. **EC2 host port:** `5003`.
7. **ECR repository:** `techtoday/docker`.
8. **Path prefix:** `PATH_PREFIX=/docker`.
9. **Production service name:** `docker`.
10. **Workflow:** `.github/workflows/deploy-docker.yml` (not yet created).
11. **Intended workflow trigger:** changes under `projects/docker/**`.

## Routes

Locally, routes have no prefix. In production, prepend `/docker`:

1. `GET /` — Demo Lab UI.
2. `POST /quickbite/predict` — Proxy to QuickBite ETA.
3. `GET /quickbite/status` — QuickBite health through the gateway.
4. `POST /scalergpt/ask` — Proxy to ScalerGPT.
5. `GET /scalergpt/status` — ScalerGPT health and document count.
6. `POST /deskbuddy/chat` — Proxy to DeskBuddy.
7. `GET /deskbuddy/status` — DeskBuddy health through the gateway.

## Environment Variables

1. `OPENAI_API_KEY` — Required by ScalerGPT for embeddings and chat, and by
    DeskBuddy for agent chat. Obtain it from the OpenAI API dashboard. The
    placeholder is sufficient only for Level 1.
2. `PATH_PREFIX` — Optional gateway setting. Leave it unset locally; production
    must set it to `/docker`.
3. `CHROMA_HOST` and `CHROMA_PORT` — Set by Compose for ScalerGPT; do not add
    them to local `.env`.
4. `TOOLS_URL` and `REDIS_HOST` — Set by Compose for DeskBuddy; do not add them
    to local `.env`.

## Quick Start

```bash
cd projects/docker
docker compose up -d --build --wait
```

The Docker command builds and runs the keyless QuickBite example. Open
<http://localhost:8083>. Follow the level-specific sections above before
starting ScalerGPT or DeskBuddy.


