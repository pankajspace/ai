# AWS Deployment Guide

Deploy projects to AWS with a scalable domain/subdomain structure.

---

## Domain & Subdomain Strategy

```
yourdomain.com              → Main landing page (links to all projects)
ai.yourdomain.com           → All AI projects (path-based routing)
  ai.yourdomain.com/joke
  ai.yourdomain.com/travel
  ai.yourdomain.com/next-project
web.yourdomain.com          → Future web/frontend projects
api.yourdomain.com          → Future API-only projects (optional)
```

**Why this approach:**
- One subdomain per technology category, not per project — scales cleanly
- Path-based routing inside each subdomain avoids DNS sprawl
- Main domain is always the "portfolio hub"

---

## AWS Architecture

```
User
 └── Route 53 (DNS)
      ├── yourdomain.com → CloudFront → S3 (Landing Page)
      └── ai.yourdomain.com → CloudFront → ALB
                                             ├── /joke*   → ECS Fargate (Joke Service)
                                             └── /travel* → ECS Fargate (Travel Service)
                                                              └── ECR (Docker Registry)
                                                              └── Secrets Manager (API Keys)
```

---

## Step-by-Step Deployment

### Phase 1: Prerequisites & DNS Setup

**Step 1 — Domain in Route 53**
- If domain is elsewhere (GoDaddy, Namecheap), either transfer to Route 53 or update nameservers to Route 53's NS records
- In Route 53 → Create Hosted Zone for `yourdomain.com`

**Step 2 — SSL Certificates (ACM)**
```
AWS Certificate Manager → Request public certificate
Add domains:
  yourdomain.com
  *.yourdomain.com       ← wildcard covers all subdomains
```
- Use DNS validation (ACM gives you a CNAME to add to Route 53 — it can auto-add it)

---

### Phase 2: Main Landing Page

**Step 3 — S3 + CloudFront for `yourdomain.com`**
```bash
# Create S3 bucket
aws s3 mb s3://yourdomain.com
aws s3 website s3://yourdomain.com --index-document index.html

# Create CloudFront distribution pointing to S3
# Attach ACM cert, set CNAME to yourdomain.com
```
- Build a simple `index.html` that lists and links to all your projects
- This page gets updated as you add new projects

---

### Phase 3: Add Web Interface to Current Projects

> **Important:** The current `basic` project is CLI-only. To deploy as a web app, an HTTP wrapper is needed.

**Step 4 — Add FastAPI to each project**

Add `src/main.py` — a FastAPI app that exposes your existing functions as HTTP endpoints:

```
projects/
  basic/
    src/
      joke.py
      travel.py
      config.py
      main.py          ← FastAPI app (new)
```

**Step 5 — Update Dockerfile CMD**
```dockerfile
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Phase 4: ECS Fargate Setup

**Step 6 — ECR (Docker Registry)**
```bash
# Create one repo per project
aws ecr create-repository --repository-name ai/joke
aws ecr create-repository --repository-name ai/travel

# Build and push
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t ai/joke .
docker tag ai/joke:latest <account>.dkr.ecr.<region>.amazonaws.com/ai/joke:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/ai/joke:latest
```

**Step 7 — Secrets Manager (for API keys)**
```bash
aws secretsmanager create-secret --name ai/openai-api-key --secret-string "sk-..."
aws secretsmanager create-secret --name ai/groq-api-key --secret-string "gsk_..."
```
- Reference these in ECS Task Definitions — never bake secrets into images or `.env` files

**Step 8 — ECS Cluster + Fargate Services**
```
ECS → Create Cluster (Fargate)
  → Create Task Definition for each service
      - Container image: ECR URL
      - Port: 8000
      - Secrets: inject from Secrets Manager
  → Create Service per task
      - Attach to ALB target group
```

**Step 9 — Application Load Balancer**
```
ALB → Create listener on port 443 (HTTPS)
    → Listener Rules:
        Path /joke*   → Target Group: joke-service
        Path /travel* → Target Group: travel-service
        Default       → 404 or redirect to landing page
```

**Step 10 — CloudFront for `ai.yourdomain.com`**
```
CloudFront → Create distribution
  Origin: ALB (for API/dynamic)
  Origin: S3  (for UI assets — future)
  HTTPS only, attach ACM cert
  CNAME: ai.yourdomain.com
```

**Step 11 — Route 53 DNS**
```
A record (alias): yourdomain.com    → CloudFront distribution (landing page)
A record (alias): ai.yourdomain.com → CloudFront distribution (AI projects)
```

---

### Phase 5: CI/CD (Automated deploys on git push)

**Step 12 — GitHub Actions pipeline**

File: `.github/workflows/deploy-ai.yml`
```yaml
on:
  push:
    branches: [main]
    paths: [projects/**]

jobs:
  build-push-deploy:
    steps:
      - Login to ECR
      - Docker build & push
      - Update ECS service (force new deployment)
```

---

## Adding Future Projects with UI

For projects that have a frontend:
- Host UI assets (React/Next.js build output) in an **S3 bucket**
- Serve via the same CloudFront distribution on a dedicated path:
  - `ai.yourdomain.com/myapp`     → S3 (frontend)
  - `ai.yourdomain.com/myapp/api` → App Runner / ECS (backend)

---

## Cost Estimate (monthly, low traffic)

| Service | Est. Cost |
|---|---|
| Route 53 | ~$0.50/hosted zone |
| ACM | Free |
| S3 + CloudFront (landing page) | ~$1–2 |
| ECS Fargate (scale-to-zero) | ~$5–15 |
| ALB | ~$16 (fixed) |
| Secrets Manager | ~$0.40/secret |
| ECR | ~$0.10/GB |
| **Total** | **~$25–40/month** |

---

## Recommended for Early Stage: AWS App Runner

App Runner is simpler and cheaper than ECS+ALB for small services:

```
App Runner → Create service
  Source: ECR image
  Port: 8000
  Env vars: from Secrets Manager
  Auto-scaling: 0–5 instances
  Custom domain: ai.yourdomain.com
```

**Switch to ECS+ALB when** you have many services or need advanced path-based routing.

---

## Deployment Checklist

- [ ] Route 53 hosted zone + NS records updated on registrar
- [ ] ACM wildcard cert (`*.yourdomain.com`) issued and validated
- [ ] S3 + CloudFront for `yourdomain.com` landing page
- [ ] Add FastAPI wrapper (`src/main.py`) to existing Python projects
- [ ] ECR repositories created for each project
- [ ] API keys stored in Secrets Manager
- [ ] App Runner service (or ECS+ALB) deployed per project
- [ ] CloudFront distribution for `ai.yourdomain.com`
- [ ] Route 53 A records for each subdomain
- [ ] GitHub Actions CI/CD pipeline configured
