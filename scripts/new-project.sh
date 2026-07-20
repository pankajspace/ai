#!/usr/bin/env bash
# =============================================================================
# Scaffold a new container app: repo folder + CI/CD workflow + Terraform entry.
#
# Automates the repo-side steps of projects/ADD_PROJECT.md (§ 2 and § 8) and
# registers the project in infra/terraform/projects.auto.tfvars.json so a
# following `terraform apply` provisions the AWS + EC2 side (ECR repo, Nginx
# location, docker-compose service, secrets env file).
#
# Usage:
#   scripts/new-project.sh <project-name> <local-port> <host-port>
#
# Example:
#   scripts/new-project.sh insights 8083 5003
#
# After running: fill in projects/<name>/ code, then either run
# `cd infra/terraform && terraform apply` (or `make new-project ...` which does
# both), and push to trigger the CI/CD build.
# =============================================================================
set -euo pipefail

# --- Args --------------------------------------------------------------------
if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <project-name> <local-port> <host-port>" >&2
  echo "Example: $0 insights 8083 5003" >&2
  exit 1
fi

NAME="$1"
LOCAL_PORT="$2"
HOST_PORT="$3"

# --- Validation --------------------------------------------------------------
if [[ ! "$NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "Error: project name must be lowercase alphanumeric/dashes, starting with a letter: '$NAME'" >&2
  exit 1
fi
if [[ ! "$LOCAL_PORT" =~ ^[0-9]+$ ]] || [[ ! "$HOST_PORT" =~ ^[0-9]+$ ]]; then
  echo "Error: local-port and host-port must be numeric." >&2
  exit 1
fi

# --- Dependencies ------------------------------------------------------------
command -v jq >/dev/null 2>&1 || { echo "Error: jq is required (brew install jq)." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Error: git is required." >&2; exit 1; }

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

TEMPLATE_DIR="projects/template"
PROJECT_DIR="projects/$NAME"
WORKFLOW_DIR=".github/workflows"
WORKFLOW_FILE="$WORKFLOW_DIR/deploy-$NAME.yml"
TFVARS_JSON="infra/terraform/projects.auto.tfvars.json"

# --- Preconditions -----------------------------------------------------------
[[ -d "$TEMPLATE_DIR" ]] || { echo "Error: $TEMPLATE_DIR not found." >&2; exit 1; }
[[ -f "$TFVARS_JSON" ]]  || { echo "Error: $TFVARS_JSON not found." >&2; exit 1; }
if [[ -e "$PROJECT_DIR" ]]; then
  echo "Error: $PROJECT_DIR already exists. Choose a different name." >&2
  exit 1
fi
if [[ -e "$WORKFLOW_FILE" ]]; then
  echo "Error: $WORKFLOW_FILE already exists." >&2
  exit 1
fi
if jq -e --arg n "$NAME" '.container_projects[$n]' "$TFVARS_JSON" >/dev/null 2>&1; then
  echo "Error: '$NAME' is already registered in $TFVARS_JSON." >&2
  exit 1
fi

# Warn on port collisions already registered in the Terraform projects file.
if jq -e --argjson hp "$HOST_PORT" \
     'any(.container_projects[]; .host_port == $hp)' "$TFVARS_JSON" >/dev/null 2>&1; then
  echo "Error: host-port $HOST_PORT is already used by another project in $TFVARS_JSON." >&2
  exit 1
fi

# Portable in-place sed (GNU vs BSD/macOS).
sed_inplace() {
  if sed --version >/dev/null 2>&1; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

echo "==> Scaffolding project '$NAME' (local=$LOCAL_PORT, host=$HOST_PORT)"

# --- 1. Copy the template folder (ADD_PROJECT.md § 2) ------------------------
cp -R "$TEMPLATE_DIR" "$PROJECT_DIR"

# Set the local dev port in docker-compose.yml (template ships 8090).
if [[ -f "$PROJECT_DIR/docker-compose.yml" ]]; then
  sed_inplace "s/\"8090:5000\"/\"$LOCAL_PORT:5000\"/" "$PROJECT_DIR/docker-compose.yml"
fi
echo "    created $PROJECT_DIR/ (docker-compose local port -> $LOCAL_PORT)"

# --- 2. Create the CI/CD workflow (ADD_PROJECT.md § 8) -----------------------
mkdir -p "$WORKFLOW_DIR"
if [[ -f "$PROJECT_DIR/deploy.yml.template" ]]; then
  cp "$PROJECT_DIR/deploy.yml.template" "$WORKFLOW_FILE"
elif [[ -f "$TEMPLATE_DIR/deploy.yml.template" ]]; then
  cp "$TEMPLATE_DIR/deploy.yml.template" "$WORKFLOW_FILE"
else
  echo "Error: no deploy.yml.template found to build the workflow." >&2
  exit 1
fi
sed_inplace "s/PROJECT_NAME/$NAME/g" "$WORKFLOW_FILE"

if grep -q "PROJECT_NAME" "$WORKFLOW_FILE"; then
  echo "Error: workflow still contains PROJECT_NAME placeholders." >&2
  exit 1
fi
echo "    created $WORKFLOW_FILE"

# --- 3. Register in Terraform (projects.auto.tfvars.json) --------------------
tmp="$(mktemp)"
jq --arg n "$NAME" --argjson hp "$HOST_PORT" \
   '.container_projects[$n] = {host_port: $hp}' "$TFVARS_JSON" > "$tmp"
mv "$tmp" "$TFVARS_JSON"
echo "    registered '$NAME' (host_port $HOST_PORT) in $TFVARS_JSON"

# --- Next steps --------------------------------------------------------------
cat <<EOF

Done. Repo-side scaffolding complete.

Next:
  1. Build the app under $PROJECT_DIR/ (routes, UI, requirements.txt, .env.example).
  2. Provision AWS + EC2:
       cd infra/terraform && terraform apply
     (or run 'make new-project NAME=$NAME LOCAL=$LOCAL_PORT HOST=$HOST_PORT' to
      scaffold and apply in one step.)
  3. If the app needs a new API key, add it to techtoday/secrets, then re-apply.
  4. Commit and push; the workflow builds the image and starts the container.
  5. Update projects/PROJECTS.md (registry + next available ports).
EOF
