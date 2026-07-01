[← README](../README.md) · [Deployment Guide](DEPLOYMENT.md)

# Development & Deployment Workflow

This guide covers the shared development workflow, CI/CD pipeline, manual deploy, and rollback process for all projects, as well as project-specific setup and local dev loops.

---

## Local Machine Prerequisites

These tools are used across the commands in this guide (committing, manual deploy, rollback):

1. **git** — for every commit/push command below.
2. **AWS CLI v2** (configured via `aws configure`) — used in the manual deploy and rollback commands (`aws sts`, `aws ecr`). See the [common Deployment Guide](DEPLOYMENT.md#1-aws-cli-v2) for install steps, IAM user creation, and required permissions.
   > **Zero-install alternative — AWS CloudShell:** You can run pure `aws` commands (e.g., `aws ecr describe-images` for rollback) directly in your browser via [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) — no local install or `aws configure` needed. CloudShell does **not** work for commands that require local files (`docker build`, `rsync`) or SSH.
3. **SSH client** with the `.pem` key for the EC2 instance — used to SSH in during manual deploy/rollback. See the [common Deployment Guide](DEPLOYMENT.md#local-machine-prerequisites) for setup.
4. **Docker CLI** — builds/tags/pushes/pulls images, and runs the local dev loop for `basic` (see below).
   - macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop/) or `brew install docker`
   - Linux: `sudo apt install docker.io docker-compose-plugin` / `sudo dnf install docker docker-compose-plugin`
5. **rsync** — manually deploys the `techtoday` static site.
   - macOS/Linux: preinstalled
   - Windows: use WSL, Git Bash, or `cwRsync`

Project-specific local dev tools (e.g., Docker Compose for `basic`) are documented in the project-specific sections below.

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

**Browser alternative:** Open [https://techtoday.click/](https://techtoday.click/) and [https://app.techtoday.click/ai-01/](https://app.techtoday.click/ai-01/) in your browser and confirm both pages load.

### Prerequisites (configured once, do not repeat unless rotating)

1. GitHub repo secrets: `EC2_SSH_KEY`, `EC2_HOST`, `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `AWS_ACCOUNT_ID`
2. AWS-side infra already provisioned per [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Manual Deployment (Fallback)

Use only if CI/CD is broken or you need to deploy outside a `main` push.

> **Note:** Manual deployment requires local tools (Docker, SSH, rsync) and access to project files — it cannot be done entirely from AWS CloudShell or the AWS Console. Use your local terminal.

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
   > **CloudShell / Console alternative:** You can run the `aws ecr describe-images` command above in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/), or view image tags in the AWS Console: open **ECR** → **Repositories** → `techtoday/ai-01` → **Images** tab — tags and push dates are listed in the table.
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


---

# Development — AI Playground (basic / ai-01)

This section covers local development for `projects/basic`, which runs at `app.techtoday.click/ai-01/`. For CI/CD, manual deploy, and rollback see the [common sections](#development--deployment-workflow) above.

---

## Prerequisites

1. [Docker](https://www.docker.com/) + Docker Compose — used for both the local dev loop below and manual deploy/rollback. See the [Local Machine Prerequisites](#local-machine-prerequisites) section above for install steps, and AWS CLI/SSH details needed for deployment.
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for the `travel` feature
3. [Groq API key](https://console.groq.com/keys) — required for the `joke` feature; free tier available

---

## One-Time Local Setup

```bash
cd projects/basic
cp .env.example .env
# Fill in OPENAI_API_KEY and GROQ_API_KEY in .env
docker compose build
```

---

## Day-to-Day Development Loop

1. Sync `main` before starting:
   ```bash
   git checkout main && git pull origin main
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   ```
3. Edit files under `src/` — changes are picked up immediately via volume mount, no rebuild needed.
4. Run the web UI:
   ```bash
   docker compose up web
   # open http://localhost:8080
   ```
5. Run individual features from the CLI:
   ```bash
   docker compose run --rm joke
   docker compose run --rm travel
   ```
6. Rebuild only when `requirements.txt` or `Dockerfile` changes:
   ```bash
   docker compose build
   ```
7. Tear down when done:
   ```bash
   docker compose down
   ```

### Useful Commands

1. Tail logs: `docker compose logs -f web`
2. Shell into container: `docker compose run --rm web bash`
3. Container status: `docker compose ps`

---

## Committing and Pushing

```bash
git add projects/basic
git commit -m "feat(ai-01): short description"
git push -u origin feat/short-description
```

Open a PR targeting `main`. Only changes under `projects/basic/**` trigger the production deploy of `ai-01`.

---

## Production Deployment

Automated via GitHub Actions on merge to `main`. See the [common sections](#production-deployment-automatic) above for the full CI/CD workflow, manual fallback deploy, and rollback instructions.

---

# Development — TechToday Home Page

This guide covers local development for the `techtoday` static site.

---

## Prerequisites

No tools required beyond a modern browser and `git`. Optionally, Python 3 for a local server.

Manual/fallback deploy (see [DEPLOYMENT.md](DEPLOYMENT.md)) additionally requires `rsync` and the shared tools in the [Local Machine Prerequisites](#local-machine-prerequisites) section above (AWS CLI, SSH client).

---

## Local Preview

**Direct file open (fastest):**

```bash
open projects/techtoday/src/index.html
```

**Local HTTP server** (better for testing — matches production serving behavior):

```bash
cd projects/techtoday/src
python3 -m http.server 8000
# open http://localhost:8000
```

---

## Day-to-Day Workflow

1. Sync `main` before starting:
   ```bash
   git checkout main && git pull origin main
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   ```
3. Edit files under `src/` — save and reload the browser to see changes.
4. Commit and push:
   ```bash
   git add projects/techtoday/
   git commit -m "feat(techtoday): short description"
   git push -u origin feat/short-description
   ```
5. Open a pull request targeting `main`.

---

## Key Files

1. `src/index.html` — single HTML page; all content lives here
2. `src/css/style.css` — all styles; dark-theme design tokens are CSS custom properties at the top of the file
3. `src/js/main.js` — mobile nav toggle only; keep this file minimal

---

## Adding a New Project Card

1. Open `src/index.html`.
2. Locate the `<div class="grid">` inside `<section id="projects">`.
3. Copy an existing `<div class="card">` block and update the icon, title, description, link, and status badge.
4. Status values: `<span class="status live">Live</span>` or `<span class="status soon">Coming soon</span>`.

---

## Production Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md).
