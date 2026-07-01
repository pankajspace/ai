[← README](README.md) · [Deployment Guide](DEPLOYMENT.md) · [Common Development Guide](../DEVELOPMENT.md)

# Development — AI Playground (basic / ai-01)

This guide covers local development for `projects/basic`, which runs at `app.techtoday.click/ai-01/`. For CI/CD, manual deploy, and rollback see the [common development guide](../DEVELOPMENT.md).

---

## Prerequisites

1. [Podman](https://podman.io/) + [podman-compose](https://github.com/containers/podman-compose)
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for the `travel` feature
3. [Groq API key](https://console.groq.com/keys) — required for the `joke` feature; free tier available
4. **Docker CLI** — only needed for the one-time initial image push in [DEPLOYMENT.md](DEPLOYMENT.md#step-3--initial-image-build-and-push) or for manual deploy/rollback; not required for the local dev loop below. Since Podman's CLI is Docker-compatible, you can skip installing Docker separately and run `alias docker=podman`. See the [common Development Guide](../DEVELOPMENT.md#local-machine-prerequisites) for AWS CLI/SSH details needed for deployment.

### Install Podman

**macOS**
```bash
brew install podman podman-compose
podman machine init --provider applehv
podman machine start
```

**Linux (Debian/Ubuntu)**
```bash
sudo apt install podman podman-compose
```

**Linux (Fedora/RHEL)**
```bash
sudo dnf install podman podman-compose
```

**Windows** — [Podman Desktop](https://podman-desktop.io/) (includes WSL 2 backend)

---

## One-Time Local Setup

```bash
cd projects/basic
cp .env.example .env
# Fill in OPENAI_API_KEY and GROQ_API_KEY in .env
podman-compose build
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
   podman-compose up web
   # open http://localhost:8080
   ```
5. Run individual features from the CLI:
   ```bash
   podman-compose run --rm joke
   podman-compose run --rm travel
   ```
6. Rebuild only when `requirements.txt` or `Dockerfile` changes:
   ```bash
   podman-compose build
   ```
7. Tear down when done:
   ```bash
   podman-compose down
   ```

### Useful Commands

1. Tail logs: `podman-compose logs -f web`
2. Shell into container: `podman-compose run --rm web bash`
3. Container status: `podman-compose ps`

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

Automated via GitHub Actions on merge to `main`. See the [common development guide](../DEVELOPMENT.md) for the full CI/CD workflow, manual fallback deploy, and rollback instructions.
