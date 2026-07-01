[← README](README.md) · [Development Guide](DEVELOPMENT.md) · [Common Deployment Guide](../DEPLOYMENT.md)

# Deployment — AI Playground (basic / ai-01)

This document covers deployment steps specific to the `basic` project (`app.techtoday.click/ai-01/`). For shared AWS infrastructure (EC2, Route 53, Nginx, SSL, IAM, OIDC) see the [common deployment guide](../DEPLOYMENT.md).

---

## Deployment Target

- **URL:** `https://app.techtoday.click/ai-01/`
- **Container port:** `5000` (mapped to EC2 port `5000`)
- **ECR repository:** `techtoday/ai-01`
- **Path prefix env var:** `PATH_PREFIX=/ai-01`

---

## Step 1 — Store API Keys in Secrets Manager

> **One-time per project.** Repeat only when rotating keys (`aws secretsmanager put-secret-value`).

```bash
aws secretsmanager create-secret \
  --name "techtoday/ai-01/openai-api-key" \
  --secret-string '{"OPENAI_API_KEY":"sk-...", "GROQ_API_KEY":"gsk_..."}'
```

**AWS Console:**
1. Open **Secrets Manager** → **Store a new secret** → **Other type of secret**
2. Add keys `OPENAI_API_KEY` and `GROQ_API_KEY` with their values → Next
3. Set secret name to `techtoday/ai-01/openai-api-key` → Store

---

## Step 2 — Create ECR Repository

> **One-time.**

```bash
REGION=us-east-1
REPO_NAME=techtoday/ai-01

aws ecr create-repository --repository-name $REPO_NAME --region $REGION

aws ecr put-image-scanning-configuration \
  --repository-name $REPO_NAME \
  --image-scanning-configuration scanOnPush=true
```

---

## Step 3 — Initial Image Build and Push

> **One-time.** Subsequent pushes are handled automatically by CI/CD.

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/ai-01

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/basic
docker build -t $REPO_NAME .
docker tag $REPO_NAME:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest
```

---

## Step 4 — Add Nginx Location Block

> **One-time.** Adds the `/ai-01/` route to the existing Nginx config on EC2.

SSH into the EC2 instance and add to the `server { listen 443 ... server_name app.techtoday.click; }` block in `/etc/nginx/conf.d/app.conf`:

```nginx
location /ai-01/ {
    proxy_pass         http://localhost:5000;
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

---

## Step 5 — Add Service to Docker Compose on EC2

> **One-time.** Adds the `ai-01` service to `~/docker-compose.yml` on EC2.

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

# Fetch secrets into env file
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/ai-01/openai-api-key \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/ai-01.env
chmod 600 ~/secrets/ai-01.env
```

Add to `~/docker-compose.yml`:

```yaml
services:
  ai-01:
    image: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/techtoday/ai-01:latest
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PATH_PREFIX=/ai-01
    env_file:
      - ~/secrets/ai-01.env
```

Authenticate and start:

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull ai-01
docker compose -f ~/docker-compose.yml up -d --no-deps ai-01
```

---

## Step 6 — Verify

```bash
curl -I https://app.techtoday.click/ai-01/
```

---

## Flask Path Prefix Configuration

Because Nginx forwards the full path (e.g., `/ai-01/joke`) to the container, Flask mounts routes under a `PATH_PREFIX` env var via a Blueprint:

```python
# src/app.py (abbreviated)
PREFIX = os.environ.get("PATH_PREFIX", "")  # /ai-01 in production, empty locally
app.register_blueprint(bp, url_prefix=PREFIX)
```

- **Locally:** `PATH_PREFIX` unset → routes are `/`, `/joke`, `/travel`
- **On EC2:** `PATH_PREFIX=/ai-01` → routes are `/ai-01/`, `/ai-01/joke`, `/ai-01/travel`

---

## CI/CD

Automated via [.github/workflows/deploy-ai-01.yml](../../.github/workflows/deploy-ai-01.yml). Triggers on any push to `main` touching `projects/basic/**`. See the [common deployment guide](../DEPLOYMENT.md) for OIDC and GitHub Secrets setup.
