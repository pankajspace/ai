[← README](../README.md)

# Projects Architecture — techtoday.click

Architecture, shared configuration, and design decisions for the projects in this
repository. The current project inventory lives in [PROJECTS.md](PROJECTS.md), so
this file should not need edits when a new project is added.

## Architecture Overview

```text
Internet
   |
   v
Route 53 hosted zone: techtoday.click
   |-- techtoday.click      -> A record -> EC2 Elastic IP  (static home page)
   |-- www.techtoday.click  -> A record -> EC2 Elastic IP  (redirect)
   `-- app.techtoday.click  -> A record -> EC2 Elastic IP  (container apps)
                                      |
                                      v
                         EC2 instance (shared app server)
                         |-- Nginx
                         |   |-- techtoday.click/ -> /var/www/techtoday
                         |   `-- /<project-name>/ -> localhost:<host-port>
                         |
                         `-- Docker Compose
                             `-- one service per container app

ECR             -> one techtoday/<project-name> image repository per container app
Secrets Manager -> shared techtoday/secrets API-key store
GitHub Actions  -> one deploy workflow per project trigger path
```

## Why This Architecture

1. **No ALB** — Nginx replaces the Application Load Balancer, saving about $16/month.
2. **No Fargate** — containers run directly on EC2; static files are served directly by Nginx.
3. **Free SSL** — Let's Encrypt and Certbot manage certificates and renewal.
4. **Path-based routing** — Nginx `location /<project-name>/` blocks route each app path to its service port.
5. **Single DNS record for apps** — all container projects share `app.techtoday.click`.
6. **Low-friction project growth** — a new container app adds an ECR repo, Nginx location, Docker Compose service, and CI/CD workflow.
7. **Shared secrets management** — Secrets Manager stores API keys outside Git, images, and compose files.

## Cost

1. **EC2 t2.micro** — free on AWS Free Tier for the first 12 months; about $8/month on demand afterward.
2. **Elastic IP** — free while attached to a running instance.
3. **Route 53 hosted zone** — about $0.50/month.
4. **Secrets Manager** — about $0.40 per secret per month.
5. **ECR storage** — about $0.10/GB/month.
6. **Each additional project** — $0/month for shared infrastructure, aside from storage and compute pressure on the same EC2 instance.

Use a `t3.small` when running several memory-intensive projects at the same time.

## Shared Runtime Conventions

1. Static files for the root site are served from `/var/www/techtoday`.
2. Container apps listen on port `5000` inside the container.
3. Each container app maps to a unique EC2 host port.
4. Each container app mounts routes under `PATH_PREFIX=/<project-name>` in production.
5. Nginx forwards the full path, so Flask apps register routes under the runtime `PATH_PREFIX`.
6. Production compose services run `command: python src/python/app.py`.
7. Project-specific ports, paths, workflows, and secrets are listed in [PROJECTS.md](PROJECTS.md).

## CI/CD Model

Each project has its own GitHub Actions workflow under `.github/workflows/`.
Workflows are scoped to one project folder, build only that project, push its image
or static files, and restart or sync only the affected production target.

Shared prerequisites:

1. GitHub Actions OIDC role for AWS access.
2. GitHub repository secrets for AWS account, region, deploy role, EC2 host, and SSH key.
3. One ECR repository per container app.
4. EC2 instance role with ECR pull and Secrets Manager read permissions.

The workflow names and trigger paths for current projects live in
[PROJECTS.md](PROJECTS.md).

## Best Practices

### IAM and Security

1. Use the dedicated `techtoday` IAM user instead of root credentials for local AWS commands.
2. Enable MFA for the IAM user and root account.
3. Rotate access keys if long-lived keys are ever created.
4. Keep EC2 permissions narrow: Secrets Manager read for `techtoday/*` and ECR pull access.
5. Use GitHub Actions OIDC instead of static AWS credentials in CI/CD.
6. Store API keys only in Secrets Manager.
7. Restrict SSH to your IP when practical.
8. Enforce HTTPS through Nginx redirects and Certbot-managed certificates.

### Containers and Images

1. Tag images with full git SHA, build tag, and `latest`.
2. Configure ECR image scanning at the registry level with repository filtering.
3. Use `restart: unless-stopped` for production services.
4. Keep Python app entrypoints under `src/python/app.py`.
5. Rebuild images when `requirements.txt` or `Dockerfile` changes.

### Operations

1. Keep routine work in [DAILY.md](DAILY.md).
2. Keep new-project setup in [ADD_PROJECT.md](ADD_PROJECT.md).
3. Keep the project inventory in [PROJECTS.md](PROJECTS.md).
4. Avoid adding per-project lists to architecture or setup docs.

## When to Upgrade to ECS Fargate and ALB

Upgrade when a project needs to scale beyond a single EC2 instance, requires
zero-downtime blue/green deployments, or has sustained concurrent traffic beyond
what a small shared EC2 instance can handle.
