#!/usr/bin/env bash
# Build Nuxt and pack only what the server needs.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT_DIR="${ROOT}/deploy/dist"
ARCHIVE="${OUT_DIR}/alpha-front-deploy.tar.gz"
STAGING="${OUT_DIR}/staging"

echo "==> Installing dependencies (if needed)"
if [[ ! -d node_modules ]]; then
  npm ci
fi

echo "==> Building Nuxt (.output)"
npm run build

echo "==> Staging deploy artifacts"
rm -rf "$STAGING"
mkdir -p "$STAGING"

# Production runtime: Nitro output is self-contained (no root node_modules needed)
cp -a .output "$STAGING/.output"
cp ecosystem.config.cjs "$STAGING/"
cp package.json "$STAGING/"
cp deploy/nginx/alpha.test-nomad.kz.conf "$STAGING/"
cp scripts/server-setup.sh "$STAGING/"
cp scripts/pm2-start.sh "$STAGING/"

# Optional production env (create locally as .env.production if needed)
if [[ -f .env.production ]]; then
  cp .env.production "$STAGING/.env"
  echo "    included .env.production as .env"
fi

mkdir -p "$OUT_DIR"
rm -f "$ARCHIVE"
tar -czf "$ARCHIVE" -C "$STAGING" .

SIZE="$(du -h "$ARCHIVE" | awk '{print $1}')"
echo ""
echo "==> Done: $ARCHIVE ($SIZE)"
echo ""
echo "Upload to server:"
echo "  scp $ARCHIVE root@YOUR_SERVER:/tmp/alpha-front-deploy.tar.gz"
echo ""
echo "On server:"
echo "  mkdir -p /var/www/www-root/data/www/alpha-front"
echo "  cd /var/www/www-root/data/www/alpha-front"
echo "  tar -xzf /tmp/alpha-front-deploy.tar.gz"
echo "  bash server-setup.sh"
echo ""
echo "What is inside the archive:"
echo "  .output/                  — Nuxt production build (required)"
echo "  ecosystem.config.cjs      — PM2 config (port 3005)"
echo "  package.json              — metadata"
echo "  alpha.test-nomad.kz.conf  — nginx site"
echo "  server-setup.sh           — nginx + ssl + pm2"
echo "  pm2-start.sh              — start/reload app only"
