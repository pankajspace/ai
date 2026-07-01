[<- README](../README.md) · [AWS Deployment Guide](DEPLOYMENT.md)

# Development & Deployment Workflow

This guide covers everything needed to work on the `projects/basic` app day-to-day: local setup, the development loop, and shipping changes to production (`app.techtoday.click/ai-01/`).

---

## 1. One-Time Local Setup

1. Install [Podman](https://podman.io/) and `podman-compose`:
   ```bash
   brew install podman podman-compose
   podman machine init --provider applehv
   podman machine start
   ```
2. Clone the repo and go to the project folder:
   ```bash
   git clone https://github.com/pankajspace/ai.git
   cd ai/projects/basic
   ```
3. Create your local secrets file:
   ```bash
   cp .env.example .env
   ```
4. Fill in `.env` with your keys:
   ```dotenv
   OPENAI_API_KEY=sk-...
   GROQ_API_KEY=gsk_...
   ```
   Never commit `.env` — it is already in `.gitignore`.
5. Build the container image:
   ```bash
   podman-compose build
   ```

---

## 2. Day-to-Day Development Loop

1. Sync `main` before starting new work:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   ```
3. Make code changes under `src/`.
4. Run the app locally to check your change:
   ```bash
   podman-compose up web
   ```
   Open [http://localhost:8080](http://localhost:8080).
5. Run individual features from the CLI when you only need to check one thing:
   ```bash
   podman-compose run --rm joke
   podman-compose run --rm travel
   ```
6. Rebuild the image whenever `requirements.txt` or the `Dockerfile` changes:
   ```bash
   podman-compose build
   ```
7. Tear down containers when done for the session:
   ```bash
   podman-compose down
   ```

### Useful commands

1. Tail logs of the running web service: `podman-compose logs -f web`
2. Open a shell inside the container: `podman-compose run --rm web bash`
3. Check container status: `podman-compose ps`

---

## 3. Committing and Pushing Your Work

1. Stage and commit with a clear, conventional message:
   ```bash
   git add projects/basic
   git commit -m "feat: short description of the change"
   ```
2. Push your branch and open a pull request:
   ```bash
   git push -u origin feat/short-description
   ```
3. Open a PR on GitHub targeting `main`, describe the change, and request review.
4. After approval, merge the PR into `main` (prefer "Squash and merge" for a clean history).

> Only changes under `projects/basic/**` trigger the production deployment workflow, so unrelated commits will not redeploy `ai-01`.

---

## 4. Production Deployment (Automatic)

Deployment is automated via GitHub Actions ([.github/workflows/deploy-ai-01.yml](../.github/workflows/deploy-ai-01.yml)):

1. On every push to `main` that touches `projects/basic/**`, the workflow:
   1. Builds the Docker image from [Dockerfile](basic/Dockerfile).
   2. Pushes it to Amazon ECR with three tags: the git SHA, `latest`, and a human-readable **build tag** in the form `YYYYMMDD-HHMMSS-<run-number>-<short-sha>` (e.g. `20260701-153045-42-a1b2c3d`) — sortable by build time and traceable to the exact commit and Actions run.
   3. SSHes into the production EC2 instance and runs `docker compose pull` + `docker compose up -d --no-deps ai-01`, restarting only the `ai-01` container (zero downtime for other services).
2. Once merged, watch the run under the repo's **Actions** tab to confirm it succeeds. The run summary lists the build tag for that deployment — copy it down or note it somewhere if you may need to roll back to it later.
3. Verify the live site:
   ```bash
   curl -I https://app.techtoday.click/ai-01/
   ```

### Prerequisites (already configured once, do not repeat unless rotating)

1. GitHub repo secrets: `EC2_SSH_KEY`, `EC2_HOST`, `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `AWS_ACCOUNT_ID`.
2. AWS-side infra (EC2, Nginx, ECR, IAM role, Secrets Manager) already provisioned per [DEPLOYMENT.md](DEPLOYMENT.md).

If you need to rotate an API key used in production, update the secret in AWS Secrets Manager (`techtoday/ai-01/openai-api-key`) — see Step 7 of [DEPLOYMENT.md](DEPLOYMENT.md) — then re-fetch it into the EC2 env file and restart the container, as described there.

---

## 5. Manual Deployment (Fallback)

Use this only if CI/CD is broken or you need to deploy outside of a `main` push.

1. Build and push the image to ECR:
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
2. SSH into the EC2 instance and restart the service:
   ```bash
   ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP
   aws ecr get-login-password --region us-east-1 | \
     docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
   docker compose pull ai-01
   docker compose up -d --no-deps ai-01
   ```
3. Verify:
   ```bash
   curl -I https://app.techtoday.click/ai-01/
   ```

---

## 6. Rollback

Every deploy is pushed to ECR with a human-readable **build tag** — `YYYYMMDD-HHMMSS-<run-number>-<short-sha>` — in addition to the git SHA and `latest` (see [.github/workflows/deploy-ai-01.yml](../.github/workflows/deploy-ai-01.yml)). Use the build tag to pick a known-good rollback target without having to remember a raw SHA.

1. Find the build tag to roll back to. Either:
   - Check the **Actions** tab for the last successful run before the bad one — its job summary lists the build tag, or
   - List the 10 most recently pushed tags directly from ECR (sorted oldest to newest):
     ```bash
     aws ecr describe-images --repository-name techtoday/ai-01 --region us-east-1 \
       --query 'sort_by(imageDetails,& imagePushedAt)[-10:].imageTags' --output table
     ```
2. SSH in and re-point `latest` at the chosen build tag:
   ```bash
   ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

   REGION=us-east-1
   ACCOUNT_ID=<your-aws-account-id>
   ROLLBACK_TAG=<build-tag-from-step-1>   # e.g. 20260701-153045-42-a1b2c3d

   # Re-authenticate Docker to ECR (session tokens expire)
   aws ecr get-login-password --region $REGION | \
     docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

   docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:$ROLLBACK_TAG
   docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:$ROLLBACK_TAG \
               $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-01:latest
   docker compose -f ~/docker-compose.yml up -d --no-deps ai-01
   ```
3. Verify the rollback took effect:
   ```bash
   curl -I https://app.techtoday.click/ai-01/
   ```

> This is temporary: the next successful push to `main` rebuilds and overwrites the `:latest` tag again, so fix the underlying bug and merge it promptly rather than leaving the rollback in place indefinitely. The build tag itself is never overwritten, so it remains a stable, permanent reference to that exact build even after `latest` moves on.

---

## Reference

1. [Full AWS architecture, one-time setup, and CI/CD workflow source](DEPLOYMENT.md)
2. [Project README (features, module responsibilities)](basic/README.md)
