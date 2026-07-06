#!/usr/bin/env bash
# Scaffold a new container project by cloning the template project and
# generating its CI/CD workflow — the local, repo-side half of adding a
# project. (Run provision-project.sh afterwards for the AWS/EC2 half.)
#
# What it does:
#   1. Copy the template project (default: langchain) to projects/<name>/.
#   2. Assign the next free host port and wire up docker-compose.yml.
#   3. Reset .env from .env.example and drop stale caches.
#   4. Generate .github/workflows/deploy-<name>.yml from the template's.
#   5. Print the exact next steps (add your code, then provision).
#
# Usage:
#   ./new-project.sh <name> [--port N] [--template <project>]
#
# Example:
#   ./new-project.sh ai-03
#
# This script only touches the repo — it makes no AWS or SSH calls.

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

usage() { sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------

NAME=""; PORT=""; TEMPLATE="$TEMPLATE_PROJECT"
while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage 0 ;;
    --port) PORT="${2:-}"; shift 2 ;;
    --template) TEMPLATE="${2:-}"; shift 2 ;;
    -*) die "Unknown option: $1" ;;
    *) [ -z "$NAME" ] && NAME="$1" || die "Unexpected argument: $1"; shift ;;
  esac
done

[ -n "$NAME" ] || usage 1
valid_name "$NAME" || die "Invalid name '$NAME' (use lowercase letters, digits, dashes)."

DEST="$PROJECTS_DIR/$NAME"
SRC="$PROJECTS_DIR/$TEMPLATE"
WORKFLOW="$WORKFLOWS_DIR/deploy-$NAME.yml"
TEMPLATE_WORKFLOW="$WORKFLOWS_DIR/deploy-$TEMPLATE.yml"

[ ! -e "$DEST" ] || die "Project already exists: $DEST"
[ -d "$SRC" ] || die "Template project not found: $SRC"

[ -n "$PORT" ] || PORT="$(next_free_local_port)"
[[ "$PORT" =~ ^[0-9]+$ ]] || die "Port must be numeric: $PORT"

info "Scaffolding '$NAME' from template '$TEMPLATE'"
echo "    Folder         : projects/$NAME/"
echo "    Local port     : $PORT  (for docker compose up)"
echo "    Production port : $(local_to_prod_port "$PORT")  (on EC2, set during provision)"
echo "    Workflow       : .github/workflows/deploy-$NAME.yml"
echo

# ---------------------------------------------------------------------------
# 1. Copy template folder (excluding caches / local env / secrets)
# ---------------------------------------------------------------------------

info "Copying template files…"
mkdir -p "$DEST"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude='__pycache__' --exclude='.env' --exclude='*.pyc' \
    "$SRC"/ "$DEST"/
else
  cp -R "$SRC"/. "$DEST"/
  find "$DEST" -name '__pycache__' -type d -prune -exec rm -rf {} + 2>/dev/null || true
  rm -f "$DEST/.env"
fi
ok "Copied template into projects/$NAME/"

# ---------------------------------------------------------------------------
# 2. Wire up the host port in docker-compose.yml
# ---------------------------------------------------------------------------

if [ -f "$DEST/docker-compose.yml" ]; then
  # The template's web service maps <tmplPort>:5000 — rewrite to <PORT>:5000.
  sed -i.bak -E "s/\"[0-9]+:5000\"/\"$PORT:5000\"/" "$DEST/docker-compose.yml"
  rm -f "$DEST/docker-compose.yml.bak"
  ok "Set web host port to $PORT in docker-compose.yml"
fi

# ---------------------------------------------------------------------------
# 3. Reset .env from example
# ---------------------------------------------------------------------------

if [ -f "$DEST/.env.example" ]; then
  cp "$DEST/.env.example" "$DEST/.env"
  ok "Created .env from .env.example (fill in your keys for local dev)"
fi

# ---------------------------------------------------------------------------
# 4. Generate the CI/CD workflow from the template's
# ---------------------------------------------------------------------------

if [ -f "$TEMPLATE_WORKFLOW" ]; then
  # Replace the template name everywhere: workflow name, paths filter,
  # ECR repo, comments, and the compose service name.
  sed -e "s/$TEMPLATE/$NAME/g" "$TEMPLATE_WORKFLOW" > "$WORKFLOW"
  ok "Generated .github/workflows/deploy-$NAME.yml"
else
  warn "Template workflow not found ($TEMPLATE_WORKFLOW) — skipping workflow generation."
fi

# ---------------------------------------------------------------------------
# 5. Next steps
# ---------------------------------------------------------------------------

echo
ok "Scaffold complete for '$NAME'."
cat <<EOF

Next steps:
  1. Replace the template code in projects/$NAME/src/ with your project.
     (Update README.md / SETUP.md / DAILY.md headings and content too.)

  2. Test locally:
       cd projects/$NAME && docker compose up web
       # → http://localhost:$PORT

  3. Provision production (ECR + build/push + EC2 wiring), one time:
       projects/scripts/provision-project.sh $NAME

  4. Commit & push. Future changes under projects/$NAME/ auto-deploy via
     .github/workflows/deploy-$NAME.yml.
EOF
