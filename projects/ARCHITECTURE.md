[← README](../README.md) · [Setup Guide](SETUP.md) · [Projects Reference](PROJECTS.md)

# Projects Architecture — techtoday.click

Architecture, configuration reference, design decisions, and the shared development workflow for all projects.

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
                              │  /basic/*           → localhost:5000          │
                              │  /langchain/*       → localhost:5001          │
                              └───────────────────────────────────────────────┘
                                         │
                              Docker Compose (app subdomain only)
                              ├── basic      (port 5000, from ECR)
                              └── langchain  (port 5001, from ECR)

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

## Best Practices

### IAM & Security

1. **Dedicated IAM user for CLI** — use the `techtoday-admin` IAM user instead of root credentials for all local `aws` commands
2. **Enable MFA** — turn on multi-factor authentication for the IAM user and the root account
3. **Rotate access keys** — rotate the IAM user's access keys periodically (`aws iam create-access-key` → update `aws configure` → `aws iam delete-access-key` for the old key)
4. **Least privilege** — EC2 role allows only `secretsmanager:GetSecretValue` on `techtoday/*` and ECR read; the IAM user policy is scoped to the specific services used in this guide
5. **No static credentials in CI/CD** — GitHub Actions uses OIDC; SSH key is a GitHub Secret
6. **Secrets Manager only** — API keys are never in `docker-compose.yml`, repo files, or images
7. **Restrict SSH** — after setup, tighten the security group SSH rule to your IP only (`YOUR_IP/32`)
8. **HTTPS enforced** — Nginx redirects all HTTP to HTTPS; certs auto-renew via Certbot cron

### Container & Image

9. **Tag images three ways** — full git SHA, build tag (`YYYYMMDD-HHMMSS-<run>-<sha>`), and `latest`
10. **ECR image scanning** — configured at registry level via repository filtering (not per-repository `scanOnPush`)
11. **`restart: unless-stopped`** — containers restart automatically after EC2 reboots

### Cost

12. **Free Tier** — `t2.micro` is free for 750 hrs/month in the first AWS year (= free 24/7)
13. **ECR lifecycle policy** — delete untagged images older than 7 days to avoid storage accumulation

---

## CI/CD Workflows

Each project has its own GitHub Actions workflow under `.github/workflows/`:

| Project | Workflow | Trigger Path | What It Does |
|---|---|---|---|
| techtoday | [deploy-techtoday.yml](../.github/workflows/deploy-techtoday.yml) | `projects/techtoday/**` | rsync `src/` to `/var/www/techtoday` on EC2 |
| basic | [deploy-basic.yml](../.github/workflows/deploy-basic.yml) | `projects/basic/**` | Build → ECR push → SSH pull + restart container |
| langchain | [deploy-langchain.yml](../.github/workflows/deploy-langchain.yml) | `projects/langchain/**` | Build → ECR push → SSH pull + restart container |

Prerequisites: GitHub repo secrets + the one-time AWS infrastructure setup.

---

## When to Upgrade to ECS Fargate + ALB

Upgrade when a project needs to scale beyond a single EC2 instance, requires zero-downtime blue/green deployments, or sustained concurrent traffic consistently exceeds what a `t3.small` can handle.

---

## Development Workflow

The shared git flow for all projects. Per-project develop / commit / deploy / rollback commands live in each project's own folder.

### 1. Start a Feature

```bash
git checkout main && git pull origin main
git checkout -b feat/short-description
```

### 2. Develop, Commit & Deploy

Each project has its own local dev loop and deployment target:

1. **techtoday** — static preview; deploys to the root domain
2. **basic** — web UI on port 8080; deploys to `/basic/`
3. **langchain** — web UI on port 8081; deploys to `/langchain/`

Each project scopes its commits to its own folder (e.g. `git add projects/basic/`), then opens a PR and **squash-merges** into `main`.

### 3. Deploy (Automatic)

Merging to `main` triggers CI/CD automatically — no manual steps needed. Each project has its own workflow (see [CI/CD Workflows](#cicd-workflows) above), triggered only when that project's files change. Watch the run under **GitHub → Actions** to confirm it succeeds.

### 4. Verify Production

```bash
curl -I https://techtoday.click/
curl -I https://app.techtoday.click/basic/
curl -I https://app.techtoday.click/langchain/
```

Or just open the URLs in a browser.

### 5. Rollback & Manual Deploy

These are project-specific — each project folder documents its own **Rollback** and **Manual Deploy** steps.

> Reminder: `$ELASTIC_IP` is the public IP of the EC2 instance (AWS console → EC2 → Instances → techtoday-server). For us it is `44.193.134.238`.

---

# TechToday Home Page

---

## Deployment Target (techtoday)

1. `techtoday.click` — path `/` — Static files (HTML, CSS, JS)
2. `www.techtoday.click` — path `/` — Redirect → `techtoday.click`

The static files in `src/` are served directly from the root of the main domain. No Docker container or application server is needed.

This project has no project-specific secrets or environment variables — it's a static site with no server-side API keys.

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

# AI Playground (basic)

---

## Deployment Target

- **URL:** `https://app.techtoday.click/basic/`
- **Container port:** `5000` (mapped to EC2 port `5000`)
- **ECR repository:** `techtoday/basic`
- **Path prefix env var:** `PATH_PREFIX=/basic`

---

## Flask Path Prefix Configuration

Because Nginx forwards the full path (e.g., `/basic/joke`) to the container, Flask mounts routes under a `PATH_PREFIX` env var via a Blueprint:

```python
# src/app.py (abbreviated)
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")  # /basic in production, empty locally
app.register_blueprint(bp, url_prefix=PATH_PREFIX)
```

- **Locally:** `PATH_PREFIX` unset → routes are `/`, `/joke`, `/travel`, `/summarize`, `/arena`
- **On EC2:** `PATH_PREFIX=/basic` → routes are `/basic/`, `/basic/joke`, `/basic/travel`, `/basic/summarize`, `/basic/arena`

The served `index.html` also needs to know the prefix so its `fetch()` calls hit `/basic/joke` instead of `/joke`. The `index` route injects it by rewriting the page's `const API = "";` line with the current `PATH_PREFIX` value before returning the HTML.

---

# LangChain Lab (langchain)

This project demonstrates three core LangChain building blocks — **chains** (a `prompt | model | parser` website summarizer), **memory** (a chatbot that re-sends conversation history each turn), and **agents** (a tool-using shop assistant with OpenAI function calling). It follows the exact same architecture as the AI Playground (basic): per-feature modules under `src/` behind a thin Flask API, served from a Docker container.

---

## Deployment Target (langchain)

- **URL:** `https://app.techtoday.click/langchain/`
- **Container port:** `5000` (mapped to EC2 port `5001`)
- **ECR repository:** `techtoday/langchain`
- **Path prefix env var:** `PATH_PREFIX=/langchain`
- **Secret:** only `OPENAI_API_KEY` (no Groq key — every feature uses GPT-4o mini)

---

## Flask Path Prefix Configuration (langchain)

Identical to the basic project: routes are attached to a Blueprint and registered once under the runtime `PATH_PREFIX`.

```python
# src/app.py (abbreviated)
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")  # /langchain in production, empty locally
app.register_blueprint(bp, url_prefix=PATH_PREFIX)
```

- **Locally:** `PATH_PREFIX` unset → routes are `/`, `/summarize`, `/chat`, `/agent`
- **On EC2:** `PATH_PREFIX=/langchain` → routes are `/langchain/`, `/langchain/summarize`, `/langchain/chat`, `/langchain/agent`

The served `index.html` also needs the prefix; the `index` route injects it by rewriting the page's `data-api-base=""` attribute with the current `PATH_PREFIX` value before returning the HTML.
