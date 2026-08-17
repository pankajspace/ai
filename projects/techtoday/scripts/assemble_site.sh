#!/usr/bin/env bash
# Merge src/ (home page) and study/ into one web-root tree.
# Usage: assemble_site.sh [destination]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-"$ROOT/.preview"}"

mkdir -p "$DEST"
rsync -a "$ROOT/src/" "$DEST/"
rsync -a --delete "$ROOT/study/" "$DEST/study/"
echo "Assembled site at $DEST"
