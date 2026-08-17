#!/usr/bin/env bash
# Copy public site files into a web-root tree (excludes scripts, docs, secrets).
# Usage: assemble_site.sh [destination]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-"$ROOT/.preview"}"

mkdir -p "$DEST"
cp "$ROOT/index.html" "$ROOT/style.css" "$ROOT/site-header.css" "$DEST/"
rsync -a --delete "$ROOT/study/" "$DEST/study/"
echo "Assembled site at $DEST"
