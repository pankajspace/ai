#!/usr/bin/env bash
# One-time production provisioning for a container project.
#
# Automates every manual terminal + SSH step from SETUP.md § 5:
#   1. Create the ECR repository (idempotent).
#   2. Build the linux/amd64 image and push it to ECR.
#   3. On the EC2 host:
#        - write the project's env file from Secrets Manager,
#        - add/replace its service in ~/docker-compose.yml,
#        - add/replace its Nginx `location` block and reload Nginx,
#        - pull the image and (re)start only this container.
#   4. Verify the public URL responds.
#
# Usage:
#   ./provision-project.sh <name> [--port N] [--build-only] [--skip-build]
#
# Examples:
#   ./provision-project.sh langchain
#   ./provision-project.sh ai-03 --port 5002
#
# Config (region, EC2 IP, SSH key, etc.) lives in lib.sh — override via env.

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

usage() { sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------

NAME=""; PORT=""; BUILD_ONLY=0; SKIP_BUILD=0
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage 0 ;;
    --port) PORT="${2:-}"; shift 2 ;;
    --build-only) BUILD_ONLY=1; shift ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    -*) die "Unknown option: $1" ;;
    *) [ -z "$NAME" ] && NAME="$1" || die "Unexpected argument: $1"; shift ;;
  esac
done

[ -n "$NAME" ] || usage 1
valid_name "$NAME" || die "Invalid name '$NAME' (use lowercase letters, digits, dashes)."

PROJECT_DIR="$PROJECTS_DIR/$NAME"
[ -d "$PROJECT_DIR" ] || die "Project folder not found: $PROJECT_DIR (run new-project.sh first)."
[ -f "$PROJECT_DIR/Dockerfile" ] || die "No Dockerfile in $PROJECT_DIR."

require_cmd aws docker ssh

# Determine the production host port (used on EC2 and by Nginx).
# --port overrides; otherwise derive it from the project's local compose port
# (8080→5000, 8081→5001); otherwise fall back to the next free prod port.
if [ -z "$PORT" ]; then
  local_port="$(read_local_port "$PROJECT_DIR" || true)"
  if [ -n "$local_port" ]; then
    PORT="$(local_to_prod_port "$local_port")"
  else
    PORT="$(local_to_prod_port "$(next_free_local_port)")"
  fi
fi
[[ "$PORT" =~ ^[0-9]+$ ]] || die "Port must be numeric: $PORT"

REPO="$ECR_NAMESPACE/$NAME"
REGISTRY="$(ecr_registry)"
IMAGE="$REGISTRY/$REPO:latest"
PREFIX="/$NAME"

info "Provisioning '$NAME'"
echo "    ECR repo       : $REPO"
echo "    Image          : $IMAGE"
echo "    Production port : $PORT  (container 5000)"
echo "    Path prefix    : $PREFIX"
echo "    EC2 host       : ${EC2_USER}@${ELASTIC_IP}"
echo

# ---------------------------------------------------------------------------
# 1. ECR repository (idempotent)
# ---------------------------------------------------------------------------

info "Ensuring ECR repository exists…"
if aws ecr describe-repositories --repository-names "$REPO" \
     --region "$AWS_REGION" >/dev/null 2>&1; then
  ok "ECR repo already exists: $REPO"
else
  aws ecr create-repository --repository-name "$REPO" --region "$AWS_REGION" >/dev/null
  ok "Created ECR repo: $REPO"
fi

# ---------------------------------------------------------------------------
# 2. Build & push image
# ---------------------------------------------------------------------------

if [ "$SKIP_BUILD" -eq 0 ]; then
  info "Logging Docker in to ECR…"
  aws ecr get-login-password --region "$AWS_REGION" | \
    docker login --username AWS --password-stdin "$REGISTRY" >/dev/null
  ok "Docker logged in to $REGISTRY"

  info "Building linux/amd64 image…"
  docker build --platform linux/amd64 -t "$IMAGE" "$PROJECT_DIR"
  ok "Built $IMAGE"

  info "Pushing image to ECR…"
  docker push "$IMAGE" >/dev/null
  ok "Pushed $IMAGE"
else
  warn "Skipping build/push (--skip-build)"
fi

if [ "$BUILD_ONLY" -eq 1 ]; then
  ok "Build-only mode: done. Image is in ECR; skipping EC2 configuration."
  exit 0
fi

# ---------------------------------------------------------------------------
# 3. Configure EC2 (env file, compose service, Nginx, restart)
# ---------------------------------------------------------------------------

info "Configuring EC2 host over SSH…"

# The remote script is fully idempotent: it replaces any existing service /
# location block for this project rather than appending duplicates.
ssh_ec2 NAME="$NAME" PORT="$PORT" IMAGE="$IMAGE" PREFIX="$PREFIX" \
        SECRET_ID="$SECRET_ID" AWS_REGION="$AWS_REGION" REGISTRY="$REGISTRY" \
        COMPOSE="$REMOTE_COMPOSE" SECRETS_DIR="$REMOTE_SECRETS_DIR" \
        NGINX_CONF="$REMOTE_NGINX_CONF" 'bash -s' <<'REMOTE'
set -euo pipefail
# Expand ~ in configured paths.
COMPOSE="${COMPOSE/#\~/$HOME}"
SECRETS_DIR="${SECRETS_DIR/#\~/$HOME}"
ENV_FILE="$SECRETS_DIR/$NAME.env"

echo "  • Writing env file from Secrets Manager ($SECRET_ID)…"
mkdir -p "$SECRETS_DIR"
aws secretsmanager get-secret-value --secret-id "$SECRET_ID" \
  --query SecretString --output text \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "  • Updating $COMPOSE service '$NAME'…"
python3 - "$COMPOSE" "$NAME" "$IMAGE" "$PORT" "$PREFIX" "$ENV_FILE" <<'PY'
import sys, os, re
compose, name, image, port, prefix, env_file = sys.argv[1:7]
block = (
    f"  {name}:\n"
    f"    image: {image}\n"
    f"    restart: unless-stopped\n"
    f"    command: python src/app.py\n"
    f"    ports:\n"
    f"      - \"{port}:5000\"\n"
    f"    environment:\n"
    f"      - PATH_PREFIX={prefix}\n"
    f"    env_file:\n"
    f"      - {env_file}\n"
)
if not os.path.exists(compose):
    open(compose, "w").write("services:\n" + block)
    print("    (created new compose file)")
    sys.exit(0)
text = open(compose).read()
# Remove any existing block for this service (from its "  name:" line up to
# the next top-level-indented service or EOF).
pat = re.compile(rf"^  {re.escape(name)}:\n(?:(?:    |\t| *\n).*\n?)*", re.M)
text = pat.sub("", text)
if "services:" not in text:
    text = "services:\n" + text
if not text.endswith("\n"):
    text += "\n"
text += block
open(compose, "w").write(text)
print("    (service upserted)")
PY

echo "  • Updating Nginx location block…"
NGINX_CONF_EXPANDED="$NGINX_CONF"
if [ -f "$NGINX_CONF_EXPANDED" ]; then
  sudo python3 - "$NGINX_CONF_EXPANDED" "$NAME" "$PORT" <<'PY'
import sys, re
conf, name, port = sys.argv[1:4]
text = open(conf).read()
block = (
    f"    location /{name}/ {{\n"
    f"        proxy_pass         http://localhost:{port};\n"
    f"        proxy_set_header   Host $host;\n"
    f"        proxy_set_header   X-Real-IP $remote_addr;\n"
    f"        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;\n"
    f"        proxy_set_header   X-Forwarded-Proto $scheme;\n"
    f"    }}\n"
)
# Drop any existing location block for this project.
pat = re.compile(rf"\n? *location /{re.escape(name)}/ \{{.*?\n *\}}\n", re.S)
text = pat.sub("\n", text)
# Insert into the HTTPS (443) server block for the app domain if present,
# otherwise the first server block that proxies localhost.
m = re.search(r"(server\s*\{[^}]*listen\s+443[^}]*?)(\n\})", text, re.S)
if not m:
    m = re.search(r"(server\s*\{.*?)(\n\})", text, re.S)
if not m:
    sys.exit("Could not find a server block to insert into")
insert_at = m.end(1)
text = text[:insert_at] + "\n" + block + text[insert_at:]
open(conf, "w").write(text)
print("    (nginx location upserted)")
PY
  echo "  • Testing & reloading Nginx…"
  sudo nginx -t && sudo systemctl reload nginx
else
  echo "    ! Nginx conf not found at $NGINX_CONF_EXPANDED — skipping (add manually)."
fi

echo "  • Pulling image and (re)starting container…"
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY" >/dev/null
docker compose -f "$COMPOSE" pull "$NAME"
docker compose -f "$COMPOSE" up -d --no-deps "$NAME"
echo "  • Done on EC2."
REMOTE

ok "EC2 configured and container started."

# ---------------------------------------------------------------------------
# 4. Verify
# ---------------------------------------------------------------------------

URL="https://${APP_DOMAIN}${PREFIX}/"
info "Verifying $URL …"
if curl -fsSI "$URL" >/dev/null 2>&1; then
  ok "Live: $URL"
else
  warn "Could not confirm $URL yet — it may take a moment. Check manually:"
  echo "    curl -I $URL"
fi

echo
ok "Provisioning complete for '$NAME'."
echo "Future pushes to main under projects/$NAME/ will auto-deploy via CI/CD."
