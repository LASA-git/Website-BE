#!/usr/bin/env bash
# ==========================================================================
# LASA-BE - Production deployment script (CMV parity)
# Usage: sudo ./scripts/deploy-production.sh
# This script is intended to run on the EC2 server (in the repo directory).
# It mirrors CMV behavior: git pull, Node/PM2 checks & install, .env validations,
# npm ci --production, start via PM2 using ecosystem.production.config.js,
# health check, pm2 save and enable startup.
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="lasa-production"
CRON_NAME="lasa-production-cron"
PORT=5001
LOG_DIR="./logs"
BRANCH="main"
DOMAIN="loveallserveallne.org"
API_DOMAIN="api.${DOMAIN}"
CERT_EMAIL="admin@${DOMAIN}"
LOG_RETENTION=5

# backup
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_DIR="/tmp/lasa-backup-${TIMESTAMP}"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}     LASA-BE - Production Deployment (CMV parity)${NC}"
echo -e "${BLUE}============================================================================${NC}"

echo -e "${YELLOW}🔍 Running pre-flight checks...${NC}"

# Check git repo
if [ ! -d ".git" ]; then
  echo -e "${RED}❌ ERROR: This directory does not look like a git repo.${NC}"
  echo -e "   Please clone the repo on the server and run this script from the repo root." 
  exit 1
fi

# Ensure branch
echo -e "   Creating backup and recording current commit"
mkdir -p "${BACKUP_DIR}"
CURRENT_COMMIT=$(git rev-parse --verify HEAD || echo "")
echo "${CURRENT_COMMIT}" > .last_deploy_commit || true
tar --exclude='./node_modules' --exclude='./logs' -czf "${BACKUP_DIR}/lasa-${TIMESTAMP}.tar.gz" . || true

echo -e "   Checking out branch ${BRANCH}"
git fetch origin ${BRANCH}
git checkout ${BRANCH}
git reset --hard origin/${BRANCH}

# Check Node.js
NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")
echo -e "   Node.js version: ${NODE_VERSION}"
if [[ "${NODE_VERSION}" == "not installed" ]]; then
  echo -e "${YELLOW}⚠️  Node.js not found. Installing Node.js 18.x...${NC}"
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo -e "${RED}❌ Unsupported package manager. Install Node.js 18+ manually.${NC}"
    exit 1
  fi
fi

NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")
echo -e "   Node.js version after install check: ${NODE_VERSION}"
if [[ ! "${NODE_VERSION}" =~ ^v(18|19|20|21|22) ]]; then
  echo -e "${YELLOW}⚠️  Warning: Node.js 18+ recommended for production${NC}"
fi

# Ensure pm2
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}ℹ️  PM2 not found. Installing pm2 globally...${NC}"
  sudo npm install -g pm2
fi
echo -e "   PM2 version: $(pm2 -v)"

# Validate .env
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ ERROR: .env file not found!${NC}"
  echo -e "   Please create .env file with production configuration. Use .env.example as template."
  exit 1
fi

echo -e "${YELLOW}🔒 Validating production security settings...${NC}"
if grep -q "NODE_ENV=development" .env; then
  echo -e "${RED}❌ ERROR: NODE_ENV is set to 'development' in .env${NC}"
  echo -e "   Please set NODE_ENV=production${NC}"
  exit 1
fi
if grep -q "DEBUG=true" .env; then
  echo -e "${RED}❌ ERROR: DEBUG is enabled in .env${NC}"
  exit 1
fi
if grep -q "localhost" .env; then
  echo -e "${YELLOW}⚠️  Warning: Found 'localhost' in .env - ensure URLs are production URLs${NC}"
fi

echo -e "${GREEN}✅ Security validation passed${NC}"

echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
npm ci --production --silent 2>/dev/null || npm install --production --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "${YELLOW}📁 Creating required directories and rotating logs...${NC}"
mkdir -p ${LOG_DIR}
chmod 755 ${LOG_DIR}
# rotate existing logs to archive
if [ -d "${LOG_DIR}" ]; then
  ARCHIVE_DIR="${LOG_DIR}/archive"
  mkdir -p "${ARCHIVE_DIR}"
  if [ -n "$(ls -A ${LOG_DIR} 2>/dev/null)" ]; then
    tar -czf "${ARCHIVE_DIR}/logs-${TIMESTAMP}.tar.gz" -C "${LOG_DIR}" . || true
    # remove raw log files
    find "${LOG_DIR}" -maxdepth 1 -type f -name "*.log" -exec rm -f {} + || true
    # prune old archives
    ls -1t "${ARCHIVE_DIR}" | tail -n +$((LOG_RETENTION+1)) | xargs -r -I {} rm -f "${ARCHIVE_DIR}/{}" || true
  fi
fi
echo -e "${GREEN}✅ Directories created and logs rotated${NC}"

echo -e "${YELLOW}🛑 Stopping existing processes...${NC}"
pm2 delete ${APP_NAME} 2>/dev/null || true
pm2 delete ${CRON_NAME} 2>/dev/null || true
echo -e "${GREEN}✅ Existing processes stopped${NC}"

echo -e "${YELLOW}🚀 Starting application in PRODUCTION mode...${NC}"

# Start using ecosystem file if present
if [ -f "ecosystem.production.config.js" ]; then
  pm2 start ecosystem.production.config.js --env production
else
  # fallback: start npm start
  pm2 start npm --name "${APP_NAME}" -- start --env production
fi

sleep 3

echo -e "${YELLOW}🏥 Running health check...${NC}"
if pm2 list | grep -q "${APP_NAME}.*online"; then
  echo -e "${GREEN}✅ Application is running${NC}"
else
  echo -e "${RED}❌ Application failed to start. Check logs:${NC}"
  pm2 logs ${APP_NAME} --lines 20
  exit 1
fi

sleep 2
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/health 2>/dev/null || echo "000")
if [ "${HEALTH_CHECK}" = "200" ]; then
  echo -e "${GREEN}✅ Health check passed (HTTP 200)${NC}"
elif [ "${HEALTH_CHECK}" = "000" ]; then
  echo -e "${YELLOW}⚠️  Could not connect to health endpoint (may need a moment to start)${NC}"
else
  echo -e "${YELLOW}⚠️  Health check returned HTTP ${HEALTH_CHECK}${NC}"
fi

echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
echo -e "${GREEN}✅ PM2 configuration saved${NC}"

# Enable pm2 startup (attempt to run automatically)
echo -e "${YELLOW}🔧 Enabling PM2 startup (this may require sudo)...${NC}"
if sudo -n true 2>/dev/null; then
  sudo pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) >/dev/null
  sudo pm2 save
  echo -e "${GREEN}✅ PM2 startup enabled${NC}"
else
  echo -e "${YELLOW}⚠️  Could not run sudo without password; to enable pm2 startup run:${NC}"
  echo -e "   sudo pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))"
  echo -e "   sudo pm2 save"
fi

# Nginx + Certbot setup (if domain provided)
if [ -n "${DOMAIN}" ]; then
  echo -e "${YELLOW}🌐 Configuring Nginx and Certbot for ${DOMAIN} (requires sudo)...${NC}"
  if ! command -v nginx >/dev/null 2>&1; then
    echo -e "${YELLOW}ℹ️  Installing nginx...${NC}"
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update
      sudo apt-get install -y nginx
    else
      echo -e "${RED}❌ Unsupported package manager for automatic nginx install. Install nginx manually.${NC}"
    fi
  fi

  # Create nginx site config
  NCONF="/etc/nginx/sites-available/lasa"
  sudo bash -c "cat > ${NCONF} <<'NGCONF'
server {
    listen 80;
    server_name ${API_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGCONF"
  sudo ln -sf ${NCONF} /etc/nginx/sites-enabled/lasa
  sudo nginx -t && sudo systemctl reload nginx || true

  # Install certbot (snap preferred)
  if ! command -v certbot >/dev/null 2>&1; then
    echo -e "${YELLOW}ℹ️  Installing certbot...${NC}"
    if command -v snap >/dev/null 2>&1; then
      sudo snap install core; sudo snap refresh core
      sudo snap install --classic certbot
      sudo ln -sf /snap/bin/certbot /usr/bin/certbot || true
    else
      sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx || true
    fi
  fi

  # Obtain certificate
  if command -v certbot >/dev/null 2>&1; then
    sudo certbot --nginx -d ${API_DOMAIN} --non-interactive --agree-tos -m ${CERT_EMAIL} --redirect || true
  else
    echo -e "${YELLOW}⚠️  certbot not available; please install certbot and run: certbot --nginx -d ${API_DOMAIN}${NC}"
  fi
fi

echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}✅ PRODUCTION DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}============================================================================${NC}"

echo -e "📊 Application Status:"
pm2 status

echo -e "\nUseful Commands:"
echo -e "   View logs:     ${YELLOW}pm2 logs ${APP_NAME}${NC}"
echo -e "   Monitor:       ${YELLOW}pm2 monit${NC}"
echo -e "   Restart:       ${YELLOW}pm2 restart ${APP_NAME}${NC}"
echo -e "   Stop:          ${YELLOW}pm2 stop ${APP_NAME}${NC}"

echo -e "${GREEN}🎉 Production server is now running on port ${PORT}${NC}"
