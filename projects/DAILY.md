# Daily Development and Deployment

Use this guide after the one-time local machine and AWS infrastructure setup in
[SETUP.md](SETUP.md) is complete. Project-specific names, ports, routes,
workflows, and secrets live in [PROJECTS.md](PROJECTS.md).

## 1. Start a Feature

```bash
# Run on: local machine, from the repo root
git checkout main && git pull origin main
git checkout -b feat/short-description
```

## 2. Static Site Daily Loop

Use this for static projects. Replace `<project-name>` and production paths with
values from [PROJECTS.md](PROJECTS.md).

### 2.1. Preview Locally

```bash
# Run on: local machine
open projects/<project-name>/src/index.html

# Or serve it locally, useful for relative asset paths:
cd projects/<project-name>/src
python3 -m http.server 8000
# → http://localhost:8000
```

### 2.2. Commit and Deploy

```bash
# Run on: local machine, from the repo root
PROJECT_NAME=<project-name>
git add projects/$PROJECT_NAME/
git commit -m "feat($PROJECT_NAME): short description"
git push -u origin feat/short-description
```

Open a Pull Request, get it reviewed, then squash-merge into `main`. The static
site workflow deploys automatically when files under its trigger path change.

### 2.3. Manual Static Deploy

Use this only if CI/CD is broken:

```bash
# Run on: local machine, from the repo root
PROJECT_NAME=<project-name>
STATIC_TARGET=<production-static-path>
rsync -avz --delete projects/$PROJECT_NAME/src/ ec2-user@$ELASTIC_IP:$STATIC_TARGET/
```

No Nginx reload is needed because static files are served directly. On Windows,
run the same command inside WSL or Git Bash.

If `rsync` fails with `Permission denied (13)`, fix ownership on EC2 and re-run:

```bash
# Run on: EC2 host
sudo chown -R ec2-user:ec2-user <production-static-path>
```

## 3. Container App Local Development

Use this for any container app. Replace `<project-name>`, `<local-port>`, and any
feature service names with values from [PROJECTS.md](PROJECTS.md).

### 3.1. Start Docker

Every `docker compose`, `docker build`, `docker tag`, and `docker push` command
needs the Docker daemon running on the machine where you run the command.

1. **macOS with Colima:**
  ```bash
  # Run on: local Mac
  colima status
  colima start
  docker info
  ```
  If `colima status` says `colima is not running`, run `colima start` and wait
  until `docker info` prints server details. Run `colima start` again after a
  reboot.
2. **macOS with Docker Desktop:** open **Docker Desktop** from Applications and
  wait until it says Docker is running, then verify with `docker info`.
3. **Linux:**
  ```bash
  # Run on: Linux machine
  sudo systemctl start docker
  docker info
  ```
  If `docker info` reports a permission error, add your user to the Docker
  group as shown in [SETUP.md](SETUP.md).
4. **Windows with Docker Desktop:** open **Docker Desktop** and wait until it
  says Docker is running, then verify with `docker info` in PowerShell.

### 3.2. First Local Run for an Existing Project

Run once per cloned project folder:

```bash
# Run on: local machine
cd projects/<project-name>
cp .env.example .env
docker compose build
```

Fill `.env` with the keys listed for that project in [PROJECTS.md](PROJECTS.md).
Never commit `.env`.

### 3.3. Day-to-Day Container Loop

```bash
# Run on: local machine
cd projects/<project-name>

# Start the web UI. Edits under src/ hot-reload through the volume mount.
docker compose up web
# → http://localhost:<local-port>

# Run an individual feature from the CLI, when docker-compose.yml defines one.
docker compose run --rm <feature-service>

# Rebuild only when requirements.txt or Dockerfile changes.
docker compose build

# Tear down when done.
docker compose down
```

Useful commands:

```bash
# Run on: local machine, inside projects/<project-name>
docker compose logs -f web
docker compose run --rm web bash
docker compose ps
```

## 4. Commit and Deploy a Container App

Scope each commit to the project folder so only that project's CI/CD workflow
triggers.

```bash
# Run on: local machine, from the repo root
PROJECT_NAME=<project-name>
git add projects/$PROJECT_NAME/
git commit -m "feat($PROJECT_NAME): short description"
git push -u origin feat/short-description
```

Open a Pull Request, get it reviewed, then squash-merge into `main`. Merging to
`main` triggers the project's workflow automatically. Watch the run under
GitHub Actions to confirm it succeeds.

## 5. Verify Production

```bash
# Run on: local machine
curl -I https://app.techtoday.click/<project-name>/
```

Or open the production URL in a browser.

If a project URL returns `502 Bad Gateway`, the container is usually not running
behind Nginx. Check the production service on EC2:

```bash
# Run on: EC2 host
PROJECT_NAME=<project-name>
docker compose -f ~/docker-compose.yml ps
docker compose -f ~/docker-compose.yml logs --tail=50 $PROJECT_NAME
grep -A12 "^  $PROJECT_NAME:" ~/docker-compose.yml
```

For projects using the current `src/python/` layout, the service block must use
`command: python src/python/app.py`. If it still uses `python src/app.py`, update
`~/docker-compose.yml`, validate it, and restart only that service:

```bash
# Run on: EC2 host
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/docker-compose.yml up -d --no-deps $PROJECT_NAME
```

## 6. Rollback

Roll back to a previous image when a container-app deploy goes bad:

```bash
# Step 1 runs on your local machine; after ssh, the rest runs on EC2.
PROJECT_NAME=<project-name>
REGION=us-east-1

aws ecr describe-images --repository-name techtoday/$PROJECT_NAME --region $REGION \
  --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table

ssh -i techtoday.pem ec2-user@$ELASTIC_IP

REGION=us-east-1
ACCOUNT_ID=<your-aws-account-id>
PROJECT_NAME=<project-name>
ROLLBACK_TAG=<build-tag>

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker pull $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT_NAME:$ROLLBACK_TAG
docker tag  $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT_NAME:$ROLLBACK_TAG \
            $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT_NAME:latest
docker compose -f ~/docker-compose.yml up -d --no-deps $PROJECT_NAME

curl -I https://app.techtoday.click/$PROJECT_NAME/
```

Fix the bug and merge promptly. The next push to `main` overwrites `:latest`.

## 7. Manual Container Deploy

Use this only if CI/CD is broken:

```bash
# Build and push run on your local machine; after ssh, the rest runs on EC2.
PROJECT_NAME=<project-name>
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/$PROJECT_NAME
docker build --platform linux/amd64 -t techtoday/$PROJECT_NAME .
docker tag techtoday/$PROJECT_NAME:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT_NAME:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/techtoday/$PROJECT_NAME:latest

ssh -i techtoday.pem ec2-user@$ELASTIC_IP

PROJECT_NAME=<project-name>
REGION=us-east-1
ACCOUNT_ID=<your-aws-account-id>
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
docker compose -f ~/docker-compose.yml pull $PROJECT_NAME
docker compose -f ~/docker-compose.yml up -d --no-deps $PROJECT_NAME
```

`$ELASTIC_IP` is the public IP of the EC2 instance. For this environment it is
`44.193.134.238`.

## 8. Static Site S3 and CloudFront Updates

Use this only for a static-site deployment that has been moved to S3 and
CloudFront:

```bash
# Run on: local machine
PROJECT_NAME=<project-name>
S3_BUCKET=<bucket-name>
aws s3 sync projects/$PROJECT_NAME/src/ s3://$S3_BUCKET/ \
  --delete --cache-control "public, max-age=86400"
aws s3 cp projects/$PROJECT_NAME/src/index.html s3://$S3_BUCKET/index.html \
  --cache-control "public, max-age=60"

DISTRIBUTION_ID=<your-cloudfront-distribution-id>
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```
