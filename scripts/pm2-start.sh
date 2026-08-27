#!/usr/bin/env bash
# Start or reload alpha-front via PM2 (port 3005).
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/www-root/data/www/alpha-front}"
cd "$APP_DIR"

if [[ ! -f .output/server/index.mjs ]]; then
  echo "ERROR: .output/server/index.mjs not found in $APP_DIR"
  exit 1
fi

if [[ ! -f ecosystem.config.cjs ]]; then
  echo "ERROR: ecosystem.config.cjs not found in $APP_DIR"
  exit 1
fi

export APP_DIR

# Load optional .env into the current shell so PM2 inherits them on start/reload
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  echo "==> Loaded .env"
fi

if pm2 describe alpha-front >/dev/null 2>&1; then
  echo "==> Reloading existing PM2 process alpha-front"
  pm2 reload ecosystem.config.cjs --update-env
else
  echo "==> Starting new PM2 process alpha-front"
  pm2 start ecosystem.config.cjs
fi

pm2 save
# Enable startup on boot (safe to re-run)
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

echo "==> PM2 status"
pm2 ls
echo ""
echo "Health check (local):"
curl -s -o /dev/null -w "HTTP %{http_code}\n" "http://127.0.0.1:3005/" || true
