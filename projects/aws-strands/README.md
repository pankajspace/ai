# AI Agents on AWS — Strands SDK

An interactive code reference for the **AI Agents on AWS** masterclass. Browse 14 example scripts covering the Strands SDK, Bedrock tools, and agentic patterns — served through a Flask web UI running in a Docker container.

The project displays annotated source code for three modules (First Agents, Tools, Capstone) and includes the full GUIDE.html study companion. No AI/ML dependencies run at runtime — the app reads and serves the example Python files as a study reference.

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

### One-Time Production Setup

Run these once before the first automatic deploy. They wire the project into the
shared EC2 host. Do them again only when rebuilding the server. **Steps marked
(local) must run on your local machine** with the AWS CLI configured as the
`techtoday` IAM user; **steps marked (EC2) run over SSH** on the app host. Do not
run the ECR or Secrets Manager steps on EC2 — the instance role
(`ec2-techtoday-server-role`) can only *pull* images and *read* secrets, so
`ecr:CreateRepository` and `secretsmanager:PutSecretValue` there fail with
`AccessDeniedException` by design.

1. **Create the ECR repository** (local):

   ```bash
   aws ecr create-repository --repository-name techtoday/aws-strands --region us-east-1
   ```

2. **Seed the initial image** (local, from `projects/aws-strands/`). Later pushes are
   automated by the workflow:

   ```bash
   REGION=us-east-1
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   ECR=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
   aws ecr get-login-password --region $REGION | \
     docker login --username AWS --password-stdin $ECR
   cd projects/aws-strands
   docker build --platform linux/amd64 -t $ECR/techtoday/aws-strands:latest .
   docker push $ECR/techtoday/aws-strands:latest
   ```

3. **Ensure any needed keys are in the shared secret** (local). This project needs
   no API keys for basic operation. Skip this step unless you add features later
   that require secrets.

4. **Add the Nginx location block** (EC2). Inside the
   `server { listen 443 ssl ... server_name app.techtoday.click; }` block in
   `/etc/nginx/conf.d/app.conf`:

   ```nginx
   location /aws-strands/ {
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
     > ~/secrets/aws-strands.env
   chmod 600 ~/secrets/aws-strands.env
   ```

6. **Add the production service to `~/docker-compose.yml`** (EC2). Use the image
   URL (not `build:`), set `PATH_PREFIX=/aws-strands`, and publish host port `5004`
   (replace `<ECR>` with `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com`):

   ```yaml
     aws-strands:
       image: <ECR>/techtoday/aws-strands:latest
       command: python src/python/app.py
       restart: unless-stopped
       environment:
         - PATH_PREFIX=/aws-strands
       env_file:
         - ~/secrets/aws-strands.env
       ports:
         - "5004:5000"
   ```

7. **Start the service the first time** (EC2):

   ```bash
   REGION=us-east-1
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   aws ecr get-login-password --region $REGION | \
     docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
   docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
   docker compose -f ~/docker-compose.yml pull aws-strands
   docker compose -f ~/docker-compose.yml up -d --no-deps aws-strands
   curl -I https://app.techtoday.click/aws-strands/
   ```

After this one-time setup, every push under `projects/aws-strands/**` redeploys
automatically.

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
builds the image, pushes it to `techtoday/aws-strands` in ECR, and restarts only
the `aws-strands` service on EC2. The production Compose service publishes EC2
host port `5004`.

Verify production after the workflow succeeds:

```bash
curl -I https://app.techtoday.click/aws-strands/
```

### Production Troubleshooting

A `502 Bad Gateway` usually means the container is not running behind Nginx.
On the EC2 host:

```bash
docker compose -f ~/docker-compose.yml ps
docker compose -f ~/docker-compose.yml logs --tail=50 aws-strands
grep -A12 "^  aws-strands:" ~/docker-compose.yml
```

The production service must use `command: python src/python/app.py`. After
correcting `~/docker-compose.yml`, validate it and restart only this service:

```bash
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/docker-compose.yml up -d --no-deps aws-strands
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
docker compose -f ~/docker-compose.yml up -d --no-deps aws-strands
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
docker compose -f ~/docker-compose.yml pull aws-strands
docker compose -f ~/docker-compose.yml up -d --no-deps aws-strands
```

If the pull fails with `no space left on device`, inspect and prune unused
Docker data before retrying:

```bash
df -h
docker system df
docker container prune -f
docker builder prune -af
docker image prune -af
docker compose -f ~/docker-compose.yml pull aws-strands
docker compose -f ~/docker-compose.yml up -d --no-deps aws-strands
```

---

## Features

### 📖 Interactive Code Reference
Serves the 14 example Python scripts from the "AI Agents on AWS" masterclass as an interactive, browsable catalog. Each lesson shows its title, description (parsed from the script's docstring), filename, and full source code with copy-to-clipboard.

### 🧩 Three Module Sections
- **Module 1 — First Agents** (2 lessons): Simplest agents with Strands and LangGraph. See the agentic loop for the first time.
- **Module 2 — Tools** (9 lessons): Custom tools, pre-built tools, multi-tool agents, class-based tools, and async parallel execution.
- **Module 3 — Capstone** (1 lesson): Travel Assistant that chains weather, packing, and budget tools.

### 🔧 Utility Scripts
Root-level helper scripts for environment setup (`00_check_setup.py`), model listing (`01_list_models.py`), and shared config (`config.py`).

### 📘 Study Guide
The full GUIDE.html study companion is served at `/guide`, containing diagrams, explanations, and run commands for every concept.

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

1. `GET /` — main page (interactive code reference UI)
2. `GET /guide` — GUIDE.html study companion
3. `GET /api/modules` — JSON catalog of all modules, lessons, and source code
4. `GET /api/lesson/<module_id>/<filename>` — single lesson metadata + source
5. `GET /css/<path>` — stylesheets
6. `GET /js/<path>` — scripts

---

## Project Structure

```
projects/aws-strands/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service on port 8084
├── requirements.txt        # flask, flask-cors, python-dotenv, requests
├── .env.example            # copy to .env (no keys required)
├── .gitignore
├── deploy.yml.template     # CI/CD workflow to copy into .github/workflows/
├── linkedin.txt
├── README.md
└── src/
    ├── python/
    │   ├── app.py          # Flask server: Blueprint + PATH_PREFIX routing
    │   ├── config.py       # loads .env; no keys needed for this project
    │   ├── examples.py     # reads example scripts, parses docstrings
    │   └── examples/       # the 14 masterclass scripts (read-only reference)
    │       ├── config.py           # shared model IDs for Bedrock
    │       ├── 00_check_setup.py   # environment readiness check
    │       ├── 01_list_models.py   # list live Bedrock models
    │       ├── 01/                 # Module 1 — First Agents (2 scripts)
    │       ├── 02/                 # Module 2 — Tools (9 scripts)
    │       └── 03/                 # Module 3 — Capstone (1 script)
    ├── guide.html          # full study companion (diagrams + explanations)
    ├── index.html          # single-page web UI
    ├── css/style.css       # dark theme (TechToday design tokens)
    └── js/main.js          # front-end behavior, no frameworks
```

---

## Environment Variables

1. `PATH_PREFIX` — optional, set by the deployment environment (e.g. `"/aws-strands"`). Controls the URL prefix the Flask Blueprint is mounted under. Leave it unset for local development.

No API keys are required. The app serves example source code as a study reference and does not call any external AI services at runtime.

Variables are loaded from `.env` at runtime via `python-dotenv`. See `.env.example` for the expected format.

---

## Deployment Status

Automatic deployment is fully configured. The workflow file
`.github/workflows/deploy-aws-strands.yml` exists, builds one image from the
project root, pushes it to `techtoday/aws-strands` in ECR, and restarts the
`aws-strands` service on EC2.
