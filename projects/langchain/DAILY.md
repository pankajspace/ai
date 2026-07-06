[← Project README](README.md) | [Project Setup](SETUP.md) | [Architecture Guide](../ARCHITECTURE.md)

# LangChain Lab (langchain) — Daily Cheatsheet

Quick-reference commands for day-to-day work on the **LangChain Lab (langchain)** project. Assumes setup from [SETUP.md](SETUP.md) is complete. For the shared git flow (branch, PR, merge), see the [Development Workflow](../ARCHITECTURE.md#development-workflow).

Deploys to `https://app.techtoday.click/langchain/` — container port `5000` (host port `5001`), ECR repo `techtoday/langchain`.

---

## 1. Develop Locally

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

**Useful commands:**

```bash
docker compose logs -f web       # tail logs
docker compose run --rm web bash # shell into container
docker compose ps                # container status
docker compose down              # tear down
```

---

## 2. Commit & Push

```bash
git add projects/langchain/
git commit -m "feat(langchain): short description"
git push -u origin feat/short-description
```

Open a Pull Request → get it reviewed → **Squash and merge** into `main`.

---

## 3. Deploy (Automatic)

Merging to `main` triggers CI/CD automatically — no manual steps needed.

- Workflow: `deploy-langchain.yml` — trigger path `projects/langchain/**`

Watch the run under **GitHub → Actions** to confirm it succeeds.

---

## 4. Verify Production

```bash
curl -I https://app.techtoday.click/langchain/
```

Or just open the URL in a browser.

---

## 5. Rollback

```bash
# 1. Find the last good build tag
aws ecr describe-images --repository-name techtoday/langchain --region us-east-1 \
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

docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/langchain:$ROLLBACK_TAG
docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/langchain:$ROLLBACK_TAG \
            $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/langchain:latest
docker compose -f ~/docker-compose.yml up -d --no-deps langchain

# 3. Verify
curl -I https://app.techtoday.click/langchain/
```

> Fix the bug and merge promptly — the next push to `main` overwrites `:latest`.

---

## 6. Manual Deploy (Fallback)

Use only if CI/CD is broken.

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/langchain
docker build --platform linux/amd64 -t techtoday/langchain .
docker tag techtoday/langchain:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/langchain:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/langchain:latest

ssh -i techtoday.pem ec2-user@$ELASTIC_IP
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
  docker compose -f ~/docker-compose.yml pull langchain
  docker compose -f ~/docker-compose.yml up -d --no-deps langchain
```
