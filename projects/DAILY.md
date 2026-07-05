[← README](../README.md) · [Projects Guide](README.md) · [Setup Guide](SETUP.md)

# Daily Development Cheatsheet

Quick-reference commands for day-to-day development. Assumes all setup from the [Setup Guide](SETUP.md) is already complete.

---

## 1. Start a Feature

```bash
git checkout main && git pull origin main
git checkout -b feat/short-description
```

---

## 2. Develop Locally

### AI Playground (basic / ai-01)

```bash
cd projects/basic

# Start the web UI (hot-reload via volume mount)
docker compose up web
# → http://localhost:8080

# Or run individual features from the CLI
docker compose run --rm joke
docker compose run --rm travel
docker compose run --rm summarize
docker compose run --rm arena
```

**Rebuild** (only when `requirements.txt` or `Dockerfile` changes):

```bash
docker compose build
```

**Useful commands:**

```bash
docker compose logs -f web       # tail logs
docker compose run --rm web bash # shell into container
docker compose ps                # container status
docker compose down              # tear down
```

### TechToday Home Page

```bash
# Quick preview
open projects/techtoday/src/index.html

# Or local HTTP server (matches production behavior)
cd projects/techtoday/src
python3 -m http.server 8000
# → http://localhost:8000
```

---

## 3. Commit & Push

```bash
# AI Playground
git add projects/basic/
git commit -m "feat(ai-01): short description"

# TechToday
git add projects/techtoday/
git commit -m "feat(techtoday): short description"

# Push
git push -u origin feat/short-description
```

Open a Pull Request on GitHub → get it reviewed → **Squash and merge** into `main`.

---

## 4. Deploy (Automatic)

Merging to `main` triggers CI/CD automatically — no manual steps needed.

- **basic (ai-01)** — `deploy-ai-01.yml` — trigger path `projects/basic/**`
- **techtoday** — `deploy-techtoday.yml` — trigger path `projects/techtoday/**`

Watch the run under **GitHub → Actions** to confirm it succeeds.

---

## 5. Verify Production

```bash
curl -I https://app.techtoday.click/ai-01/
curl -I https://techtoday.click/
```

Or just open both URLs in a browser.

---

## 6. Rollback (Container Projects Only)

```bash
# 1. Find the last good build tag
aws ecr describe-images --repository-name techtoday/ai-01 --region us-east-1 \
  --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table

# 2. SSH in and roll back
# Remember $ELASTIC_IP is the public IP of the EC2 instance (from AWS console → EC2 → Instances → techtoday-server)
# So $ELASTIC_IP for us is 44.193.134.238
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

REGION=us-east-1
ACCOUNT_ID=<your-aws-account-id>
ROLLBACK_TAG=<build-tag>   # e.g. 20260701-153045-42-a1b2c3d

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:$ROLLBACK_TAG
docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:$ROLLBACK_TAG \
            $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:latest
docker compose -f ~/docker-compose.yml up -d --no-deps ai-01

# 3. Verify
curl -I https://app.techtoday.click/ai-01/
```

> Fix the bug and merge promptly — the next push to `main` overwrites `:latest`.

---

## 7. Manual Deploy (Fallback)

Use only if CI/CD is broken.

### TechToday (static)

```bash
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

### AI Playground (container)

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/basic
docker build -t techtoday/ai-01 .
docker tag techtoday/ai-01:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:latest

ssh -i techtoday.pem ec2-user@$ELASTIC_IP
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
  docker compose -f ~/docker-compose.yml pull ai-01
  docker compose -f ~/docker-compose.yml up -d --no-deps ai-01
```
