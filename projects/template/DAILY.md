# Project Template — Daily Cheatsheet

Quick-reference commands for day-to-day work on a project created from this
template. Replace `<project-name>`, `<local-port>`, and `<host-port>` with your
project's real values (see [SETUP.md](SETUP.md)).

Deploys to `https://app.techtoday.click/<project-name>/` — container port
`5000` (host port `<host-port>`), ECR repo `techtoday/<project-name>`.

---

## 1. Develop Locally

```bash
cd projects/<project-name>

# Start the web UI (hot-reload via volume mount)
docker compose up web
# → http://localhost:<local-port>

# Or run an individual feature from the CLI
docker compose run --rm echo
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
git add projects/<project-name>/
git commit -m "feat(<project-name>): short description"
git push -u origin feat/short-description
```

Open a Pull Request → get it reviewed → **Squash and merge** into `main`.

---

## 3. Deploy (Automatic)

Merging to `main` triggers CI/CD automatically — no manual steps needed.

- Workflow: `deploy-<project-name>.yml` — trigger path `projects/<project-name>/**`

Watch the run under **GitHub → Actions** to confirm it succeeds.

---

## 4. Verify Production

```bash
curl -I https://app.techtoday.click/<project-name>/
```

Or just open the URL in a browser.

---

## 5. Rollback

```bash
# 1. Find the last good build tag
aws ecr describe-images --repository-name techtoday/<project-name> --region us-east-1 \
  --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table

# 2. SSH in and roll back
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

REGION=us-east-1
ACCOUNT_ID=<your-aws-account-id>
ROLLBACK_TAG=<build-tag>   # e.g. 20260701-153045-42-a1b2c3d

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/<project-name>:$ROLLBACK_TAG
docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/<project-name>:$ROLLBACK_TAG \
            $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/<project-name>:latest
docker compose -f ~/docker-compose.yml up -d --no-deps <project-name>

# 3. Verify
curl -I https://app.techtoday.click/<project-name>/
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

cd projects/<project-name>
docker build --platform linux/amd64 -t techtoday/<project-name> .
docker tag techtoday/<project-name>:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/<project-name>:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/<project-name>:latest

ssh -i techtoday.pem ec2-user@$ELASTIC_IP
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
  docker compose -f ~/docker-compose.yml pull <project-name>
  docker compose -f ~/docker-compose.yml up -d --no-deps <project-name>
```
