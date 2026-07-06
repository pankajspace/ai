#!/usr/bin/env bash
# Shared configuration and helpers for the project automation scripts.
#
# Source this file from other scripts:  source "$(dirname "$0")/lib.sh"
#
# Configuration precedence (highest first):
#   1. Inline environment variables, e.g. AWS_REGION=eu-west-1 ./script.sh ...
#   2. Values in this folder's `.env` file (copy from `.env.example`).
#   3. The built-in defaults below.

set -euo pipefail

# ---------------------------------------------------------------------------
# Load .env (if present) without clobbering already-set environment variables
# ---------------------------------------------------------------------------

_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_ENV_FILE="${SCRIPTS_ENV_FILE:-$_LIB_DIR/.env}"
if [ -f "$_ENV_FILE" ]; then
  while IFS= read -r _line || [ -n "$_line" ]; do
    # Skip blanks and comments.
    case "$_line" in ''|\#*) continue ;; esac
    # Only accept KEY=VALUE lines.
    [[ "$_line" == *=* ]] || continue
    _key="${_line%%=*}"
    _val="${_line#*=}"
    # Trim surrounding whitespace from the key.
    _key="${_key// /}"
    # Inline env vars win: only set from .env if the var is unset/empty.
    if [ -z "${!_key:-}" ]; then
      export "$_key=$_val"
    fi
  done < "$_ENV_FILE"
  unset _line _key _val
fi

# ---------------------------------------------------------------------------
# Configuration (override via .env or inline environment variables)
# ---------------------------------------------------------------------------

# AWS region hosting ECR, Secrets Manager, and the EC2 instance.
AWS_REGION="${AWS_REGION:-us-east-1}"

# ECR repositories are namespaced under this prefix, e.g. techtoday/basic.
ECR_NAMESPACE="${ECR_NAMESPACE:-techtoday}"

# Name of the single shared Secrets Manager secret that holds API keys.
SECRET_ID="${SECRET_ID:-techtoday/secrets}"

# Public IP / hostname of the EC2 instance that runs the containers.
ELASTIC_IP="${ELASTIC_IP:-44.193.134.238}"

# SSH user and key used to reach the EC2 instance.
EC2_USER="${EC2_USER:-ec2-user}"
SSH_KEY="${SSH_KEY:-techtoday.pem}"

# Paths on the EC2 host.
REMOTE_COMPOSE="${REMOTE_COMPOSE:-~/docker-compose.yml}"
REMOTE_SECRETS_DIR="${REMOTE_SECRETS_DIR:-~/secrets}"
REMOTE_NGINX_CONF="${REMOTE_NGINX_CONF:-/etc/nginx/conf.d/app.conf}"

# The app subdomain that Nginx serves container projects under.
APP_DOMAIN="${APP_DOMAIN:-app.techtoday.click}"

# Container projects use two parallel host-port spaces:
#   - LOCAL_BASE_PORT: the port in each project's repo docker-compose.yml,
#     used for `docker compose up` on your machine (basic=8080, langchain=8081).
#   - PROD_BASE_PORT: the port on the EC2 host in ~/docker-compose.yml,
#     which Nginx proxies to (basic=5000, langchain=5001).
# A project's prod port is derived from its local port with the same offset,
# so local 8080↔prod 5000, local 8081↔prod 5001, and so on.
LOCAL_BASE_PORT="${LOCAL_BASE_PORT:-8080}"
PROD_BASE_PORT="${PROD_BASE_PORT:-5000}"

# Repo paths, derived from this script's location so the scripts work no
# matter where they are invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$PROJECTS_DIR/.." && pwd)"
WORKFLOWS_DIR="$REPO_ROOT/.github/workflows"
TEMPLATE_PROJECT="${TEMPLATE_PROJECT:-langchain}"

# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

_c_reset='\033[0m'; _c_blue='\033[34m'; _c_green='\033[32m'
_c_yellow='\033[33m'; _c_red='\033[31m'

info()  { printf "${_c_blue}==>${_c_reset} %s\n" "$*"; }
ok()    { printf "${_c_green}✓${_c_reset} %s\n" "$*"; }
warn()  { printf "${_c_yellow}!${_c_reset} %s\n" "$*"; }
error() { printf "${_c_red}✗ %s${_c_reset}\n" "$*" >&2; }
die()   { error "$*"; exit 1; }

# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

# require_cmd <command...> — fail with a clear message if any is missing.
require_cmd() {
  local missing=0 c
  for c in "$@"; do
    if ! command -v "$c" >/dev/null 2>&1; then
      error "Required command not found: $c"
      missing=1
    fi
  done
  [ "$missing" -eq 0 ] || die "Install the missing command(s) above and retry."
}

# valid_name <name> — project/service names must be lowercase alphanumeric
# with optional dashes, so they are safe as ECR repos, compose services,
# folder names, and Nginx location paths.
valid_name() {
  [[ "$1" =~ ^[a-z][a-z0-9-]*$ ]]
}

# aws_account_id — echo the caller's 12-digit AWS account ID.
aws_account_id() {
  aws sts get-caller-identity --query Account --output text
}

# ecr_registry — echo the ECR registry host for the current account/region.
ecr_registry() {
  echo "$(aws_account_id).dkr.ecr.${AWS_REGION}.amazonaws.com"
}

# ssh_ec2 <remote-command> — run a command on the EC2 host over SSH.
ssh_ec2() {
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new \
    "${EC2_USER}@${ELASTIC_IP}" "$@"
}

# next_free_local_port — scan existing projects' repo docker-compose.yml host
# ports (of the form "NNNN:5000") and echo the next free local port at or
# after LOCAL_BASE_PORT. This is the port used for local `docker compose up`.
next_free_local_port() {
  local max="$((LOCAL_BASE_PORT - 1))" p
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    if [ "$p" -gt "$max" ]; then max="$p"; fi
  done < <(grep -rhoE '"[0-9]+:5000"' "$PROJECTS_DIR"/*/docker-compose.yml 2>/dev/null \
             | grep -oE '^"[0-9]+' | tr -d '"')
  echo "$((max + 1))"
}

# local_to_prod_port <local_port> — map a local host port to its production
# host port by preserving the offset from the base (8080→5000, 8081→5001).
local_to_prod_port() {
  echo "$(( $1 - LOCAL_BASE_PORT + PROD_BASE_PORT ))"
}

# read_local_port <project_dir> — echo the web service's host port from a
# project's repo docker-compose.yml, or empty if not found.
read_local_port() {
  grep -oE '"[0-9]+:5000"' "$1/docker-compose.yml" 2>/dev/null \
    | grep -oE '^"[0-9]+' | tr -d '"' | head -n1
}
