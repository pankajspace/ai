[← Architecture Guide](../ARCHITECTURE.md) · [Setup Guide](../SETUP.md)

# Project Automation Scripts

Two scripts turn "add a new project" from a long list of terminal + SSH commands into two commands. They automate everything in the shared Setup Guide's "Adding a New Project" section.

1. `new-project.sh` — repo-side scaffolding (no AWS/SSH). Clones a template project, assigns the next free port, and generates the CI/CD workflow.
2. `provision-project.sh` — production provisioning (AWS + SSH). Creates the ECR repo, builds & pushes the image, and wires up the EC2 host (env file, Docker Compose service, Nginx location, restart).
3. `lib.sh` — shared configuration and helpers sourced by both scripts.
4. `.env.example` — template of all configurable variables; copy to `.env` (gitignored) to set your values.

---

## Prerequisites

1. Local machine prerequisites from the shared Setup Guide § 1 (Docker, AWS CLI, SSH, git).
2. The one-time AWS infrastructure from the shared Setup Guide § 3 (EC2, ECR access, Secrets Manager, Nginx, SSL) must already exist.
3. AWS CLI authenticated (`aws sts get-caller-identity` works).
4. SSH access to the EC2 host with the key named in `lib.sh` (`techtoday.pem` by default).

---

## Quick Start — Add a Project End to End

```bash
cd projects/scripts

# 1. Scaffold the repo (folder + workflow + next free port)
./new-project.sh ai-03

# 2. Replace the template code in projects/ai-03/src/ with your project,
#    then test locally:
cd ../ai-03 && docker compose up web   # → http://localhost:<local-port>

# 3. Provision production once (ECR + build/push + EC2 wiring)
cd ../scripts
./provision-project.sh ai-03

# 4. Commit & push. Future changes under projects/ai-03/ auto-deploy via
#    .github/workflows/deploy-ai-03.yml
```

---

## `new-project.sh`

Scaffolds a new container project by cloning a template (default: `langchain`).

```bash
./new-project.sh <name> [--port N] [--template <project>]
```

What it does:

1. Copies the template project to `projects/<name>/` (excluding caches, `.env`).
2. Assigns the next free local port and writes it into `docker-compose.yml`.
3. Resets `.env` from `.env.example`.
4. Generates `.github/workflows/deploy-<name>.yml` from the template's workflow.
5. Prints the next steps.

It makes no AWS or SSH calls — it only touches the repo, so it is safe to run and inspect before provisioning.

---

## `provision-project.sh`

Runs the one-time production setup for a scaffolded project.

```bash
./provision-project.sh <name> [--port N] [--build-only] [--skip-build]
```

What it does:

1. Creates the ECR repository `techtoday/<name>` (idempotent — skips if it exists).
2. Builds the `linux/amd64` image and pushes it to ECR.
3. Over SSH on the EC2 host:
   1. Writes `~/secrets/<name>.env` from the shared Secrets Manager secret.
   2. Adds or replaces the `<name>` service in `~/docker-compose.yml`.
   3. Adds or replaces the `location /<name>/` block in the Nginx config, then `nginx -t` + reload.
   4. Pulls the image and restarts only the `<name>` container (`--no-deps`).
4. Verifies `https://app.techtoday.click/<name>/` responds.

Options:

1. `--port N` — force the production host port (default: derived from the project's local compose port; 8080↔5000, 8081↔5001, …).
2. `--build-only` — create the ECR repo and push the image, but skip all EC2 configuration.
3. `--skip-build` — skip build/push (use when the image is already in ECR) and only (re)configure EC2.

All remote steps are idempotent: re-running replaces the project's service and Nginx block rather than appending duplicates, so it is safe to run again after changing the port or image.

---

## Configuration

Copy `.env.example` to `.env` and edit it to set your values:

```bash
cp .env.example .env
```

`.env` is gitignored. Values are resolved with this precedence (highest first):

1. Inline environment variables passed to the command.
2. Values in `.env`.
3. Built-in defaults in `lib.sh`.

Available variables:

1. `AWS_REGION` — AWS region (default `us-east-1`).
2. `ECR_NAMESPACE` — ECR repo prefix (default `techtoday`).
3. `SECRET_ID` — shared Secrets Manager secret (default `techtoday/secrets`).
4. `ELASTIC_IP` — EC2 public IP (default `44.193.134.238`).
5. `EC2_USER` / `SSH_KEY` — SSH user and key file (default `ec2-user` / `techtoday.pem`).
6. `REMOTE_COMPOSE` / `REMOTE_SECRETS_DIR` / `REMOTE_NGINX_CONF` — paths on the EC2 host.
7. `APP_DOMAIN` — app subdomain (default `app.techtoday.click`).
8. `LOCAL_BASE_PORT` / `PROD_BASE_PORT` — port bases (default `8080` / `5000`).
9. `TEMPLATE_PROJECT` — default template for scaffolding (default `langchain`).

Inline overrides still work and take priority over `.env`:

```bash
AWS_REGION=eu-west-1 SSH_KEY=~/keys/techtoday.pem ./provision-project.sh ai-03
```

---

## Notes

1. The scripts assume container projects expose port `5000` inside the container (as the `basic` and `langchain` templates do). Static projects like `techtoday` are not container projects and are not managed by these scripts.
2. New projects reuse the shared `techtoday/secrets` secret. If your project needs a new key, add it to that secret in Secrets Manager first.
3. After provisioning, day-to-day deploys are automatic via the generated GitHub Actions workflow — you only run `provision-project.sh` once per project.
