# AI Agents on AWS — Strands SDK

Interactive agent demos from the **AI Agents on AWS** masterclass, served through a Flask web UI running in a Docker container. Each tile runs a real [Strands SDK](https://github.com/strands-agents) agent on Amazon Bedrock, covering the masterclass's core patterns:

- **Hello World Agent** — the simplest possible agent, no tools.
- **Math Assistant** — a pre-built `calculator` tool plus a system prompt.
- **Tip Calculator** — a single custom tool that understands intent.
- **Inventory Checker** — a custom tool backed by a mock database.
- **Sales Report Agent** — multi-tool planning (query → analyse → email).
- **Inventory Manager** — class-based, stateful tools sharing one store.
- **Warehouse Check** — async tools running lookups in parallel.
- **Travel Assistant** — the multi-tool capstone (weather, packing, budget).

The demos call Amazon Bedrock at runtime, so AWS credentials with Bedrock model access are required (supplied locally via `.env`, and by the EC2 instance role in production).

---

## Development and Deployment

### Prerequisites

Complete the one-time machine and AWS setup in [../SETUP.md](../SETUP.md). Every
Docker command requires a running Docker daemon:

```bash
# Linux
sudo systemctl start docker

# macOS or Windows: start Docker Desktop, then verify on any OS
docker info
```

### First Local Run

From the repository root:

```bash
cd projects/aws-strands
cp .env.example .env
docker compose build web
docker compose up web
```

Open http://localhost:8084. Source files under `src/` are mounted into the
container, so normal source edits do not require an image rebuild. Rebuild
after changing `Dockerfile` or `requirements.txt`:

```bash
docker compose build web
```

Useful local commands:

```bash
docker compose logs -f web
docker compose run --rm web bash
docker compose ps
docker compose down
```

### Refresh Local AWS Credentials

The demos call Amazon Bedrock, so `.env` needs valid AWS credentials. Locally
these come from `aws login` (short-lived session credentials) — when they
expire you'll see errors like `ExpiredTokenException` or "Unable to locate
credentials" in the tiles. To refresh:

```bash
# 1. Re-authenticate (opens a browser; sign in as the techtoday IAM user)
aws login
aws sts get-caller-identity          # confirm it prints the techtoday ARN

# 2. Export the fresh credentials into this project's .env
cd projects/aws-strands
{ aws configure export-credentials --format env-no-export; echo "AWS_DEFAULT_REGION=us-east-1"; } > .env

# 3. Recreate the container so it picks up the new .env
docker compose up -d --force-recreate web
```

> Session credentials expire after a few hours — just repeat these steps. For a
> non-expiring alternative, configure a long-term IAM access key with
> `aws configure` (see [SETUP.md § 2.1](../SETUP.md)); the `export-credentials`
> and recreate steps are identical. Production is unaffected either way — EC2
> uses the instance role, not `.env`.

### Production Setup (Automated)

No manual server wiring is required. The self-provisioning workflow
(`.github/workflows/deploy-aws-strands.yml`) creates everything on its first run
and keeps it current on every later push:

- creates the ECR repository `techtoday/aws-strands` if missing;
- builds and pushes the image;
- ensures the `app-locations/*.conf` include in the `app.techtoday.click` SSL
  server block, then drops the `/aws-strands/` Nginx location (host port `5004`);
- regenerates `~/secrets/aws-strands.env` from the shared `techtoday/secrets`;
- writes the per-project Compose file `~/apps/aws-strands/docker-compose.yml`
  (`PATH_PREFIX=/aws-strands`, published port `5004:5000`), then pulls and
  restarts the container.

Two things are **not** automated and must be in place for the demos to work in
production:

1. **Bedrock access via the instance role.** Production containers hold no AWS
   keys — `boto3` uses the EC2 instance role (`ec2-techtoday-server-role`)
   through IMDS. That role must grant `bedrock:InvokeModel` (and any related
   Bedrock actions) for the models these agents call, or every tile returns an
   AccessDenied / "Unable to locate credentials" error. `~/secrets/aws-strands.env`
   only carries app keys from `techtoday/secrets`, not AWS credentials.
2. **Brand-new API keys**, if a future feature needs one: add it once to
   `techtoday/secrets` locally as the `techtoday` IAM user
   (`secretsmanager:PutSecretValue` on EC2 fails by design). The workflow picks
   it up on the next deploy.

### Commit and Automatic Deployment

Create a feature branch from the repository root, then commit only this
project's files:

```bash
git checkout main && git pull origin main
git checkout -b feat/aws-strands-short-description

git add projects/aws-strands/
git commit -m "feat(aws-strands): short description"
git push -u origin feat/aws-strands-short-description
```

Open a pull request and squash-merge it into `main`. Changes under
`projects/aws-strands/**` trigger `.github/workflows/deploy-aws-strands.yml`, which
builds the image, pushes it to `techtoday/aws-strands` in ECR, provisions any
missing EC2 wiring, and restarts the container from
`~/apps/aws-strands/docker-compose.yml` (published EC2 host port `5004`).

Verify production after the workflow succeeds:

```bash
curl -I https://app.techtoday.click/aws-strands/
```

### Production Troubleshooting

A `502 Bad Gateway` usually means the container is not running behind Nginx.
On the EC2 host:

```bash
docker compose -f ~/apps/aws-strands/docker-compose.yml ps
docker compose -f ~/apps/aws-strands/docker-compose.yml logs --tail=50 aws-strands
grep -A12 "^  aws-strands:" ~/apps/aws-strands/docker-compose.yml
```

The production service must use `command: python src/python/app.py`. The Compose
file is regenerated on every deploy, so make lasting fixes in the workflow /
template rather than by hand — local edits are overwritten on the next push. To
validate and restart the current file:

```bash
docker compose -f ~/apps/aws-strands/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/apps/aws-strands/docker-compose.yml up -d aws-strands
```

### Rollback

Find a previous image tag locally, then connect to EC2 and repoint `latest` to
that image:

```bash
aws ecr describe-images --repository-name techtoday/aws-strands --region us-east-1 \
    --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table

ssh -i techtoday.pem ec2-user@<EC2_HOST>

ACCOUNT_ID=<your-aws-account-id>
ROLLBACK_TAG=<build-tag>
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker pull $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/aws-strands:$ROLLBACK_TAG
docker tag $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/aws-strands:$ROLLBACK_TAG \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/aws-strands:latest
docker compose -f ~/apps/aws-strands/docker-compose.yml up -d aws-strands
curl -I https://app.techtoday.click/aws-strands/
```

Fix the underlying issue and merge it promptly because the next deployment to
`main` overwrites the `latest` tag.

### Manual Deployment

Use this only when GitHub Actions is unavailable. Build and push locally:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

cd projects/aws-strands
docker build --platform linux/amd64 -t techtoday/aws-strands .
docker tag techtoday/aws-strands:latest \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/aws-strands:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/aws-strands:latest
ssh -i techtoday.pem ec2-user@<EC2_HOST>
```

Then run on EC2:

```bash
docker compose -f ~/apps/aws-strands/docker-compose.yml pull aws-strands
docker compose -f ~/apps/aws-strands/docker-compose.yml up -d aws-strands
```

If the pull fails with `no space left on device`, inspect and prune unused
Docker data before retrying:

```bash
df -h
docker system df
docker container prune -f
docker builder prune -af
docker image prune -af
docker compose -f ~/apps/aws-strands/docker-compose.yml pull aws-strands
docker compose -f ~/apps/aws-strands/docker-compose.yml up -d aws-strands
```

---

## Features

### 🤖 Hello World Agent (Module 1)
The simplest possible agent — no tools, so the agentic loop runs exactly once. Ask anything and Bedrock answers directly.

### 🧮 Math Assistant (Module 2)
Uses the pre-built `calculator` tool from `strands_tools` plus a system prompt. Handles powers, equations, and derivatives.

### 💰 Tip Calculator (Module 2)
A tool-enabled agent. Any phrasing of a tip question routes to the same `calculate_tip` tool — the agent understands intent, not keywords.

### 📦 Inventory Checker (Module 2)
A custom tool backed by a mock database. Check stock for `PROD-123`, `PROD-456`, or `PROD-789`.

### 📊 Sales Report Agent (Module 2)
Three single-purpose tools — query, analyse, email. You never specify the order; the agent plans the sequence itself.

### 🗄️ Inventory Manager (Module 2)
Class-based tools sharing one data store. Updates persist across requests, so an update in one call is visible to the next.

### ⚡ Warehouse Check (Module 2)
Async tools run warehouse lookups in parallel — three ~2-second checks finish in ~2s instead of ~6s.

### ✈️ Travel Assistant (Module 3 capstone)
A multi-tool agent that checks the weather, suggests a packing list, prices the trip, and tells you whether it fits your budget. The agentic loop works out the tool sequence itself.


---

## Project Details

1. **Project type:** container app
2. **Project folder:** `projects/aws-strands/`
3. **Local URL:** http://localhost:8084
4. **Production URL:** https://app.techtoday.click/aws-strands/
5. **Local port mapping:** `8084:5000`
6. **EC2 host port:** `5004`
7. **Container port:** `5000`
8. **ECR repository:** `techtoday/aws-strands`
9. **Production service name:** `aws-strands`
10. **PATH_PREFIX:** `/aws-strands`
11. **Workflow filename:** `deploy-aws-strands.yml`
12. **Trigger path:** `projects/aws-strands/**`

### Routes

1. `GET /` — main page (agent demo UI)
2. `POST /ask` — plain, tool-less agent (Module 1)
3. `POST /math` — pre-built calculator tool (Module 2)
4. `POST /tip` — tool-enabled tip calculator (Module 2)
5. `POST /inventory` — custom inventory tool (Module 2)
6. `POST /sales` — multi-tool sales planning (Module 2)
7. `POST /stock` — class-based, stateful inventory tools (Module 2)
8. `POST /warehouse` — async parallel warehouse lookups (Module 2)
9. `POST /travel` — multi-tool travel assistant (Module 3 capstone)
10. `GET /css/<path>` — stylesheets
11. `GET /js/<path>` — scripts

---

## Project Structure

```
projects/aws-strands/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service on port 8084
├── requirements.txt        # flask, flask-cors, python-dotenv, boto3, strands-agents
├── .env.example            # copy to .env (AWS credentials for Bedrock)
├── .gitignore
├── deploy.yml.template     # CI/CD workflow to copy into .github/workflows/
├── linkedin.txt
├── README.md
└── src/
    ├── python/
    │   ├── app.py             # Flask server: Blueprint + PATH_PREFIX routing
    │   ├── config.py          # loads .env; Bedrock model IDs + helpers
    │   ├── hello_agent.py     # Module 1 — plain, tool-less agent (/ask)
    │   ├── math_agent.py      # Module 2 — pre-built calculator tool (/math)
    │   ├── tip_agent.py       # Module 2 — tool-enabled tip calculator (/tip)
    │   ├── inventory_agent.py # Module 2 — custom inventory tool (/inventory)
    │   ├── sales_agent.py     # Module 2 — multi-tool sales planning (/sales)
    │   ├── stock_agent.py     # Module 2 — class-based, stateful tools (/stock)
    │   ├── warehouse_agent.py # Module 2 — async parallel lookups (/warehouse)
    │   └── travel_agent.py    # Module 3 — multi-tool travel assistant (/travel)
    ├── info/               # Explainer pages for how each demo works
    ├── index.html          # single-page web UI (each card has an ⓘ info icon linking to its explainer page)
    ├── css/style.css       # dark theme (TechToday design tokens)
    ├── css/info.css        # layout styles for the explainer pages
    ├── js/main.js          # front-end behavior, no frameworks
    └── js/info.js          # syntax highlighting and copy buttons for explainer pages
```

---

## Environment Variables

1. `PATH_PREFIX` — optional, set by the deployment environment (e.g. `"/aws-strands"`). Controls the URL prefix the Flask Blueprint is mounted under. Leave it unset for local development.
2. `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_DEFAULT_REGION` — AWS credentials with Bedrock model access, used locally. In production the EC2 instance role supplies these automatically.
3. `MODEL_ID` — optional, overrides the default Bedrock model (see `src/python/config.py`).

The demos call Amazon Bedrock at runtime, so valid AWS credentials with Bedrock access are required to run them.

Variables are loaded from `.env` at runtime via `python-dotenv`. See `.env.example` for the expected format.

---

## Deployment Status

Automatic, self-provisioning deployment is fully configured. On every push under
`projects/aws-strands/**`, `.github/workflows/deploy-aws-strands.yml` builds and
pushes the image to `techtoday/aws-strands` in ECR, provisions any missing EC2
wiring (ECR repo, Nginx `/aws-strands/` block, secrets env file, per-project
Compose file), and restarts the container from
`~/apps/aws-strands/docker-compose.yml`.
