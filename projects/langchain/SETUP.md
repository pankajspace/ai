[← Project README](README.md) | [Project Daily](DAILY.md) | [Shared Setup Guide](../SETUP.md) | [Projects Guide](../README.md)

# LangChain Lab (langchain) — Setup

Setup for the **LangChain Lab (langchain)** project only. Shared, one-time steps live in the [Shared Setup Guide](../SETUP.md):

1. **Local machine prerequisites** (Docker, AWS CLI, SSH, git, rsync) — [Shared § 1](../SETUP.md#1-local-machine-prerequisites)
2. **One-time AWS infrastructure** (IAM, VPC, EC2, Elastic IP, Route 53, Nginx, SSL, IAM roles, OIDC) — [Shared § 3](../SETUP.md#3-one-time-aws-infrastructure-setup)

Complete those first, then follow this file to run the project locally and deploy it.

---

## 1. Local Development

### 1.1. Prerequisites

1. [Docker](https://www.docker.com/) + Docker Compose — installed in [Shared § 1.1](../SETUP.md#11-docker-cli--daemon--compose-plugin)
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for all three features (`summarize`, `chat`, `agent`); every feature uses GPT-4o mini, so no Groq key is needed

### 1.2. One-Time Local Setup

```bash
cd projects/langchain
cp .env.example .env
# Fill in OPENAI_API_KEY in .env
docker compose build
```

### 1.3. Day-to-Day Development Loop

1. Edit files under `src/` — changes are picked up immediately via volume mount, no rebuild needed.
2. Run the web UI:
   ```bash
   docker compose up web
   # open http://localhost:8081
   ```
3. Run individual features from the CLI:
   ```bash
   docker compose run --rm summarize
   docker compose run --rm chat
   docker compose run --rm agent
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

1. `src/config.py` — loads `.env`; builds the LangChain `ChatOpenAI` and raw OpenAI clients
2. `src/summarizer.py` — LangChain `prompt | model | parser` chain
3. `src/chat.py` — memory chat using a `MessagesPlaceholder` and re-sent history
4. `src/agent.py` — tool-using shop agent (OpenAI function calling)
5. `src/app.py` — Flask server (Blueprint + `PATH_PREFIX`) exposing `/summarize`, `/chat`, `/agent`

> The local web port is `8081` (basic uses `8080`) so both projects can run at the same time.

---

## 2. Production Deployment

Deploys to `https://app.techtoday.click/langchain/` — container port `5000` (mapped to host `5001`), ECR repo `techtoday/langchain`. The steps are identical to the [basic project](../basic/SETUP.md#2-production-deployment); only the names, port, and path prefix differ.

> Complete the [Shared AWS infrastructure setup](../SETUP.md#3-one-time-aws-infrastructure-setup) first.

### 2.1. Store API Key in Secrets Manager

> **Already done** if you deployed the basic project — LangChain Lab reuses the same `techtoday/secrets` secret and only needs `OPENAI_API_KEY`, which is already stored there. No action required.

### 2.2. Create ECR Repository

> **One-time.**

```bash
REGION=us-east-1
aws ecr create-repository --repository-name techtoday/langchain --region $REGION
```

**AWS Console:** Open **ECR** → **Repositories** → **Create repository** → name `techtoday/langchain` → leave defaults → **Create repository**

### 2.3. Initial Image Build and Push

> **One-time.** Subsequent pushes are handled automatically by CI/CD. Requires Docker running locally and the cloned repo — same prerequisites and per-OS notes as the [basic project § 2.3](../basic/SETUP.md#23-initial-image-build-and-push).

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/langchain

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/langchain
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

> On Apple Silicon Macs, `--platform linux/amd64` is required (see the note in the [basic project § 2.3](../basic/SETUP.md#23-initial-image-build-and-push)).

### 2.4. Add Nginx Location Block

> **One-time.** Already included in the full Nginx config from [Shared § 3.8](../SETUP.md#38-configure-nginx). Only repeat this step when adding `langchain` to a server configured before this project existed.

Add to the `server { listen 443 ... server_name app.techtoday.click; }` block in `/etc/nginx/conf.d/app.conf`:

```nginx
location /langchain/ {
    proxy_pass         http://localhost:5001;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 2.5. Add Service to Docker Compose on EC2

> **One-time.** Adds the `langchain` service to `~/docker-compose.yml` on EC2.

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

# Fetch secrets into an env file (reuses the shared techtoday/secrets secret)
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/secrets \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/langchain.env
chmod 600 ~/secrets/langchain.env
```

Resolve the image URL, then append the service block under the existing `services:` key in `~/docker-compose.yml`:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
IMAGE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/langchain:latest"
echo $IMAGE   # verify before using it below
```

Add the following block (aligned with the existing `basic` service). Note the host port is `5001` to avoid clashing with `basic` on `5000`:

```yaml
  langchain:
    image: <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/techtoday/langchain:latest
    restart: unless-stopped
    command: python src/app.py
    ports:
      - "5001:5000"
    environment:
      - PATH_PREFIX=/langchain
    env_file:
      - ~/secrets/langchain.env
```

Authenticate and start:

```bash
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull langchain
docker compose -f ~/docker-compose.yml up -d --no-deps langchain
```

### 2.6. Verify Production Deployment

```bash
curl -I https://app.techtoday.click/langchain/
```

**Browser alternative:** Open [https://app.techtoday.click/langchain/](https://app.techtoday.click/langchain/) in your browser and confirm the page loads.

---

## Secrets Reference

Project-specific values used by this project (reuses the same `techtoday/secrets` secret as basic):

1. `OPENAI_API_KEY` — AWS Secrets Manager, secret `techtoday/secrets` — used by all three features (`summarize`, `chat`, `agent`)
2. `PATH_PREFIX` — set to `/langchain` directly in `~/docker-compose.yml` on EC2 (not secret)

LangChain Lab needs no Groq key — every feature uses GPT-4o mini. Since `OPENAI_API_KEY` already lives in `techtoday/secrets`, no new secret is required. See the full [Secrets & Environment Variables Reference](../SETUP.md#312-secrets--environment-variables-reference) in the shared guide.
