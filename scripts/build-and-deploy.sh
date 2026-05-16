#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building clujparticipa-app image..."
docker compose build app

echo "==> Restarting app container..."
docker compose up -d app

echo "==> Running pending database migrations..."
docker compose exec -T app sh -c 'cd /tmp && npm install prisma@7 dotenv 2>/dev/null && cd /app && DATABASE_URL=$DATABASE_URL NODE_PATH=/tmp/node_modules /tmp/node_modules/.bin/prisma migrate deploy'

echo "==> Pruning dangling images and stale build cache..."
docker image prune -f
docker builder prune -f --filter "until=24h"

echo "==> Done. Active images:"
docker images --filter "dangling=false" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
