[← Project README](README.md) | [Project Daily](DAILY.md) | [Shared Setup Guide](../SETUP.md) | [Projects Guide](../README.md)

# AI Playground (basic) — Setup

Setup for the **AI Playground (basic)** project only. Shared, one-time steps live in the [Shared Setup Guide](../SETUP.md):

1. **Local machine prerequisites** (Docker, AWS CLI, SSH, git, rsync) — [Shared § 1](../SETUP.md#1-local-machine-prerequisites)
2. **One-time AWS infrastructure** (IAM, VPC, EC2, Elastic IP, Route 53, Nginx, SSL, IAM roles, OIDC) — [Shared § 3](../SETUP.md#3-one-time-aws-infrastructure-setup)

Complete those first, then follow this file to run the project locally and deploy it.

---

## 1. Local Development

### 1.1. Prerequisites

1. [Docker](https://www.docker.com/) + Docker Compose — installed in [Shared § 1.1](../SETUP.md#11-docker-cli--daemon--compose-plugin)
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for `travel`, `summarize`, and `arena`
3. [Groq API key](https://console.groq.com/keys) — required for `joke` and `arena`; free tier available

### 1.2. One-Time Local Setup

```bash
cd projects/basic
cp .env.example .env
# Fill in OPENAI_API_KEY and GROQ_API_KEY in .env
docker compose build
```

### 1.3. Day-to-Day Development Loop

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

### 1.4. Useful Commands

1. Tail logs: `docker compose logs -f web`
2. Shell into container: `docker compose run --rm web bash`
3. Container status: `docker compose ps`

---

## 2. Production Deployment

Deploys to `https://app.techtoday.click/basic/` — container port `5000`, ECR repo `techtoday/basic`.

> Complete the [Shared AWS infrastructure setup](../SETUP.md#3-one-time-aws-infrastructure-setup) first.

### 2.1. Store API Keys in Secrets Manager

> **One-time per project.** Repeat only when rotating keys (`aws secretsmanager put-secret-value`).

#### CloudShell / Console alternative
This step uses only `aws secretsmanager` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

#### CLI

```bash
aws secretsmanager create-secret \
  --name "techtoday/secrets" \
  --secret-string '{"OPENAI_API_KEY":"sk-...", "GROQ_API_KEY":"gsk_..."}'
```

#### AWS Console
1. Open **Secrets Manager** → **Store a new secret** → **Other type of secret**
2. Add keys `OPENAI_API_KEY` and `GROQ_API_KEY` with their values → Next
3. Set secret name to `techtoday/secrets` → Store

### 2.2. Create ECR Repository

> **One-time.**

#### CloudShell / Console alternative
This step uses only `aws ecr` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

#### CLI

```bash
REGION=us-east-1
REPO_NAME=techtoday/basic

aws ecr create-repository --repository-name $REPO_NAME --region $REGION
```

> **Note:** Image scanning is no longer configured per-repository. It has been moved to registry-level configuration via repository filtering.

#### AWS Console
1. Open **ECR** → **Repositories** → **Create repository**
2. **Repository name:** `techtoday/basic`
3. Leave all other defaults → **Create repository**

### 2.3. Initial Image Build and Push

> **One-time.** Subsequent pushes are handled automatically by CI/CD.
>
> **Note:** This step requires Docker running locally and the cloned repo files. It **cannot** be run from AWS CloudShell or the Console — CloudShell has no access to your local filesystem or Docker daemon.

#### Prerequisites

1. Docker daemon is running — verify with `docker info` (no error means it's running)
2. AWS CLI is authenticated — verify with `aws sts get-caller-identity`
3. You are in the **root of the cloned repo** (`cd` to the folder that contains `projects/`)

#### macOS / Linux (bash or zsh)

Open **Terminal** and run:

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/basic

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/basic
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

> **`--platform linux/amd64` is required on Apple Silicon Macs** (M1/M2/M3). Without it, Docker builds a native `arm64` image that cannot run on the `x86_64` EC2 instance, producing the error `no matching manifest for linux/amd64`.

> **macOS with Colima:** make sure the VM is running before executing these commands:
> ```bash
> colima status   # if not running:
> colima start
> ```

#### Windows (PowerShell)

Open **PowerShell** (or **Windows Terminal** with a PowerShell tab) and run:

```powershell
$REGION    = "us-east-1"
$REPO_NAME = "techtoday/basic"
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region $REGION |
  docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

cd projects\basic
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

> **PowerShell differences from bash:**
> 1. Variables are assigned with `$VAR = "value"` (no `export`, no `$()` wrapping)
> 2. Command substitution uses `(...)` not `$(...)` on the right-hand side of assignments
> 3. Path separator is `\` — use `cd projects\basic` instead of `cd projects/basic`
> 4. Line continuation uses a backtick `` ` `` — the pipe `|` at the end of a line works without one

#### Windows (WSL — Ubuntu or Debian)

If you have WSL installed, you can use the exact same bash commands as the macOS/Linux section above. Open a **WSL terminal** and run:

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/basic

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/basic
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

> **WSL + Docker Desktop:** Docker Desktop on Windows exposes the daemon to WSL automatically — no extra setup needed. If using a standalone WSL Docker install, make sure the daemon is running inside WSL with `sudo service docker start`.

### 2.4. Add Nginx Location Block

> **One-time.** Already included in the full Nginx config from [Shared § 3.8](../SETUP.md#38-configure-nginx). Only repeat this step when adding `basic` to a server that was configured before this project existed.

SSH into the EC2 instance and add to the `server { listen 443 ... server_name app.techtoday.click; }` block in `/etc/nginx/conf.d/app.conf`:

```nginx
location /basic/ {
    proxy_pass         http://localhost:5000;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 2.5. Add Service to Docker Compose on EC2

> **One-time.** Adds the `basic` service to `~/docker-compose.yml` on EC2.

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

# Fetch secrets into env file
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/secrets \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/basic.env
chmod 600 ~/secrets/basic.env
```

Add to `~/docker-compose.yml`:

First, resolve the placeholders for your account:

```bash
# Get your account ID and set the full image URL
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
IMAGE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/basic:latest"
echo $IMAGE   # verify it looks correct before using it below
```

**If `~/docker-compose.yml` does not exist yet** (first project), create it from scratch:

```bash
cat > ~/docker-compose.yml << EOF
services:
  basic:
    image: $IMAGE
    restart: unless-stopped
    command: python src/app.py
    ports:
      - "5000:5000"
    environment:
      - PATH_PREFIX=/basic
    env_file:
      - ~/secrets/basic.env
EOF
```

**If `~/docker-compose.yml` already exists** (adding to an existing file), open it with nano and append the new service block under the existing `services:` key:

```bash
nano ~/docker-compose.yml
```

Add the following block, indented under the existing `services:` key (aligned with any other existing services):

```yaml
  basic:
    image: <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/techtoday/basic:latest
    restart: unless-stopped
    command: python src/app.py
    ports:
      - "5000:5000"
    environment:
      - PATH_PREFIX=/basic
    env_file:
      - ~/secrets/basic.env
```

Save and exit nano: `Ctrl+O` → Enter → `Ctrl+X`.

Verify the file looks correct:

```bash
cat ~/docker-compose.yml
```

Authenticate and start:

> **Note:** `$ACCOUNT_ID` and `$REGION` must be set in your current shell session. If you opened a new terminal or SSHed back in, re-run the two export lines from the block above before continuing.

```bash
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull basic
docker compose -f ~/docker-compose.yml up -d --no-deps basic
```

### 2.6. Verify Production Deployment

```bash
curl -I https://app.techtoday.click/basic/
```

**Browser alternative:** Simply open [https://app.techtoday.click/basic/](https://app.techtoday.click/basic/) in your browser and confirm the page loads.

---

## Secrets Reference

Project-specific values used by this project:

1. `OPENAI_API_KEY` — AWS Secrets Manager, secret `techtoday/secrets` — used by `travel`, `summarize`, and `arena`
2. `GROQ_API_KEY` — AWS Secrets Manager, secret `techtoday/secrets` — used by `joke` and `arena`
3. `PATH_PREFIX` — set to `/basic` directly in `~/docker-compose.yml` on EC2 (not secret)

See the full [Secrets & Environment Variables Reference](../SETUP.md#312-secrets--environment-variables-reference) in the shared guide.
