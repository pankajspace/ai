[← README](../README.md) · [Deployment Guide](DEPLOYMENT.md)

# Development & Deployment Workflow

This guide covers the shared development workflow, CI/CD pipeline, manual deploy, and rollback process for all projects. Project-specific setup and local dev loops live in each project's own `DEVELOPMENT.md`:

1. [basic (ai-01) — DEVELOPMENT.md](basic/DEVELOPMENT.md)
2. [techtoday (home page) — DEVELOPMENT.md](techtoday/DEVELOPMENT.md)

---

## Local Machine Prerequisites

These tools are used across the commands in this guide (committing, manual deploy, rollback):

1. **git** — for every commit/push command below.
2. **AWS CLI v2** (configured via `aws configure`) — used in the manual deploy and rollback commands (`aws sts`, `aws ecr`). See the [common Deployment Guide](DEPLOYMENT.md#local-machine-prerequisites) for install steps and required IAM permissions.
3. **SSH client** with the `.pem` key for the EC2 instance — used to SSH in during manual deploy/rollback. See the [common Deployment Guide](DEPLOYMENT.md#local-machine-prerequisites) for setup.
4. **Docker CLI** — builds/tags/pushes/pulls images in the manual deploy and rollback commands below.
   - macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop/) or `brew install docker`
   - Linux: `sudo apt install docker.io` / `sudo dnf install docker`
   - Already using Podman for local dev of `basic`? Podman's CLI is Docker-compatible — run `alias docker=podman` instead of installing Docker separately.
5. **rsync** — manually deploys the `techtoday` static site.
   - macOS/Linux: preinstalled
   - Windows: use WSL, Git Bash, or `cwRsync`

Project-specific local dev tools (e.g., Podman for `basic`) are documented in each project's own `DEVELOPMENT.md`.

---

## Committing and Pushing

1. Stage and commit with a conventional message:
   ```bash
   git add projects/<project-name>/
   git commit -m "feat(<project>): short description"
   ```
2. Push and open a pull request:
   ```bash
   git push -u origin feat/short-description
   ```
3. After approval, merge to `main` (prefer "Squash and merge").

> Each project's CI/CD workflow is scoped to its own folder path, so commits to one project do not trigger a redeploy of another.

---

## Production Deployment (Automatic)

Each project has its own GitHub Actions workflow under `.github/workflows/`:

1. **basic (ai-01)** — [deploy-ai-01.yml](../.github/workflows/deploy-ai-01.yml) — trigger path `projects/basic/**`
2. **techtoday** — [deploy-techtoday.yml](../.github/workflows/deploy-techtoday.yml) — trigger path `projects/techtoday/src/**`

**Container projects (basic, etc.):** on push to `main`, the workflow builds the Docker image, pushes it to ECR with three tags (git SHA, human-readable build tag, and `latest`), then SSHes into EC2 and restarts only that project's container.

**Static projects (techtoday):** on push to `main`, the workflow rsyncs the `src/` folder to `/var/www/techtoday` on EC2. No container involved.

Once merged, watch the run under **Actions** to confirm it succeeds. Container deploys record a build tag in the job summary — note it for potential rollback.

Verify after any deploy:
```bash
curl -I https://techtoday.click/
curl -I https://app.techtoday.click/ai-01/
```

### Prerequisites (configured once, do not repeat unless rotating)

1. GitHub repo secrets: `EC2_SSH_KEY`, `EC2_HOST`, `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `AWS_ACCOUNT_ID`
2. AWS-side infra already provisioned per [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Manual Deployment (Fallback)

Use only if CI/CD is broken or you need to deploy outside a `main` push.

### Static projects (techtoday)

```bash
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

### Container projects (basic / ai-01)

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

ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
  docker compose -f ~/docker-compose.yml pull ai-01
  docker compose -f ~/docker-compose.yml up -d --no-deps ai-01
```

---

## Rollback (Container Projects)

Every container deploy tags the image with a human-readable **build tag** (`YYYYMMDD-HHMMSS-<run-number>-<short-sha>`), in addition to `latest`. Use this tag to roll back without remembering a raw SHA.

1. Find the build tag — check the **Actions** job summary of the last good run, or list ECR tags:
   ```bash
   aws ecr describe-images --repository-name techtoday/ai-01 --region us-east-1 \
     --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table
   ```
2. SSH in and re-point `latest` at the chosen build tag:
   ```bash
   ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

   REGION=us-east-1
   ACCOUNT_ID=<your-aws-account-id>
   ROLLBACK_TAG=<build-tag>   # e.g. 20260701-153045-42-a1b2c3d

   aws ecr get-login-password --region $REGION | \
     docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

   docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:$ROLLBACK_TAG
   docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:$ROLLBACK_TAG \
               $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:latest
   docker compose -f ~/docker-compose.yml up -d --no-deps ai-01
   ```
3. Verify:
   ```bash
   curl -I https://app.techtoday.click/ai-01/
   ```

> Fix the underlying bug and merge promptly — the next successful push overwrites `:latest`. The build tag itself is never overwritten and remains a permanent reference.

---

## Reference

1. [Full AWS architecture and one-time infrastructure setup](DEPLOYMENT.md)
2. [basic project README](basic/README.md)
3. [techtoday project README](techtoday/README.md)
