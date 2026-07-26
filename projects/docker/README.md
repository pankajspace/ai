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

### Automatic Deployment

This project is a multi-service stack, so it does **not** use the single-image
`deploy.yml.template`. The active workflow is
[.github/workflows/deploy-docker.yml](../../.github/workflows/deploy-docker.yml).
On every push to `main` that changes a file under `projects/docker/**`, it:

1. Builds one `linux/amd64` image per buildable service and pushes each to its
   own ECR repository with three tags (git SHA, build tag, `latest`):

   | Service | Build context | ECR repository |
   | --- | --- | --- |
   | `web` | `projects/docker` | `techtoday/docker-web` |
   | `quickbite` | `src/quick-bite-eta` | `techtoday/docker-quickbite` |
   | `scalergpt` | `src/scaler-gpt` | `techtoday/docker-scalergpt` |
   | `deskbuddy-agent` | `src/desk-buddy/agent` | `techtoday/docker-deskbuddy-agent` |
   | `deskbuddy-tools` | `src/desk-buddy/tools` | `techtoday/docker-deskbuddy-tools` |

   Chroma (`chromadb/chroma`) and Redis (`redis`) are public images pulled
   directly on EC2 and are not built here.
2. On EC2, pulls the five images and starts the full stack with the `level2`
   and `level3` profiles (`docker compose ... up -d --wait`), then runs
   `ingest.py` inside `scalergpt` to index its documents.

Trigger path: `projects/docker/**`. The one-time server wiring below must be
done once before the first automatic deploy succeeds.

### One-Time Production Setup

Run these once. Local commands need Docker running and the AWS CLI configured;
EC2 commands run over SSH on the app host.

1. **Create the five ECR repositories** (local):

   ```bash
   REGION=us-east-1
   for svc in web quickbite scalergpt deskbuddy-agent deskbuddy-tools; do
     aws ecr create-repository --repository-name techtoday/docker-$svc --region $REGION
   done
   ```

2. **Seed the initial images** (local, from `projects/docker/`). Later pushes
   are automated by the workflow:

   ```bash
   REGION=us-east-1
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   ECR=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
   aws ecr get-login-password --region $REGION | \
     docker login --username AWS --password-stdin $ECR

   cd projects/docker
   docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-web:latest --push .
   docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-quickbite:latest --push ./src/quick-bite-eta
   docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-scalergpt:latest --push ./src/scaler-gpt
   docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-deskbuddy-agent:latest --push ./src/desk-buddy/agent
   docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-deskbuddy-tools:latest --push ./src/desk-buddy/tools
   ```

3. **Ensure `OPENAI_API_KEY` is in the shared secret** (local). ScalerGPT and
   DeskBuddy need it; skip if it already exists in `techtoday/secrets`:

   ```bash
   CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
   UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d.setdefault('OPENAI_API_KEY','REPLACE_ME'); print(json.dumps(d))")
   aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
   ```

4. **Add the Nginx location block** (EC2). Inside the
   `server { listen 443 ssl ... server_name app.techtoday.click; }` block in
   `/etc/nginx/conf.d/app.conf`:

   ```nginx
   location /docker/ {
       proxy_pass         http://localhost:5004;
       proxy_set_header   Host $host;
       proxy_set_header   X-Real-IP $remote_addr;
       proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header   X-Forwarded-Proto $scheme;
   }
   ```

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. **Create the secrets env file** (EC2):

   ```bash
   mkdir -p ~/secrets
   aws secretsmanager get-secret-value --secret-id techtoday/secrets \
     --query SecretString --output text | \
     python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
     > ~/secrets/docker.env
   chmod 600 ~/secrets/docker.env
   ```

6. **Add the production services to `~/docker-compose.yml`** (EC2). Use the
   image URLs (not `build:`), set `PATH_PREFIX=/docker`, publish host port
   `5004`, and keep the healthchecks, `depends_on`, and volumes. Under the
   top-level `services:` key add (replace `<ECR>` with
   `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com`):

   ```yaml
     web:
       image: <ECR>/techtoday/docker-web:latest
       command: python src/python/app.py
       environment:
         - PATH_PREFIX=/docker
       env_file:
         - ~/secrets/docker.env
       ports:
         - "5004:5000"
       depends_on:
         quickbite:
           condition: service_healthy
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:5000/')"]
         interval: 5s
         timeout: 3s
         retries: 5
         start_period: 5s

     quickbite:
       image: <ECR>/techtoday/docker-quickbite:latest
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"]
         interval: 5s
         timeout: 3s
         retries: 5
         start_period: 5s

     scalergpt:
       profiles: ["level2"]
       image: <ECR>/techtoday/docker-scalergpt:latest
       env_file:
         - ~/secrets/docker.env
       environment:
         - CHROMA_HOST=scalergpt-chroma
         - CHROMA_PORT=8000
       depends_on:
         scalergpt-chroma:
           condition: service_healthy
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"]
         interval: 5s
         timeout: 3s
         retries: 5
         start_period: 10s

     scalergpt-chroma:
       profiles: ["level2"]
       image: chromadb/chroma:0.6.3
       volumes:
         - scalergpt_chroma_data:/chroma/chroma
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v2/heartbeat')"]
         interval: 5s
         timeout: 3s
         retries: 10
         start_period: 10s

     deskbuddy-agent:
       profiles: ["level3"]
       image: <ECR>/techtoday/docker-deskbuddy-agent:latest
       env_file:
         - ~/secrets/docker.env
       environment:
         - TOOLS_URL=http://deskbuddy-tools:7000
         - REDIS_HOST=deskbuddy-redis
       depends_on:
         deskbuddy-tools:
           condition: service_healthy
         deskbuddy-redis:
           condition: service_healthy
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:9000/')"]
         interval: 5s
         timeout: 3s
         retries: 5
         start_period: 10s

     deskbuddy-tools:
       profiles: ["level3"]
       image: <ECR>/techtoday/docker-deskbuddy-tools:latest
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:7000/')"]
         interval: 5s
         timeout: 3s
         retries: 5
         start_period: 5s

     deskbuddy-redis:
       profiles: ["level3"]
       image: redis:7-alpine
       volumes:
         - deskbuddy_memory:/data
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "redis-cli", "ping"]
         interval: 5s
         timeout: 3s
         retries: 5
         start_period: 5s
   ```

   Add the two named volumes to the top-level `volumes:` key if not already
   present:

   ```yaml
   volumes:
     scalergpt_chroma_data:
     deskbuddy_memory:
   ```

7. **Start the stack the first time** (EC2):

   ```bash
   REGION=us-east-1
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   aws ecr get-login-password --region $REGION | \
     docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

   docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
   docker compose -f ~/docker-compose.yml --profile level2 --profile level3 pull \
     web quickbite scalergpt deskbuddy-agent deskbuddy-tools
   docker compose -f ~/docker-compose.yml --profile level2 --profile level3 up -d --wait
   docker compose -f ~/docker-compose.yml exec -T scalergpt python ingest.py
   ```

8. **Verify** (local):

   ```bash
   curl -I https://app.techtoday.click/docker/
   ```

After this one-time setup, every push under `projects/docker/**` redeploys the
whole stack automatically.

### Production Troubleshooting

For a `502 Bad Gateway`, run on EC2:

```bash
docker compose -f ~/docker-compose.yml ps -a
docker compose -f ~/docker-compose.yml logs --tail=50 web
grep -A20 "^  web:" ~/docker-compose.yml
```

The gateway must use `command: python src/python/app.py`,
`PATH_PREFIX=/docker`, and resolvable service names matching `quickbite`,
`scalergpt`, and `deskbuddy-agent`. Validate Compose before restarting the
stack:

```bash
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/docker-compose.yml --profile level2 --profile level3 up -d --wait
```

If ScalerGPT reports no indexed documents, re-run the ingest step:

```bash
docker compose -f ~/docker-compose.yml exec -T scalergpt python ingest.py
```

### Rollback

Each service has its own ECR repository (`techtoday/docker-<service>` in
`us-east-1`) and every deploy tags images with a sortable build tag. To roll a
service back, retag the desired build as `latest` and restart it on EC2. For
the gateway:

```bash
# Run on: EC2 host
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
REPO=techtoday/docker-web
TARGET=20260701-153045-42-a1b2c3d   # a known-good build tag

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR
docker pull $ECR/$REPO:$TARGET
docker tag  $ECR/$REPO:$TARGET $ECR/$REPO:latest
docker push $ECR/$REPO:latest

docker compose -f ~/docker-compose.yml pull web
docker compose -f ~/docker-compose.yml up -d --wait web
```

Repeat with the matching `techtoday/docker-<service>` repository to roll back
any other service. Verify with `curl -I https://app.techtoday.click/docker/`.

### Manual Deployment

If CI/CD is unavailable, build and push the images from `projects/docker/` on
your local machine (Docker running), then deploy on EC2 as in step 7 above:

```bash
# Run on: local machine, from projects/docker/
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR

docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-web:latest --push .
docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-quickbite:latest --push ./src/quick-bite-eta
docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-scalergpt:latest --push ./src/scaler-gpt
docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-deskbuddy-agent:latest --push ./src/desk-buddy/agent
docker buildx build --platform linux/amd64 -t $ECR/techtoday/docker-deskbuddy-tools:latest --push ./src/desk-buddy/tools
```

If a pull on EC2 fails with `no space left on device`, reclaim space and retry:

```bash
# Run on: EC2 host
docker container prune -f
docker builder prune -af
docker image prune -af
docker compose -f ~/docker-compose.yml --profile level2 --profile level3 pull \
  web quickbite scalergpt deskbuddy-agent deskbuddy-tools
```

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


