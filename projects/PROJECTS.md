[← README](../README.md)

# Projects

## 1. Overview

The single source of truth for working on any project in this repo: the shared
**local development**, **daily usage**, and **production deployment** workflow —
documented once using the `template` project as the worked example — plus the
handful of parameters that differ per project. This page stays focused on project
workflow; each project's own README describes what it does and how its code works.

**Before you start:** complete [local machine prerequisites](SETUP.md#1-local-machine-prerequisites) before any local work,
and complete [one-time AWS infrastructure setup](SETUP.md#2-one-time-aws-infrastructure) before any production deployment.
Both are done once and shared by every project.

## 2. Container App Reference

### 2.1. Container App Shared Conventions

These apply to every **container app**. The static `techtoday` home page follows
none of them.

1. **Ports** — each container listens on `5000` *inside* the container and is published on a unique *host* port: `basic` → `5000`, `langchain` → `5001`, next project → `5002`. Locally, map to the next free `808x` port: `basic` → `8080`, `langchain` → `8081`, `template` → `8090`, next → `8082`, so every project can run side by side.
2. **Naming** — a project named `<name>` uses ECR repo `techtoday/<name>`, Nginx path `/<name>/`, Docker Compose service `<name>`, and env var `PATH_PREFIX=/<name>`.
3. **Secrets** — all API keys live in a single shared AWS Secrets Manager secret, `techtoday/secrets`. The EC2 instance role grants read access to everything under `techtoday/*`, so new projects need no IAM changes.
4. **Routing** — one A record (`app.techtoday.click`), one EC2 instance, and one SSL cert are shared by every container app. A new project is a new Nginx `location` block plus a new Docker Compose service — **never** a new DNS record, instance, or cert.
5. **Path-prefix routing** — because Nginx forwards the full path (e.g. `/basic/joke`) to the container, each Flask app mounts its routes on a Blueprint registered under `PATH_PREFIX` (`/<name>` in production, empty locally), and its `index` route rewrites the served HTML so the browser calls the prefixed endpoints. Each project's README documents this for its own routes.

### 2.2. Container App Specs

Every container app follows the same local-development, daily-usage, and
deployment workflow documented below; only these parameters differ.

#### 2.2.1. AI Playground (`basic`)

1. **URL:** `https://app.techtoday.click/basic/`
2. **Ports:** container `5000` → EC2 host `5000`; local dev `8080`
3. **ECR repository:** `techtoday/basic`
4. **Path prefix:** `PATH_PREFIX=/basic` → routes `/basic/`, `/basic/joke`, `/basic/travel`, `/basic/summarize`, `/basic/arena`
5. **Secrets** (in `techtoday/secrets`): `OPENAI_API_KEY` (travel, summarize, arena) and `GROQ_API_KEY` (joke, arena)

#### 2.2.2. LangChain Lab (`langchain`)

1. **URL:** `https://app.techtoday.click/langchain/`
2. **Ports:** container `5000` → EC2 host `5001`; local dev `8081`
3. **ECR repository:** `techtoday/langchain`
4. **Path prefix:** `PATH_PREFIX=/langchain` → routes `/langchain/`, `/langchain/summarize`, `/langchain/chat`, `/langchain/agent`
5. **Secrets** (in `techtoday/secrets`): `OPENAI_API_KEY` only — every feature uses GPT-4o mini, so no Groq key is needed. Already present if `basic` is deployed.

`PATH_PREFIX` is set directly in `~/docker-compose.yml` on EC2 (not a secret).

## 3. Container App Local Development

The worked example below uses the `template` project (local port `8090`, keyless
`echo` feature). For a real project, substitute its name and local port from the
[Container App Specs](#22-container-app-specs) section — e.g. `basic` (`8080`) or `langchain` (`8081`).

### 3.1. One-Time Setup

```bash
# Run on: local machine
cd projects/template
cp .env.example .env      # fill in the keys listed in the project's Container App Specs
docker compose build
```

Never commit `.env` — it is already listed in `.gitignore`. Two projects can run
at once because each maps a different local `808x` port.

### 3.2. Day-to-Day Loop

```bash
# Run on: local machine
# Start the web UI (hot-reload via volume mount — edits under src/ apply immediately)
docker compose up web
# → http://localhost:8090

# Run an individual feature from the CLI (one service per feature in docker-compose.yml)
docker compose run --rm echo

# Rebuild only when requirements.txt or Dockerfile changes
docker compose build

# Tear down when done
docker compose down
```

### 3.3. Useful Commands

```bash
# Run on: local machine
docker compose logs -f web       # tail logs
docker compose run --rm web bash # shell into the container
docker compose ps                # container status
```

## 4. Container App Daily Usage

The shared git flow for every project, with the `template` project as the example.
Substitute your project's name throughout.

### 4.1. Start a Feature

```bash
# Run on: local machine
git checkout main && git pull origin main
git checkout -b feat/short-description
```

### 4.2. Develop & Commit

Edit files under `src/` (hot-reloaded locally — see [Container App Local Development](#3-container-app-local-development)).
Scope each commit to the project folder so its CI/CD workflow triggers on its own:

```bash
# Run on: local machine
git add projects/template/
git commit -m "feat(template): short description"
git push -u origin feat/short-description
```

Open a Pull Request → get it reviewed → **Squash and merge** into `main`.

### 4.3. Deploy (Automatic)

Merging to `main` triggers CI/CD automatically — no manual steps needed. Each
project has its own workflow (e.g. `deploy-template.yml`, trigger path
`projects/template/**`), so only the changed project redeploys. Watch the run under
**GitHub → Actions** to confirm it succeeds.

### 4.4. Verify Production

```bash
# Run on: local machine
curl -I https://app.techtoday.click/template/
```

Or just open the URL in a browser.

### 4.5. Rollback

Roll back to a previous image when a deploy goes bad:

```bash
# Step 1 runs on your local machine; after the ssh line, the rest runs on the EC2 host
# 1. Find the last good build tag
aws ecr describe-images --repository-name techtoday/template --region us-east-1 \
  --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table

# 2. SSH in and roll back
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

REGION=us-east-1
ACCOUNT_ID=<your-aws-account-id>
ROLLBACK_TAG=<build-tag>   # e.g. 20260701-153045-42-a1b2c3d

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/template:$ROLLBACK_TAG
docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/template:$ROLLBACK_TAG \
            $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/template:latest
docker compose -f ~/docker-compose.yml up -d --no-deps template

# 3. Verify
curl -I https://app.techtoday.click/template/
```

Fix the bug and merge promptly — the next push to `main` overwrites `:latest`.

### 4.6. Manual Deploy (Fallback)

Use only if CI/CD is broken:

```bash
# Build/push run on your local machine; after the ssh line, the rest runs on the EC2 host
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/template
docker build --platform linux/amd64 -t techtoday/template .
docker tag techtoday/template:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/template:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/template:latest

ssh -i techtoday.pem ec2-user@$ELASTIC_IP
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
  docker compose -f ~/docker-compose.yml pull template
  docker compose -f ~/docker-compose.yml up -d --no-deps template
```

Reminder: `$ELASTIC_IP` is the public IP of the EC2 instance (AWS console → EC2 →
Instances → techtoday-server). For us it is `44.193.134.238`.

## 5. Add a Container App

`basic` (local 8080 / prod 5000) and `langchain` (local 8081 / prod 5001) are
already deployed. A third container project uses the next free ports (local 8082
/ prod 5002). **No new DNS record, no new EC2, and no new SSL cert are ever
needed** — the app subdomain, instance, and cert are all shared.

The walkthrough below provisions a container project named `ai-03` end to end,
starting from the `template` project. Substitute your own name and the next free
ports throughout. It assumes the
[one-time AWS infrastructure](SETUP.md#2-one-time-aws-infrastructure) (EC2,
ECR access, Secrets Manager, Nginx, SSL, IAM roles, OIDC) is already in place, and
follows the [Container App Shared Conventions](#21-container-app-shared-conventions)
for ports and naming.

### 5.1. Scaffold the Project Folder

Copy the `template` project — a minimal Flask + Docker
starter already wired for path-prefix routing, with a keyless `echo` feature so it
runs out of the box.

```bash
# Run on: local machine
cd projects
cp -r template ai-03
cd ai-03
```

Then adjust the copied files for the new project:

1. `docker-compose.yml` — change the `web` service's published port from the template's `8090` to the next free local port (`8082`); see the snippet below.
2. `src/` — replace the starter `echo` feature (`src/echo.py`, its route in `src/app.py`, and its card in `src/index.html` / `src/js/main.js`) with your project's code. Keep `src/app.py`'s use of `PATH_PREFIX` so Nginx path routing keeps working.
3. `requirements.txt` — add any libraries your features need (e.g. `openai`, `langchain`).
4. `.env.example` — list the environment variables your project needs; copy it to `.env` and fill in real values for local runs.
5. Project README — replace the `<project-name>` / `<local-port>` / `<host-port>` placeholders and update the feature descriptions to match the new project.

The `docker-compose.yml` port change (step 1) looks like this:

```yaml
services:
  web:
    build: .
    env_file: .env
    command: python src/app.py
    ports:
      - "8082:5000"     # was 8090:5000
    volumes:
      - ./src:/app/src
```

Test it locally before touching production using the [Container App Local Development](#3-container-app-local-development)
loop (with the new port `8082`).

### 5.2. Create the ECR Repository

**One-time.** Holds the project's container images.

```bash
# Run on: local machine
REGION=us-east-1
aws ecr create-repository --repository-name techtoday/ai-03 --region $REGION
```

**AWS Console alternative:** **ECR** → **Repositories** → **Create repository** →
name `techtoday/ai-03` → keep defaults (private, mutable tags) → **Create
repository**. The same `aws ecr` command also runs unchanged in **AWS CloudShell**.
Pushing images in step 3 still needs local
Docker and the cloned repo, so it cannot run in CloudShell.

### 5.3. Build and Push the Initial Image

**One-time.** After this first manual push, every later push is handled
automatically by the CI/CD workflow added in step 6.
Requires Docker running locally and the cloned repo.

```bash
# Run on: local machine
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/ai-03

# Authenticate the local Docker CLI to the private ECR registry
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/ai-03
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

`--platform linux/amd64` is required on Apple Silicon Macs (M1/M2/M3) so the
image runs on the `x86_64` EC2 instance — without it, Docker builds a native
`arm64` image and the push produces `no matching manifest for linux/amd64`. On
macOS with Colima, make sure the VM is running first (`colima status` / `colima start`).

**This step has no Console equivalent** — `docker build`/`docker push` need Docker
and the repo on your local machine, so CloudShell cannot run them.

### 5.4. Verify the Push

**ECR** → **Repositories** → `techtoday/ai-03` should show an
image tagged `latest`, or from the CLI:

```bash
# Run on: local machine
aws ecr list-images --repository-name techtoday/ai-03 --region $REGION
```

### 5.5. Store Any New Secrets

If your project needs API keys, add them to the shared `techtoday/secrets` secret
(**Secrets Manager** → `techtoday/secrets` → **Retrieve secret value** → **Edit** →
add key/value → **Save**). The EC2 instance role already grants read access to
everything under `techtoday/*`, so no IAM changes are needed.

From the CLI, `put-secret-value` replaces the entire secret string, so fetch the
current value, add your key, and write it back:

```bash
# Run on: local machine
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['NEW_KEY']='new-value'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

If your project reuses only keys that already exist (e.g. `OPENAI_API_KEY`), skip
this step. The first project to need secrets creates the secret instead:
`aws secretsmanager create-secret --name techtoday/secrets --secret-string '{"OPENAI_API_KEY":"sk-..."}'`.

### 5.6. Wire Up the EC2 Host

The Nginx and Docker Compose config live **on the EC2 host**, so these steps need a
shell on the server. Connect either by **SSH** from your local machine:

```bash
# Run on: local machine (connects you to the EC2 host)
ssh -i techtoday.pem ec2-user@$ELASTIC_IP
```

…or, with no key file, via **EC2 Instance Connect**: open **EC2** → **Instances** → select `techtoday-server` → **Connect** → **EC2 Instance Connect** tab → **Connect**.

#### 5.6.1. Add the Nginx Location Block

```bash
# Run on: EC2 host (via SSH)
sudo nano /etc/nginx/conf.d/app.conf
```

Inside the existing `server { listen 443 ssl ... server_name app.techtoday.click; }`
block (the one Certbot created — **not** the `listen 80` redirect block), add a new
`location` block next to the existing `/basic/` and `/langchain/` blocks:

```nginx
server {
    listen 443 ssl;
    server_name app.techtoday.click;
    # ...existing ssl_certificate lines and /basic/, /langchain/ blocks...

    location /ai-03/ {
        proxy_pass         http://localhost:5002;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Save and exit, then validate and reload (zero-downtime — it does not drop existing
connections):

```bash
# Run on: EC2 host (via SSH)
sudo nginx -t              # must print "syntax is ok" and "test is successful"
sudo systemctl reload nginx
```

**If `nginx -t` fails**, it prints the offending file and line number. Fix the
reported line (usually a missing `;` or unbalanced `}`) and re-run `nginx -t`
before reloading — Nginx keeps serving the old config until a reload succeeds.

#### 5.6.2. Create the Secrets Env File

Fetch the shared secret into a per-project env file that the container reads at
startup:

```bash
# Run on: EC2 host (via SSH)
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/secrets \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/ai-03.env
chmod 600 ~/secrets/ai-03.env
```

#### 5.6.3. Add the Service to Docker Compose

Resolve the image URL, then append a service block under the existing `services:`
key in `~/docker-compose.yml`:

```bash
# Run on: EC2 host (via SSH)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
echo "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/ai-03:latest"   # copy this for the image: line below
nano ~/docker-compose.yml
```

Under the existing top-level `services:` key (at the same indentation as the `basic`
and `langchain` services, two spaces in), add:

```yaml
services:
  # ...existing basic and langchain services...

  ai-03:
    image: <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/techtoday/ai-03:latest
    restart: unless-stopped
    command: python src/app.py
    ports:
      - "5002:5000"          # unique host port; container still listens on 5000
    environment:
      - PATH_PREFIX=/ai-03
    env_file:
      - ~/secrets/ai-03.env
```

Replace `<ACCOUNT_ID>` and `<REGION>` with the values from the `echo` command above
(or paste the whole resolved URL). Save and exit nano.

**YAML is indentation-sensitive:** the service name (`ai-03:`) must be indented
exactly two spaces, and its keys (`image:`, `ports:`, …) four spaces. Use spaces,
never tabs.

Verify the file parses before starting:

```bash
# Run on: EC2 host (via SSH)
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
```

Authenticate, pull, and start only the new container (leaving `basic` and
`langchain` untouched):

```bash
# Run on: EC2 host (via SSH)
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull ai-03
docker compose -f ~/docker-compose.yml up -d --no-deps ai-03
```

### 5.7. Add the CI/CD Workflow

Automate future deploys so every push to `main` under `projects/ai-03/` rebuilds
and redeploys just this project. The template ships a ready-made workflow
(`deploy.yml.template`) that uses a single `PROJECT_NAME` token — copy it into
`.github/workflows/` and replace the token:

```bash
# Run on: local machine
cp projects/ai-03/deploy.yml.template .github/workflows/deploy-ai-03.yml

# macOS (BSD sed)
sed -i '' 's/PROJECT_NAME/ai-03/g' .github/workflows/deploy-ai-03.yml
# Linux (GNU sed)
sed -i 's/PROJECT_NAME/ai-03/g' .github/workflows/deploy-ai-03.yml

grep -n PROJECT_NAME .github/workflows/deploy-ai-03.yml   # should print nothing
```

**Console / no-terminal alternative:** create the file directly on GitHub — open
your repo → **Add file** → **Create new file** → name it
`.github/workflows/deploy-ai-03.yml`, paste the edited contents, then **Commit
changes**.

The workflow reuses the same shared GitHub secrets (`AWS_REGION`, `AWS_ACCOUNT_ID`,
`AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, `EC2_SSH_KEY`) already configured for the repo — no new
secrets to configure.

### 5.8. Verify

```bash
# Run on: local machine
curl -I https://app.techtoday.click/ai-03/
```

#### 5.8.1. Browser Verification

Open https://app.techtoday.click/ai-03/
and confirm the page loads over HTTPS.

### 5.9. Update the Shared Docs

1. Add the project to [Container App Specs](#22-container-app-specs).
2. If the project introduced new secrets, document them in the shared setup notes.
3. Commit and push. From now on, changes under `projects/ai-03/` deploy automatically via `deploy-ai-03.yml`. Day-to-day work then follows [Container App Local Development](#3-container-app-local-development) and [Container App Daily Usage](#4-container-app-daily-usage) above.

## 6. Static Site

The `techtoday` home page is plain HTML/CSS/JS served directly from the root domain
— no Docker container, no application server, and no secrets. It follows none of the
container-app conventions above, so its full workflow lives here.

### 6.1. TechToday Deployment Target

1. `techtoday.click` — path `/` — static files served by Nginx from `/var/www/techtoday`.
2. `www.techtoday.click` — path `/` — redirect → `techtoday.click`.

### 6.2. TechToday Static Site Local Development

No tools required beyond a browser and `git`:

```bash
# Run on: local machine
open projects/techtoday/src/index.html          # fastest
# or serve it (useful for relative asset paths):
cd projects/techtoday/src && python3 -m http.server 8000   # → http://localhost:8000
```

### 6.3. TechToday Static Site Daily Usage

Same git flow as the [container apps](#4-container-app-daily-usage),
scoping commits to `projects/techtoday/`. Merging to `main` triggers
`deploy-techtoday.yml`, which `rsync`s `src/` to `/var/www/techtoday` on EC2 — no
build and no container. **Manual deploy** (fallback, only if CI/CD is broken):

```bash
# Run on: local machine, from the repo root
rsync -avz --delete projects/techtoday/src/ ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

No Nginx reload is needed — static files are served directly.

On Windows, run the same command inside **WSL** or **Git Bash**.

**Troubleshooting:** if `rsync` fails with `Permission denied (13)`, the directory
is root-owned — fix it on EC2 with `sudo chown -R ec2-user:ec2-user /var/www/techtoday`,
then re-run.

### 6.4. TechToday First-Time Server Setup

The root domain's Nginx server block, SSL certificate, and Route 53 records are
part of the **one-time server infrastructure**, created once in
the [shared infrastructure setup](SETUP.md#2-one-time-aws-infrastructure) (Route 53 A records,
the Nginx config with the `/var/www/techtoday` root, and the Let's Encrypt cert).
You only touch those when standing up a brand-new server — routine updates are just
the `rsync` deploy in [TechToday Static Site Daily Usage](#63-techtoday-static-site-daily-usage) above.

### 6.5. Static Site Alternative Hosting

Best for pure static hosting with a global CDN and no EC2 involvement.

#### 6.5.1. Create the Bucket and Upload the Site

```bash
# Run on: local machine
aws s3api create-bucket --bucket techtoday-site --region us-east-1

# Upload the site (short cache on HTML so updates propagate quickly)
aws s3 sync projects/techtoday/src/ s3://techtoday-site/ \
  --delete --cache-control "public, max-age=86400"
aws s3 cp projects/techtoday/src/index.html s3://techtoday-site/index.html \
  --cache-control "public, max-age=60"
```

#### 6.5.2. Create a CloudFront Distribution

Point it to the bucket, with default root
object `index.html`, HTTPS redirect enforced, custom domains `techtoday.click` and
`www.techtoday.click`, and an ACM certificate **in `us-east-1`** (required for
CloudFront).

#### 6.5.3. Create Route 53 A Alias Records

Point both names at the CloudFront domain.

Steps 2–3 are far simpler in the **AWS Console** (**CloudFront** → **Create
distribution**; **Route 53** → **Create record** → toggle **Alias** → CloudFront
distribution). CloudShell can run the S3 commands, but `aws s3 sync` needs the
cloned repo, so clone it in CloudShell first or upload via the S3 Console.

#### 6.5.4. Deploying Updates

Re-run the `aws s3 sync` / `aws s3 cp` commands above, then
invalidate the cache so visitors see the new version immediately:

```bash
# Run on: local machine
DISTRIBUTION_ID=<your-cloudfront-distribution-id>
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```
