#!/usr/bin/env bash
# Simple rollback to previous commit recorded by deploy-production.sh
set -euo pipefail

if [ ! -f .last_deploy_commit ]; then
  echo "No .last_deploy_commit file found in repo root. Cannot rollback."
  exit 1
fi

PREV_COMMIT=$(cat .last_deploy_commit)
if [ -z "${PREV_COMMIT}" ]; then
  echo "Previous commit hash empty. Cannot rollback."
  exit 1
fi

echo "Rolling back to ${PREV_COMMIT}"
git fetch --all
git reset --hard ${PREV_COMMIT}

echo "Installing production dependencies..."
npm ci --production --silent || npm install --production --silent

echo "Restarting PM2 processes using ecosystem.production.config.js if present..."
if [ -f ecosystem.production.config.js ]; then
  pm2 delete all 2>/dev/null || true
  pm2 start ecosystem.production.config.js --env production
else
  pm2 restart lasa-production 2>/dev/null || pm2 start npm --name "lasa-production" -- start --env production
fi

pm2 save
echo "Rollback complete. Check logs: pm2 logs lasa-production"
