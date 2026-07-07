# LangChain Lab (langchain) — Setup

Setup for the **LangChain Lab (langchain)** project only. Two groups of shared, one-time steps must be completed first:

1. **Local machine prerequisites** — Docker, AWS CLI, SSH, git, rsync
2. **One-time AWS infrastructure** — IAM, VPC, EC2, Elastic IP, Route 53, Nginx, SSL, IAM roles, OIDC

Complete those first, then follow this file to run the project locally and deploy it.

---

## 1. Local Development

### 1.1. Prerequisites

1. [Docker](https://www.docker.com/) + Docker Compose
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for all three features (`summarize`, `chat`, `agent`); every feature uses GPT-4o mini, so no Groq key is needed

### 1.2. One-Time Local Setup

```bash
cd projects/langchain
cp .env.example .env
# Fill in OPENAI_API_KEY in .env
docker compose build
```

### 1.3. Day-to-Day Development Loop

1. Edit files under `src/` — changes are picked up immediately via volume mount, no rebuild needed.
2. Run the web UI:
   ```bash
   docker compose up web
   # open http://localhost:8081
   ```
3. Run individual features from the CLI:
   ```bash
   docker compose run --rm summarize
   docker compose run --rm chat
   docker compose run --rm agent
   ```
4. Rebuild only when `requirements.txt` or `Dockerfile` changes:
   ```bash
   docker compose build
   ```
5. Tear down when done:
   ```bash
   docker compose down
   ```

### 1.4. Key Files

1. `src/config.py` — loads `.env`; builds the LangChain `ChatOpenAI` and raw OpenAI clients
2. `src/summarizer.py` — LangChain `prompt | model | parser` chain
3. `src/chat.py` — memory chat using a `MessagesPlaceholder` and re-sent history
4. `src/agent.py` — tool-using shop agent (OpenAI function calling)
5. `src/app.py` — Flask server (Blueprint + `PATH_PREFIX`) exposing `/summarize`, `/chat`, `/agent`

> The local web port is `8081` (basic uses `8080`) so both projects can run at the same time.

---

## 2. Production Deployment

Deploys to `https://app.techtoday.click/langchain/` — container port `5000` (mapped to host `5001`), ECR repo `techtoday/langchain`. The steps are identical to the basic project's production deployment; only the names, port, and path prefix differ.

> Complete the shared one-time AWS infrastructure setup first.

### 2.1. Store API Key in Secrets Manager

> **Already done** if you deployed the basic project — LangChain Lab reuses the same `techtoday/secrets` secret and only needs `OPENAI_API_KEY`, which is already stored there. No action required.

#### CLI

```bash
# Check the key exists (prints the JSON secret)
aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text
```

If `OPENAI_API_KEY` is missing, add it. `put-secret-value` replaces the whole secret string, so merge first:

```bash
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['OPENAI_API_KEY']='sk-...'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

#### AWS Console

1. Open **Secrets Manager** → `techtoday/secrets` → **Retrieve secret value**
2. If `OPENAI_API_KEY` is present, you're done
3. To add it, click **Edit** → **Add row** → key `OPENAI_API_KEY`, value `sk-...` → **Save**

#### AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) runs the same `aws secretsmanager` commands in the browser with no local install — the AWS CLI is pre-installed and pre-authenticated from your Console sign-in.

1. Click the **CloudShell** icon (`>_`) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly. Confirm the Region selector shows `us-east-1` (Secrets Manager is Region-scoped).
2. Paste the `get-secret-value` (and, if needed, the merge / `put-secret-value`) commands from the CLI section above — `python3` is pre-installed in CloudShell, so they run unchanged.

### 2.2. Create ECR Repository

> **One-time.**

#### CLI

```bash
REGION=us-east-1
aws ecr create-repository --repository-name techtoday/langchain --region $REGION
```

#### AWS Console

1. Open **ECR** → **Repositories** → **Create repository**
2. **Repository name:** `techtoday/langchain`
3. Leave the remaining defaults (private repository, mutable tags) → **Create repository**

#### AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) runs the `aws ecr` command in the browser with no local install.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and confirm the Region selector shows `us-east-1`.
2. Click the **CloudShell** icon (`>_`) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
3. Paste the `aws ecr create-repository` command from the CLI section above — it runs unchanged.

> Creating the repository works in CloudShell, but the image build and push in [§ 2.3](#23-initial-image-build-and-push) need local Docker and the cloned repo, so run those from your local terminal.

### 2.3. Initial Image Build and Push

> **One-time.** Subsequent pushes are handled automatically by CI/CD. Requires Docker running locally and the cloned repo (same prerequisites and per-OS notes as the basic project).

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/langchain

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/langchain
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

> On Apple Silicon Macs, `--platform linux/amd64` is required, so the image runs on the `x86_64` EC2 instance.
>
> **This step has no Console equivalent** — `docker build`/`docker push` need Docker and the repo on your local machine, so CloudShell cannot run them.

**Verify the push (Console):** open **ECR** → **Repositories** → `techtoday/langchain` and confirm an image tagged `latest` appears. Or from the CLI:

```bash
aws ecr list-images --repository-name techtoday/langchain --region $REGION
```

### 2.4. Add Nginx Location Block

> **One-time.** Already included in the shared Nginx configuration. Only repeat this step when adding `langchain` to a server configured before this project existed.

The Nginx config lives **on the EC2 host**, so connect a shell one of two ways:

1. **SSH (from your local machine):**
   ```bash
   ssh -i techtoday.pem ec2-user@$ELASTIC_IP
   ```
2. **Browser-based (no key file) — EC2 Instance Connect:** open **EC2** → **Instances** → select `techtoday-server` → **Connect** → **EC2 Instance Connect** tab → **Connect**.

Open the app config in an editor:

```bash
sudo nano /etc/nginx/conf.d/app.conf
```

Inside the existing `server { listen 443 ssl ... server_name app.techtoday.click; }` block (the one Certbot created — **not** the `listen 80` redirect block), add a `location` block next to the existing `/basic/` block:

```nginx
location /langchain/ {
    proxy_pass         http://localhost:5001;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

In `nano`, save with `Ctrl+O` → `Enter`, then exit with `Ctrl+X`. Validate the syntax and reload (a reload is zero-downtime):

```bash
sudo nginx -t              # must print "syntax is ok" and "test is successful"
sudo systemctl reload nginx
```

> **If `nginx -t` fails**, it prints the offending file and line number. Reopen the file, fix the reported line (usually a missing `;` or unbalanced `}`), and re-run `nginx -t` before reloading — Nginx keeps serving the old config until a reload succeeds.

### 2.5. Add Service to Docker Compose on EC2

> **One-time.** Adds the `langchain` service to `~/docker-compose.yml` on EC2.

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

# Fetch secrets into an env file (reuses the shared techtoday/secrets secret)
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/secrets \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/langchain.env
chmod 600 ~/secrets/langchain.env
```

Resolve the image URL, then append the service block under the existing `services:` key in `~/docker-compose.yml`:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
IMAGE="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/langchain:latest"
echo $IMAGE   # verify before using it below
```

Add the following block (aligned with the existing `basic` service). Note the host port is `5001` to avoid clashing with `basic` on `5000`. Open the compose file with an editor:

```bash
nano ~/docker-compose.yml
```

Under the existing top-level `services:` key (at the same indentation as the `basic` service, two spaces in), add:

```yaml
services:
  # ...existing basic service...

  langchain:
    image: <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/techtoday/langchain:latest
    restart: unless-stopped
    command: python src/app.py
    ports:
      - "5001:5000"
    environment:
      - PATH_PREFIX=/langchain
    env_file:
      - ~/secrets/langchain.env
```

Replace `<ACCOUNT_ID>` and `<REGION>` with the values from the `echo $IMAGE` command above (or paste the whole resolved URL). Save with `Ctrl+O` → `Enter` → `Ctrl+X`.

> **YAML is indentation-sensitive:** the service name (`langchain:`) must be indented exactly two spaces, and its keys (`image:`, `ports:`, …) four spaces. Use spaces, never tabs. Verify the file parses before starting:
> ```bash
> docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
> ```

Authenticate and start:

```bash
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull langchain
docker compose -f ~/docker-compose.yml up -d --no-deps langchain
```

### 2.6. Verify Production Deployment

```bash
curl -I https://app.techtoday.click/langchain/
```

**Browser alternative:** Open [https://app.techtoday.click/langchain/](https://app.techtoday.click/langchain/) in your browser and confirm the page loads.

---

## Secrets Reference

Project-specific values used by this project (reuses the same `techtoday/secrets` secret as basic):

1. `OPENAI_API_KEY` — AWS Secrets Manager, secret `techtoday/secrets` — used by all three features (`summarize`, `chat`, `agent`)
2. `PATH_PREFIX` — set to `/langchain` directly in `~/docker-compose.yml` on EC2 (not secret)

LangChain Lab needs no Groq key — every feature uses GPT-4o mini. Since `OPENAI_API_KEY` already lives in `techtoday/secrets`, no new secret is required.
