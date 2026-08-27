#!/usr/bin/env bash
# Upload pack + unpack + setup on remote server (optional helper).
# Usage:
#   SERVER=root@mydev.example.com bash scripts/remote-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="${SERVER:-}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/www-root/data/www/alpha-front}"
ARCHIVE_LOCAL="${ROOT}/deploy/dist/alpha-front-deploy.tar.gz"
REMOTE_TMP="/tmp/alpha-front-deploy.tar.gz"

if [[ -z "$SERVER" ]]; then
  echo "Usage: SERVER=root@YOUR_HOST bash scripts/remote-deploy.sh"
  exit 1
fi

echo "==> Building pack locally"
bash "${ROOT}/scripts/pack-deploy.sh"

echo "==> Uploading to $SERVER"
scp "$ARCHIVE_LOCAL" "${SERVER}:${REMOTE_TMP}"

echo "==> Unpacking and running server-setup on remote"
ssh "$SERVER" bash -s <<EOF
set -euo pipefail
mkdir -p ${REMOTE_DIR}
tar -xzf ${REMOTE_TMP} -C ${REMOTE_DIR}
rm -f ${REMOTE_TMP}
APP_DIR=${REMOTE_DIR} bash ${REMOTE_DIR}/server-setup.sh
EOF

echo "==> Remote deploy finished: https://alpha.test-nomad.kz"
