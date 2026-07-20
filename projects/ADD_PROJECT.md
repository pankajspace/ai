[← README](../README.md)

# Add a New Container Project

Use this checklist when adding a new container app after the shared setup in
[SETUP.md](SETUP.md) is complete. Daily development and deployment after this
initial setup live in [DAILY.md](DAILY.md). The project registry in
[PROJECTS.md](PROJECTS.md) is the only shared doc that should change when a new
project is added.

## 1. Pick Project Values

Open [PROJECTS.md](PROJECTS.md) and use the next available values from the
registry.

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

```bash
# Run on: local machine
cd projects/<project-name>
cp .env.example .env
docker compose build
docker compose up web
# → http://localhost:<local-port>
```

Fill `.env` with real local values before running features that need API keys.
Never commit `.env`.

## 4. Create the ECR Repository

Create one private ECR repository for the project:

```bash
# Run on: local machine
REGION=us-east-1
PROJECT_NAME=<project-name>
aws ecr create-repository --repository-name techtoday/$PROJECT_NAME --region $REGION
```

AWS Console alternative: open **ECR** → **Repositories** → **Create repository**,
name it `techtoday/<project-name>`, keep defaults, then create it.

## 5. Build and Push the Initial Image

This first manual push seeds ECR. Later deploys are handled by CI/CD.

```bash
# Run on: local machine
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PROJECT_NAME=<project-name>
REPO_NAME=techtoday/$PROJECT_NAME

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/$PROJECT_NAME
docker build --platform linux/amd64 -t $REPO_NAME .
docker tag "${REPO_NAME}:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${REPO_NAME}:latest"
```

`--platform linux/amd64` is required on Apple Silicon Macs so the image runs on
the `x86_64` EC2 instance. CloudShell cannot run this step because it needs local
Docker and the cloned repo.

Verify the push:

```bash
# Run on: local machine
aws ecr list-images --repository-name techtoday/$PROJECT_NAME --region $REGION
```

## 6. Store Any New Secrets

If the project needs new API keys, add them to the shared `techtoday/secrets`
Secrets Manager secret. The EC2 instance role already grants read access to
`techtoday/*`, so no IAM change is needed.

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

## 7. Wire Up the EC2 Host

The production Nginx and Docker Compose config live on EC2.

Connect by SSH:

```bash
# Run on: local machine
ssh -i techtoday.pem ec2-user@$ELASTIC_IP
```

Or use **EC2 Instance Connect** in the AWS Console.

### 7.1. Add the Nginx Location Block

```bash
# Run on: EC2 host
sudo nano /etc/nginx/conf.d/app.conf
```

Inside the existing `server { listen 443 ssl ... server_name app.techtoday.click; }`
block, add a location block for the new project:

```nginx
location /<project-name>/ {
    proxy_pass         http://localhost:<host-port>;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Validate and reload:

```bash
# Run on: EC2 host
sudo nginx -t
sudo systemctl reload nginx
```

If `nginx -t` fails, fix the reported file and line before reloading.

### 7.2. Create the Secrets Env File

```bash
# Run on: EC2 host
PROJECT_NAME=<project-name>
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/secrets \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/$PROJECT_NAME.env
chmod 600 ~/secrets/$PROJECT_NAME.env
```

### 7.3. Add the Docker Compose Service

Resolve the image URL:

```bash
# Run on: EC2 host
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
PROJECT_NAME=<project-name>
echo "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT_NAME:latest"
```

Edit the production compose file:

```bash
# Run on: EC2 host
nano ~/docker-compose.yml
```

Under the existing top-level `services:` key, add:

```yaml
  <project-name>:
    image: <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/techtoday/<project-name>:latest
    restart: unless-stopped
    command: python src/python/app.py
    ports:
      - "<host-port>:5000"
    environment:
      - PATH_PREFIX=/<project-name>
    env_file:
      - ~/secrets/<project-name>.env
```

YAML is indentation-sensitive. The service name must be indented two spaces, and
its keys must be indented four spaces.

Validate, authenticate, pull, and start only the new service:

```bash
# Run on: EC2 host
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull $PROJECT_NAME
docker compose -f ~/docker-compose.yml up -d --no-deps $PROJECT_NAME
```

## 8. Add the CI/CD Workflow

The template ships a ready-made workflow at `projects/<project-name>/deploy.yml.template`.
Copy it into `.github/workflows/` and replace `PROJECT_NAME`:

```bash
# Run on: local machine, from the repo root
PROJECT_NAME=<project-name>
cp projects/$PROJECT_NAME/deploy.yml.template .github/workflows/deploy-$PROJECT_NAME.yml

# macOS
sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" .github/workflows/deploy-$PROJECT_NAME.yml

# Linux
sed -i "s/PROJECT_NAME/$PROJECT_NAME/g" .github/workflows/deploy-$PROJECT_NAME.yml

grep -n PROJECT_NAME .github/workflows/deploy-$PROJECT_NAME.yml
```

The final `grep` should print nothing.

The workflow reuses the shared GitHub secrets already configured for this repo:
`AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, and
`EC2_SSH_KEY`.

## 9. Verify Production

```bash
# Run on: local machine
curl -I https://app.techtoday.click/<project-name>/
```

Open `https://app.techtoday.click/<project-name>/` in a browser and confirm it
loads over HTTPS.

## 10. Update the Project Registry

Update [PROJECTS.md](PROJECTS.md) after the project works:

1. Add the project entry with its folder, URLs, ports, ECR repository, path prefix, routes, workflow, trigger path, and secrets.
2. Advance the next available local and EC2 host ports.
3. If the project should appear on the public home page, add a card under `projects/techtoday/src/` as part of the project change.

After this, routine work follows [DAILY.md](DAILY.md).
