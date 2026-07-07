#!/usr/bin/env bash

# Deploy LASA-BE to an AWS EC2 host via rsync + SSH and start with PM2.
# Usage:
#   ./scripts/deploy-to-ec2.sh --host 1.2.3.4 --user ubuntu --key ~/.ssh/mykey.pem --remote-dir /home/ubuntu/lasa-be --env production

set -euo pipefail

print_usage() {
  echo "Usage: $0 --host HOST --user USER --key SSH_KEY --remote-dir REMOTE_DIR [--env ENV]"
  echo "  --host         EC2 public IP or DNS"
  echo "  --user         SSH user (eg. ubuntu)"
  echo "  --key          Path to SSH private key file"
  echo "  --remote-dir   Remote directory to deploy to"
  echo "  --env          Environment (production|staging). Default: production"
  exit 1
}

if [ "$#" -eq 0 ]; then
  print_usage
fi

ENV=production
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --host) HOST="$2"; shift 2;;
    --user) USER="$2"; shift 2;;
    --key) KEY="$2"; shift 2;;
    --remote-dir) REMOTE_DIR="$2"; shift 2;;
    --env) ENV="$2"; shift 2;;
    -h|--help) print_usage;;
    *) echo "Unknown arg: $1"; print_usage;;
  esac
done

if [ -z "${HOST:-}" ] || [ -z "${USER:-}" ] || [ -z "${KEY:-}" ] || [ -z "${REMOTE_DIR:-}" ]; then
  echo "❌ Missing required argument"
  print_usage
fi

SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${KEY}"
RSYNC_OPTS="-avz --delete --exclude=node_modules --exclude=.git --exclude=logs --exclude=.env"
APP_NAME="lasa-be-${ENV}"

echo "📦 Building package (install dev deps skipped)..."
# Ensure a clean install locally (optional). We only package source; user can uncomment if desired.
# npm ci --only=production

TAR_NAME="lasa-deploy-$(date +%s).tar.gz"

echo "🔁 Syncing files to ${USER}@${HOST}:${REMOTE_DIR} using rsync..."
ssh ${SSH_OPTS} ${USER}@${HOST} "mkdir -p ${REMOTE_DIR} && chown ${USER}:${USER} ${REMOTE_DIR} || true"

rsync ${RSYNC_OPTS} -e "ssh ${SSH_OPTS}" ./ ${USER}@${HOST}:${REMOTE_DIR}/

echo "🔧 Running remote install and startup commands..."
ssh ${SSH_OPTS} ${USER}@${HOST} bash -s <<EOF
set -e
cd ${REMOTE_DIR}

# Ensure Node.js and PM2 are available
if ! command -v node >/dev/null 2>&1; then
  echo "⚠️  Node.js is not installed on remote host. Please install Node.js 18+ manually."
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "ℹ️  PM2 not found. Installing pm2 globally..."
  npm install -g pm2
fi

echo "📦 Installing production dependencies..."
npm ci --production || npm install --production

mkdir -p logs

echo "🛑 Stopping existing PM2 process (if any)..."
pm2 delete ${APP_NAME} 2>/dev/null || true

echo "🚀 Starting application with PM2 as ${APP_NAME}..."
# Use pm2 to start npm script 'start' (adjust if your start script differs)
pm2 start npm --name "${APP_NAME}" -- start --env ${ENV}
pm2 save

echo "📊 PM2 status:"
pm2 status

echo "✅ Remote deploy steps completed"
EOF

echo "✅ Deployment finished. Run 'pm2 logs ${APP_NAME}' on the server to view logs."
