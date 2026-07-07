# Project Template — Setup

Setup reference for a project created from this template. Replace the
placeholders throughout with your project's real values:

1. `<project-name>` — the project folder name, e.g. `ai-03` (also the Nginx
   path prefix, ECR repo suffix, and Docker Compose service name).
2. `<local-port>` — the local dev port, e.g. `8082` (basic=8080, langchain=8081).
3. `<host-port>` — the EC2 host port, e.g. `5002` (basic=5000, langchain=5001).

Two groups of shared, one-time steps must be completed first:

1. **Local machine prerequisites** — Docker, AWS CLI, SSH, git, rsync (SETUP.md § 1)
2. **One-time AWS infrastructure** — IAM, VPC, EC2, Elastic IP, Route 53, Nginx, SSL, IAM roles, OIDC (SETUP.md § 2)

> The canonical end-to-end walkthrough is [projects/SETUP.md § 3 — Adding a New Project](../SETUP.md#3-adding-a-new-project). This file is the condensed per-project version.

---

## 1. Local Development

### 1.1. Prerequisites

1. [Docker](https://www.docker.com/) + Docker Compose
2. Any API keys your features need (the starter `echo` feature needs none)

### 1.2. One-Time Local Setup

```bash
cd projects/<project-name>
cp .env.example .env
# Fill in any required keys in .env
docker compose build
```

### 1.3. Day-to-Day Development Loop

1. Edit files under `src/` — changes are picked up immediately via the volume
   mount, no rebuild needed.
2. Run the web UI:
   ```bash
   docker compose up web
   # open http://localhost:<local-port>
   ```
3. Run an individual feature from the CLI (add a service per feature in
   `docker-compose.yml`):
   ```bash
   docker compose run --rm echo
   ```
4. Rebuild only when `requirements.txt` or `Dockerfile` changes:
   ```bash
   docker compose build
   ```
5. Tear down when done:
   ```bash
   docker compose down
   ```

### 1.4. Key Files

1. `src/app.py` — Flask server (Blueprint + `PATH_PREFIX`) exposing the routes
2. `src/config.py` — loads `.env`; the single place to build API clients
3. `src/echo.py` — starter feature; replace with your own feature modules
4. `src/index.html` / `src/js/main.js` — single-page UI and its behavior

> Pick a `<local-port>` that no other project uses so several can run at once.

---

## 2. Production Deployment

Deploys to `https://app.techtoday.click/<project-name>/` — container port
`5000` (mapped to host `<host-port>`), ECR repo `techtoday/<project-name>`. The
steps below mirror the basic and langchain projects; only the names, ports, and
path prefix differ.

> Complete the shared one-time AWS infrastructure setup (SETUP.md § 2) first.

### 2.1. Store Any Secrets

If your project needs API keys, add them to the shared `techtoday/secrets`
secret in AWS Secrets Manager (**Secrets Manager** → `techtoday/secrets` →
**Retrieve secret value** → **Edit** → add key/value → **Save**). The EC2
instance role already grants read access to everything under `techtoday/*`.

> If your project reuses only keys that already exist (e.g. `OPENAI_API_KEY`),
> skip this step.

### 2.2. Create ECR Repository

> **One-time.**

```bash
REGION=us-east-1
aws ecr create-repository --repository-name techtoday/<project-name> --region $REGION
```

**AWS Console:** **ECR** → **Repositories** → **Create repository** → name
`techtoday/<project-name>` → leave defaults → **Create repository**

### 2.3. Initial Image Build and Push

> **One-time.** Subsequent pushes are handled automatically by CI/CD. Requires
> Docker running locally and the cloned repo.

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/<project-name>

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/<project-name>
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

> On Apple Silicon Macs, `--platform linux/amd64` is required so the image runs
> on the `x86_64` EC2 instance.

### 2.4. Add Nginx Location Block

Connect a shell on the EC2 host (SSH or EC2 Instance Connect), then open the
app config:

```bash
sudo nano /etc/nginx/conf.d/app.conf
```

Inside the existing `server { listen 443 ssl ... server_name app.techtoday.click; }`
block, add a `location` block next to the existing ones:

```nginx
location /<project-name>/ {
    proxy_pass         http://localhost:<host-port>;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Validate and reload (zero-downtime):

```bash
sudo nginx -t              # must print "syntax is ok" and "test is successful"
sudo systemctl reload nginx
```

### 2.5. Add Service to Docker Compose on EC2

```bash
# Fetch secrets into a per-project env file (reuses the shared secret)
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/secrets \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/<project-name>.env
chmod 600 ~/secrets/<project-name>.env
```

Resolve the image URL, then append the service block under the existing
`services:` key in `~/docker-compose.yml`:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
echo "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/<project-name>:latest"
```

```yaml
services:
  # ...existing services...

  <project-name>:
    image: <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/techtoday/<project-name>:latest
    restart: unless-stopped
    command: python src/app.py
    ports:
      - "<host-port>:5000"          # unique host port; container listens on 5000
    environment:
      - PATH_PREFIX=/<project-name>
    env_file:
      - ~/secrets/<project-name>.env
```

> **YAML is indentation-sensitive:** the service name must be indented two
> spaces, its keys four. Use spaces, never tabs. Verify:
> ```bash
> docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
> ```

Authenticate, pull, and start only the new container:

```bash
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull <project-name>
docker compose -f ~/docker-compose.yml up -d --no-deps <project-name>
```

### 2.6. Enable CI/CD

```bash
cp projects/<project-name>/deploy.yml.template .github/workflows/deploy-<project-name>.yml

# Linux (GNU sed)
sed -i 's/PROJECT_NAME/<project-name>/g' .github/workflows/deploy-<project-name>.yml
# macOS (BSD sed)
sed -i '' 's/PROJECT_NAME/<project-name>/g' .github/workflows/deploy-<project-name>.yml

grep -n PROJECT_NAME .github/workflows/deploy-<project-name>.yml   # should print nothing
```

The workflow reuses the same shared GitHub secrets (`AWS_REGION`,
`AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, `EC2_SSH_KEY`) — no new
secrets to configure.

### 2.7. Verify Production Deployment

```bash
curl -I https://app.techtoday.click/<project-name>/
```

**Browser alternative:** open
`https://app.techtoday.click/<project-name>/` and confirm the page loads over
HTTPS.

---

## Secrets Reference

1. `PATH_PREFIX` — set to `/<project-name>` directly in `~/docker-compose.yml`
   on EC2 (not secret).
2. Add each API key your project uses here, noting the Secrets Manager secret
   (`techtoday/secrets`) it lives in.
