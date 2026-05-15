#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building clujparticipa-app image..."
docker compose build app

echo "==> Restarting app container..."
docker compose up -d app

echo "==> Pruning dangling images and stale build cache..."
docker image prune -f
docker builder prune -f --filter "until=24h"

echo "==> Done. Active images:"
docker images --filter "dangling=false" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
