# Add a New Container Project

Use this checklist when adding a new container app after the shared setup in
[SETUP.md](SETUP.md) is complete. Put all routine development, deployment,
rollback, troubleshooting, and project-specific configuration in the new
project's `README.md`. Keep the current next-port allocation in this guide.

## 1. Pick Project Values

The current next available values are:

1. Local development port: `8085`.
2. EC2 host port: `5005`.
3. Container port: `5000`.

After adding a project, advance the local and EC2 values in this section so the
next project does not reuse them.

For a new container app, choose:

1. `<project-name>` — folder name, Docker Compose service name, and URL path segment.
2. `<local-port>` — next free local `808x` port.
3. `<host-port>` — next free EC2 host `500x` port.
4. Container port — always `5000`.

No new DNS record, EC2 instance, IAM role, or SSL certificate is needed. All
container apps share `https://app.techtoday.click`, the EC2 host, Nginx, and the
app-domain SSL certificate.

## 2. Scaffold the Project Folder

Copy the reusable template project:

```bash
# Run on: local machine
PROJECT_NAME=<project-name>
cd projects
cp -r template "$PROJECT_NAME"
cd "$PROJECT_NAME"
```

Adjust the copied files:

1. `docker-compose.yml` — change the `web` service's published port from `8090` to `<local-port>`.
2. `src/python/` — replace the starter `echo` feature and update `src/python/app.py` routes. Keep `PATH_PREFIX` support.
3. `src/index.html`, `src/css/`, and `src/js/` — update the UI and browser behavior for the new project.
4. `requirements.txt` — add libraries the project needs.
5. `.env.example` — list required environment variables.
6. `linkedin.txt` — add launch/update copy, or leave it empty until ready.
7. `README.md` — describe the project, features, routes, local port, and production target.

The local port mapping should look like this:

```yaml
services:
  web:
    build: .
    env_file: .env
    command: python src/python/app.py
    ports:
      - "<local-port>:5000"
    volumes:
      - ./src:/app/src
```

## 3. Test Locally

Start Docker before running any `docker compose` command:

1. **macOS or Windows:** open **Docker Desktop** and wait until Docker
  is running, then verify with `docker info`.
2. **Linux:** run `sudo systemctl start docker`, then verify with `docker info`.

```bash
# Run on: local machine
cd projects/<project-name>
cp .env.example .env
docker compose build web
docker compose up web
# → http://localhost:<local-port>
```

Use `docker compose build web` for the normal browser app. A plain
`docker compose build` rebuilds every service in `docker-compose.yml`, including
one-off CLI services, and can take longer even when most layers are cached.

Fill `.env` with real local values before running features that need API keys.
Never commit `.env`.

## 4. Store Any New Secrets

If the project needs new API keys, add them to the shared `techtoday/secrets`
Secrets Manager secret. The EC2 instance role already grants read access to
`techtoday/*`, so no IAM change is needed, and the deploy workflow regenerates
the project's env file from this secret on every run — so no server-side change
is needed either. This is the only manual AWS step for a new project, and only
when it introduces brand-new keys.

AWS Console path: **Secrets Manager** → `techtoday/secrets` → **Retrieve secret
value** → **Edit** → add key/value → **Save**.

CLI update pattern:

```bash
# Run on: local machine
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['NEW_KEY']='new-value'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

If the project only uses existing keys, skip this step.

## 5. Add the Self-Provisioning Deploy Workflow

The template ships a self-provisioning workflow at
`projects/<project-name>/deploy.yml.template`. On the first push it creates the
ECR repository, seeds the image, writes the project's secrets env file, drops
the Nginx `location /<project-name>/` block into
`/etc/nginx/conf.d/app-locations/`, and creates a per-project Docker Compose
file on EC2 — so there is no manual ECR creation, image seed, or SSH wiring.
Copy it into `.github/workflows/` and replace both placeholders: the project
name and its EC2 host port.

```bash
# Run on: local machine, from the repo root
PROJECT_NAME=<project-name>
HOST_PORT=<host-port>
cp projects/$PROJECT_NAME/deploy.yml.template .github/workflows/deploy-$PROJECT_NAME.yml

# macOS
sed -i '' -e "s/PROJECT_NAME/$PROJECT_NAME/g" -e "s/HOSTPORT/$HOST_PORT/g" .github/workflows/deploy-$PROJECT_NAME.yml

# Linux
sed -i -e "s/PROJECT_NAME/$PROJECT_NAME/g" -e "s/HOSTPORT/$HOST_PORT/g" .github/workflows/deploy-$PROJECT_NAME.yml

grep -nE 'PROJECT_NAME|HOSTPORT' .github/workflows/deploy-$PROJECT_NAME.yml
test -f .github/workflows/deploy-$PROJECT_NAME.yml && echo "workflow file OK"
```

The final `grep` should print nothing, and the `test -f` command should print
`workflow file OK`.

The workflow reuses the shared GitHub secrets already configured for this repo:
`AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, and
`EC2_SSH_KEY`.

> **Nginx include (handled automatically):** per-project location files only
> take effect once the `app.techtoday.click` server block includes
> `/etc/nginx/conf.d/app-locations/*.conf`. Fresh hosts get this from
> [SETUP.md](SETUP.md) § 2.8, and the deploy workflow auto-inserts it into the
> SSL server block on its first run if it is missing — so there is no manual
> per-host step.

## 6. Deploy

Commit and push to `main`. The push under `projects/<project-name>/` triggers
the workflow, which provisions and deploys everything automatically:

```bash
# Run on: local machine
git add projects/<project-name> .github/workflows/deploy-<project-name>.yml
git commit -m "Add <project-name> project"
git push origin main
```

Watch the run under the repository's **Actions** tab. The first run creates all
AWS and EC2 resources for the project; later pushes rebuild and restart only
this project.

## 7. Verify Production

```bash
# Run on: local machine
curl -I https://app.techtoday.click/<project-name>/
```

Open `https://app.techtoday.click/<project-name>/` in a browser and confirm it
loads over HTTPS.

## 8. Finalize Project Documentation

After the project works:

1. Document its folder, URLs, ports, ECR repository, path prefix, routes, workflow, trigger path, and secrets in its `README.md`.
2. Advance the next available local and EC2 host ports in § 1 of this guide.
3. Verify every workflow path listed in the project README exists under `.github/workflows/`.
4. If the project should appear on the public home page, update `projects/techtoday/index.html`.

Public home page card update:

1. Locate the project grid inside the projects section.
2. Copy an existing project card.
3. Update the title, description, link, icon or visual marker, and status badge.
4. Use a live status only after the production URL works.
5. Preview `projects/techtoday/index.html` locally before committing.

After this, routine work follows the new project's `README.md`. Verify that it
contains concrete local setup, daily development, deployment, production
verification, rollback, manual fallback, and troubleshooting commands.
