[← README](../README.md) · [Setup Guide](SETUP.md)

# Projects — techtoday.click

This document covers the AWS infrastructure architecture, day-to-day development workflows, CI/CD pipeline, manual deploy, and rollback process for all projects. For step-by-step setup instructions (tool installation, AWS infrastructure, production setup, local dev setup), see the [Setup Guide](SETUP.md).

---

## Architecture Overview

```
Internet
   │
   ▼
Route 53 (techtoday.click hosted zone)
   ├── techtoday.click          → A record → EC2 Elastic IP  (static home page)
   ├── www.techtoday.click      → A record → EC2 Elastic IP  (redirects to techtoday.click)
   └── app.techtoday.click      → A record → EC2 Elastic IP  (all app projects)
                                         │
                                         ▼
                              EC2 Instance (t2.micro, free tier / ~$8/month)
                              ┌───────────────────────────────────────────────┐
                              │  Nginx (reverse proxy + static files)         │
                              │  HTTPS :443 (Let's Encrypt — free)            │
                              │  HTTP  :80  → redirect to HTTPS               │
                              │                                               │
                              │  techtoday.click/   → /var/www/techtoday      │
                              │  /ai-01/*           → localhost:5000          │
                              │  /ai-02/*           → localhost:5001 (future) │
                              └───────────────────────────────────────────────┘
                                         │
                              Docker Compose (app subdomain only)
                              ├── ai-01  (port 5000, from ECR)
                              └── ai-02  (port 5001, future)

              ECR             → per-project image repositories (techtoday/ai-*)
              Secrets Manager → API keys injected as env vars at container start
              GitHub Actions  → CI/CD on push to main (per-project workflows)
```

---

## Why This Architecture

1. **No ALB** — Nginx replaces the Application Load Balancer, saving ~$16/month
2. **No Fargate** — Containers run directly on EC2; static files served directly by Nginx
3. **Free SSL** — Let's Encrypt / Certbot auto-renews certs; no ACM needed
4. **Path-based routing** — Nginx `location /ai-*/` blocks route requests to the correct container
5. **Single DNS record for apps** — One A record for `app.techtoday.click`; no new records per project
6. **Easy to add projects** — New app project = new Docker Compose service + new Nginx `location` block
7. **Secrets management** — Secrets Manager injects API keys at container startup

---

## Cost

1. **EC2 t2.micro** — free on AWS Free Tier (first 12 months); ~$8/month on-demand after that
2. **Elastic IP** — free while attached to a running instance
3. **Route 53 hosted zone** — $0.50/month
4. **Secrets Manager** — ~$0.40/secret/month
5. **ECR storage** — ~$0.10/GB/month
6. **Each additional project** — **+$0/month** (same EC2, new Docker Compose service + Nginx block)

> Use a `t3.small` (~$17/month) when running 3+ memory-intensive projects simultaneously.

---

## Day-to-Day Git Workflow

These steps apply to every project. The project-specific sections below cover the local dev tools and commands unique to each project (Docker Compose, local preview, etc.).

1. Sync `main` before starting:
   ```bash
   git checkout main && git pull origin main
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   ```
3. Edit and test locally — see the project-specific section below.
4. Stage and commit with a conventional message:
   ```bash
   git add projects/<project-name>/
   git commit -m "feat(<project>): short description"
   ```
5. Push and open a pull request:
   ```bash
   git push -u origin feat/short-description
   ```
6. After approval, merge to `main` (prefer "Squash and merge").

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

1. GitHub repo secrets: `EC2_SSH_KEY`, `EC2_HOST`, `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `AWS_ACCOUNT_ID` — see [Setup Guide § 2.10](SETUP.md#210-set-up-github-oidc-and-deploy-role-cicd)
2. AWS-side infra already provisioned per [Setup Guide § 2](SETUP.md#2-one-time-aws-infrastructure-setup)

---

## Manual Deployment (Fallback)

Use only if CI/CD is broken or you need to deploy outside a `main` push.

> **Note:** Manual deployment requires local tools (Docker, SSH, rsync) and access to project files — it cannot be done entirely from AWS CloudShell or the AWS Console. Use your local terminal. For tool installation, see [Setup Guide § 1](SETUP.md#1-local-machine-prerequisites).

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

## Best Practices

### IAM & Security

1. **Dedicated IAM user for CLI** — use the `techtoday-admin` IAM user (see [Setup Guide § 2.1](SETUP.md#21-create-iam-user-for-cli-access)) instead of root credentials for all local `aws` commands
2. **Enable MFA** — turn on multi-factor authentication for the IAM user and the root account
3. **Rotate access keys** — rotate the IAM user's access keys periodically (`aws iam create-access-key` → update `aws configure` → `aws iam delete-access-key` for the old key)
4. **Least privilege** — EC2 role allows only `secretsmanager:GetSecretValue` on `techtoday/*` and ECR read; the IAM user policy is scoped to the specific services used in this guide
5. **No static credentials in CI/CD** — GitHub Actions uses OIDC; SSH key is a GitHub Secret
6. **Secrets Manager only** — API keys are never in `docker-compose.yml`, repo files, or images
7. **Restrict SSH** — after setup, tighten the security group SSH rule to your IP only (`YOUR_IP/32`)
8. **HTTPS enforced** — Nginx redirects all HTTP to HTTPS; certs auto-renew via Certbot cron

### Container & Image

9. **Tag images three ways** — full git SHA, build tag (`YYYYMMDD-HHMMSS-<run>-<sha>`), and `latest`
10. **ECR scan on push** — `scanOnPush=true` on every repository
11. **`restart: unless-stopped`** — containers restart automatically after EC2 reboots

### Cost

12. **Free Tier** — `t2.micro` is free for 750 hrs/month in the first AWS year (= free 24/7)
13. **ECR lifecycle policy** — delete untagged images older than 7 days to avoid storage accumulation

---

## Secrets & Environment Variables Reference

A complete list of every secret and environment variable used across all projects, and where each one lives.

### GitHub Actions Secrets

Set at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Shared by all project workflows (`deploy-ai-01.yml`, `deploy-techtoday.yml`):

1. `AWS_REGION` — AWS region, e.g. `us-east-1`
2. `AWS_ACCOUNT_ID` — your 12-digit AWS account ID
3. `AWS_DEPLOY_ROLE_ARN` — full ARN of the `github-actions-deploy` IAM role, e.g. `arn:aws:iam::123456789012:role/github-actions-deploy`
4. `EC2_HOST` — Elastic IP of the EC2 instance, e.g. `1.2.3.4`
5. `EC2_SSH_KEY` — full contents of the `.pem` private key file (include the `-----BEGIN RSA PRIVATE KEY-----` header/footer)

### AWS Secrets Manager

Set at: **AWS Console → Secrets Manager → Store a new secret → Other type of secret**

Accessed by the EC2 instance at container startup (never stored in the repo or Docker image):

1. Secret name: `techtoday/ai-01/openai-api-key`
   - `OPENAI_API_KEY` — OpenAI API key (`sk-...`)
   - `GROQ_API_KEY` — Groq API key (`gsk_...`)

### Docker Compose Environment Variables

Set in `~/docker-compose.yml` on the EC2 instance (not secret — safe to commit):

1. `PATH_PREFIX` — URL path prefix for the Flask app, e.g. `/ai-01` — tells Flask which prefix Nginx forwards under

---

## When to Upgrade to ECS Fargate + ALB

Upgrade when a project needs to scale beyond a single EC2 instance, requires zero-downtime blue/green deployments, or sustained concurrent traffic consistently exceeds what a `t3.small` can handle.

---

# AI Playground (basic / ai-01)

For initial setup (tools, production, local dev), see [Setup Guide § 3.1](SETUP.md#31-ai-playground-basic--ai-01) and [§ 4.1](SETUP.md#41-ai-playground-basic--ai-01).

---

## Deployment Target

- **URL:** `https://app.techtoday.click/ai-01/`
- **Container port:** `5000` (mapped to EC2 port `5000`)
- **ECR repository:** `techtoday/ai-01`
- **Path prefix env var:** `PATH_PREFIX=/ai-01`

---

## Secrets & Environment Variables (ai-01)

Shared CI/CD secrets (`AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, `EC2_SSH_KEY`) are documented once in the [Secrets & Environment Variables Reference](#secrets--environment-variables-reference) section above — set them in GitHub repo Settings, not here.

Project-specific values (set as described in [Setup Guide § 3.1](SETUP.md#31-ai-playground-basic--ai-01)):

1. `OPENAI_API_KEY` — AWS Secrets Manager, secret `techtoday/ai-01/openai-api-key` — used by `travel`, `summarize`, and `arena`
2. `GROQ_API_KEY` — AWS Secrets Manager, secret `techtoday/ai-01/openai-api-key` — used by `joke` and `arena`
3. `PATH_PREFIX` — set directly in `~/docker-compose.yml` on EC2 (not secret)

---

## Flask Path Prefix Configuration

Because Nginx forwards the full path (e.g., `/ai-01/joke`) to the container, Flask mounts routes under a `PATH_PREFIX` env var via a Blueprint:

```python
# src/app.py (abbreviated)
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")  # /ai-01 in production, empty locally
app.register_blueprint(bp, url_prefix=PATH_PREFIX)
```

- **Locally:** `PATH_PREFIX` unset → routes are `/`, `/joke`, `/travel`, `/summarize`, `/arena`
- **On EC2:** `PATH_PREFIX=/ai-01` → routes are `/ai-01/`, `/ai-01/joke`, `/ai-01/travel`, `/ai-01/summarize`, `/ai-01/arena`

The served `index.html` also needs to know the prefix so its `fetch()` calls hit `/ai-01/joke` instead of `/joke`. The `index` route injects it by rewriting the page's `const API = "";` line with the current `PATH_PREFIX` value before returning the HTML.

---

## Day-to-Day Development Loop (ai-01)

Follow the [common git workflow](#day-to-day-git-workflow) above for branching, committing, and opening a PR. Use `git add projects/basic` and `feat(ai-01): …` as the commit prefix. The steps below cover the project-specific local dev loop.

1. Edit files under `src/` — changes are picked up immediately via volume mount, no rebuild needed.
2. Run the web UI:
   ```bash
   docker compose up web
   # open http://localhost:8080
   ```
3. Run individual features from the CLI:
   ```bash
   docker compose run --rm joke
   docker compose run --rm travel
   docker compose run --rm summarize
   docker compose run --rm arena
   ```
4. Rebuild only when `requirements.txt` or `Dockerfile` changes:
   ```bash
   docker compose build
   ```
5. Tear down when done:
   ```bash
   docker compose down
   ```

### Useful Commands

1. Tail logs: `docker compose logs -f web`
2. Shell into container: `docker compose run --rm web bash`
3. Container status: `docker compose ps`

---

## CI/CD (ai-01)

Automated via [.github/workflows/deploy-ai-01.yml](../.github/workflows/deploy-ai-01.yml). Triggers on any push to `main` touching `projects/basic/**`. See the [OIDC and GitHub Secrets setup](SETUP.md#210-set-up-github-oidc-and-deploy-role-cicd) in the Setup Guide.

---

# TechToday Home Page

For initial setup (production Nginx/SSL/DNS, local preview), see [Setup Guide § 3.2](SETUP.md#32-techtoday-home-page) and [§ 4.2](SETUP.md#42-techtoday-home-page).

---

## Deployment Target (techtoday)

1. `techtoday.click` — path `/` — Static files (HTML, CSS, JS)
2. `www.techtoday.click` — path `/` — Redirect → `techtoday.click`

The static files in `src/` are served directly from the root of the main domain. No Docker container or application server is needed.

This project has no project-specific secrets or environment variables — it's a static site with no server-side API keys.

---

## Day-to-Day Workflow (techtoday)

Follow the [common git workflow](#day-to-day-git-workflow) above for branching, committing, and opening a PR. Use `git add projects/techtoday/` and `feat(techtoday): …` as the commit prefix.

1. Edit files under `src/` — save and reload the browser to see changes.

---

## Adding a New Project Card

1. Open `src/index.html`.
2. Locate the `<div class="grid">` inside `<section id="projects">`.
3. Copy an existing `<div class="card">` block and update the icon, title, description, link, and status badge.
4. Status values: `<span class="status live">Live</span>` or `<span class="status soon">Coming soon</span>`.

---

## Option B — S3 + CloudFront (Zero-Maintenance)

Best for pure static hosting with global CDN, no EC2 involvement.

> **CloudShell / Console alternative:** The S3 and CloudFront commands in this section can be run in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) (except `s3 sync` from local files — use the Console upload UI instead). Console UI steps are shown alongside each CLI command below.

**1. Create an S3 bucket:**

```bash
aws s3api create-bucket \
  --bucket techtoday-site \
  --region us-east-1
```

**AWS Console:** Open **S3** → **Create bucket** → **Bucket name:** `techtoday-site` → **Region:** `us-east-1` → **Create bucket**

**2. Upload site files:**

```bash
aws s3 sync projects/techtoday/src/ s3://techtoday-site/ \
  --delete \
  --cache-control "public, max-age=86400"

# Set shorter cache for HTML so updates propagate quickly
aws s3 cp projects/techtoday/src/index.html s3://techtoday-site/index.html \
  --cache-control "public, max-age=60"
```

**AWS Console:** Open the `techtoday-site` bucket → **Upload** → drag and drop all files from `projects/techtoday/src/` → **Upload**. To set cache headers, select the uploaded files → **Actions** → **Edit metadata** → add `Cache-Control` = `public, max-age=86400` (use `max-age=60` for `index.html`).

**3. Create a CloudFront distribution** pointing to the S3 bucket, with:
- Default root object: `index.html`
- HTTPS redirect enforced
- Custom domain: `techtoday.click` and `www.techtoday.click`
- ACM certificate (us-east-1 region required for CloudFront)

**AWS Console:** Open **CloudFront** → **Create distribution** → **Origin domain:** select the `techtoday-site.s3.amazonaws.com` bucket → **Default root object:** `index.html` → **Viewer protocol policy:** Redirect HTTP to HTTPS → **Alternate domain names (CNAMEs):** add `techtoday.click` and `www.techtoday.click` → **Custom SSL certificate:** select your ACM certificate (must be in `us-east-1`) → **Create distribution**

**4. Create Route 53 A alias records** pointing `techtoday.click` and `www.techtoday.click` to the CloudFront distribution domain.

**AWS Console:** Open **Route 53** → **Hosted zones** → `techtoday.click` → **Create record** → **Record type:** `A` → toggle **Alias** on → **Route traffic to:** CloudFront distribution → select your distribution → **Create records**. Repeat for `www`.

---

## Deploying Updates (Option B — S3 + CloudFront)

> **Note:** The `s3 sync` command below requires access to local project files — it cannot be run from AWS CloudShell. Use your local terminal, or upload files via the S3 Console UI (**S3** → `techtoday-site` bucket → **Upload**). The `cloudfront create-invalidation` command can be run in CloudShell.

```bash
aws s3 sync projects/techtoday/src/ s3://techtoday-site/ \
  --delete \
  --cache-control "public, max-age=86400"

aws s3 cp projects/techtoday/src/index.html s3://techtoday-site/index.html \
  --cache-control "public, max-age=60"

# Invalidate the CloudFront cache so visitors see the new version immediately
DISTRIBUTION_ID=<your-cloudfront-distribution-id>
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

---

## CI/CD (techtoday)

See [.github/workflows/deploy-techtoday.yml](../.github/workflows/deploy-techtoday.yml) for the automated deploy pipeline. It triggers on any push to `main` that touches `projects/techtoday/src/**` and runs `rsync` (Option A) to copy the updated static files to EC2.
