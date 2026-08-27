#!/usr/bin/env bash
# Run ON the AlmaLinux server after unpacking the deploy archive.
# Installs nginx site, SSL (certbot), and starts the app with PM2.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/www-root/data/www/alpha-front}"
DOMAIN="${DOMAIN:-alpha.test-nomad.kz}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"
NGINX_AVAILABLE="/etc/nginx/conf.d/${DOMAIN}.conf"

cd "$APP_DIR"

if [[ ! -f .output/server/index.mjs ]]; then
  echo "ERROR: .output/server/index.mjs not found in $APP_DIR"
  echo "Unpack the deploy archive into $APP_DIR first."
  exit 1
fi

if [[ $EUID -ne 0 ]]; then
  echo "ERROR: run as root (or with sudo)"
  exit 1
fi

# Accept both flat deploy layout and nested deploy/nginx layout
NGINX_CONF_SRC=""
for candidate in \
  "${APP_DIR}/alpha.test-nomad.kz.conf" \
  "${APP_DIR}/deploy/nginx/alpha.test-nomad.kz.conf"
do
  if [[ -f "$candidate" ]]; then
    NGINX_CONF_SRC="$candidate"
    break
  fi
done

echo "==> App directory: $APP_DIR"
echo "==> Domain: $DOMAIN"

# --- nginx ---
echo "==> Installing nginx site"
if [[ -z "$NGINX_CONF_SRC" ]]; then
  echo "ERROR: nginx config not found (alpha.test-nomad.kz.conf)"
  exit 1
fi

cp "$NGINX_CONF_SRC" "$NGINX_AVAILABLE"
nginx -t
systemctl enable nginx
systemctl reload nginx

# --- firewall (optional, ignore failures) ---
if command -v firewall-cmd >/dev/null 2>&1; then
  echo "==> Opening HTTP/HTTPS in firewalld (if active)"
  firewall-cmd --permanent --add-service=http 2>/dev/null || true
  firewall-cmd --permanent --add-service=https 2>/dev/null || true
  firewall-cmd --reload 2>/dev/null || true
fi

# --- SSL ---
echo "==> Issuing SSL certificate with certbot"
if ! command -v certbot >/dev/null 2>&1; then
  echo "ERROR: certbot not found. Install: dnf install -y certbot python3-certbot-nginx"
  exit 1
fi

# Only run certbot if cert does not exist yet
if [[ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
  echo "    certificate already exists for $DOMAIN — skipping issue"
  certbot renew --dry-run >/dev/null 2>&1 || true
fi

nginx -t
systemctl reload nginx

# --- PM2 ---
echo "==> Starting app with PM2 on port 3005"
PM2_SCRIPT=""
for candidate in "${APP_DIR}/pm2-start.sh" "${APP_DIR}/scripts/pm2-start.sh"; do
  if [[ -f "$candidate" ]]; then
    PM2_SCRIPT="$candidate"
    break
  fi
done
if [[ -z "$PM2_SCRIPT" ]]; then
  echo "ERROR: pm2-start.sh not found"
  exit 1
fi
APP_DIR="$APP_DIR" bash "$PM2_SCRIPT"

echo ""
echo "==> Done"
echo "    URL:  https://${DOMAIN}"
echo "    App:  http://127.0.0.1:3005 (proxied by nginx)"
echo "    PM2:  pm2 ls | pm2 logs alpha-front"
echo ""
echo "DNS must point ${DOMAIN} -> this server before SSL works."
