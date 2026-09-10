#!/usr/bin/env bash
# Start / reload alpha-front with the public API base always set.
set -euo pipefail
cd "$(dirname "$0")"

export NODE_ENV=production
export HOST=127.0.0.1
export PORT=3005
export NITRO_HOST=127.0.0.1
export NITRO_PORT=3005
export NUXT_PUBLIC_API_BASE="${NUXT_PUBLIC_API_BASE:-https://back-alpha.test-nomad.kz/api}"

# Nitro/Nuxt also read .env next to the app
printf 'NUXT_PUBLIC_API_BASE=%s\n' "$NUXT_PUBLIC_API_BASE" > .env

pm2 delete alpha-front >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs --update-env
pm2 save

echo "Started with NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE"
echo "Check: curl -sL https://alpha.test-nomad.kz/shop | grep -o 'apiBase:\"[^\"]*\"'"
