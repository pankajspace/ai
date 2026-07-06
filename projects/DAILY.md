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

### AI Playground (basic)

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

### LangChain Lab (langchain)

```bash
cd projects/langchain

# Start the web UI (hot-reload via volume mount)
docker compose up web
# → http://localhost:8081

# Or run individual features from the CLI
docker compose run --rm summarize
docker compose run --rm chat
docker compose run --rm agent
```

**Rebuild** (only when `requirements.txt` or `Dockerfile` changes):

```bash
docker compose build
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
git commit -m "feat(basic): short description"

# LangChain Lab
git add projects/langchain/
git commit -m "feat(langchain): short description"

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

- **basic** — `deploy-basic.yml` — trigger path `projects/basic/**`
- **langchain** — `deploy-langchain.yml` — trigger path `projects/langchain/**`
- **techtoday** — `deploy-techtoday.yml` — trigger path `projects/techtoday/**`

Watch the run under **GitHub → Actions** to confirm it succeeds.

---

## 5. Verify Production

```bash
curl -I https://app.techtoday.click/basic/
curl -I https://app.techtoday.click/langchain/
curl -I https://techtoday.click/
```

Or just open the URLs in a browser.

---

## 6. Rollback (Container Projects Only)

> Applies to both container projects. Substitute the repo/service name for the
> project you're rolling back: `basic` or `langchain`.

```bash
# 1. Find the last good build tag
aws ecr describe-images --repository-name techtoday/basic --region us-east-1 \
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

docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/basic:$ROLLBACK_TAG
docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/basic:$ROLLBACK_TAG \
            $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/basic:latest
docker compose -f ~/docker-compose.yml up -d --no-deps basic

# 3. Verify
curl -I https://app.techtoday.click/basic/
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

### Container projects (basic / langchain)

Set `PROJECT` to the container project you're deploying — `basic` or `langchain`.

```bash
PROJECT=basic          # or: langchain
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/$PROJECT
docker build --platform linux/amd64 -t techtoday/$PROJECT .
docker tag techtoday/$PROJECT:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT:latest

ssh -i techtoday.pem ec2-user@$ELASTIC_IP
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
  docker compose -f ~/docker-compose.yml pull $PROJECT
  docker compose -f ~/docker-compose.yml up -d --no-deps $PROJECT
```
