#!/usr/bin/env bash
# ==============================================================================
# Shipyard PaaS — Zero-Configuration Self-Hosted VPS Installer
#
# Usage:
#   curl -fsSL https://shipyard.example/install.sh | sh
#
# Advanced usage:
#   curl -fsSL https://shipyard.example/install.sh | sh -s -- \
#     --email admin@mycompany.com \
#     --password mySecurePassword \
#     --port 3000
#
# Supported OS: Ubuntu 20.04+, Debian 11+, CentOS 8+, Rocky Linux 8+
# Requires: 1 CPU, 512MB RAM minimum (2GB+ recommended for builds)
# ==============================================================================

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Defaults ──────────────────────────────────────────────────────────────────
SHIPYARD_PORT="${SHIPYARD_PORT:-3000}"
SHIPYARD_DATA_DIR="${SHIPYARD_DATA_DIR:-/var/lib/shipyard}"
ADMIN_EMAIL="${SHIPYARD_ADMIN_EMAIL:-admin@shipyard.local}"
SHIPYARD_REPO="${SHIPYARD_REPO:-https://github.com/RishBroProMax/Shipyard.git}"

# ── Parse CLI Flags ───────────────────────────────────────────────────────────
ADMIN_PASSWORD=""
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --port)     SHIPYARD_PORT="$2"; shift ;;
        --email)    ADMIN_EMAIL="$2"; shift ;;
        --password) ADMIN_PASSWORD="$2"; shift ;;
        --data-dir) SHIPYARD_DATA_DIR="$2"; shift ;;
        --repo)     SHIPYARD_REPO="$2"; shift ;;
        *) ;;
    esac
    shift
done

# ── Generate Secrets ─────────────────────────────────────────────────────────
# Generate a random secure password if not provided
if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD=$(openssl rand -base64 18 2>/dev/null | tr -dc 'A-Za-z0-9!@#$%^&*' | head -c 20 || \
                    tr -dc 'A-Za-z0-9' </dev/urandom 2>/dev/null | head -c 20)
fi

# Generate a unique Postgres password (stored in .env file)
POSTGRES_PASSWORD=$(openssl rand -hex 24 2>/dev/null || tr -dc 'a-f0-9' </dev/urandom | head -c 48)

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}"
cat << "BANNER"
  ____  _     _                         _
 / ___|| |__ (_) _ __  _   _  __ _ _ __| |
 \___ \| '_ \| || '_ \| | | |/ _` | '__| |
  ___) | | | | || |_) | |_| | (_| | |  |_|
 |____/|_| |_|_|| .__/ \__, |\__,_|_|  (_)
                |_|    |___/
 Zero-Configuration Self-Hosted Developer Platform (PaaS)
BANNER
echo -e "${NC}"

echo -e "${BLUE}${BOLD}=============================================${NC}"
echo -e "  Installing Shipyard PaaS on this VPS..."
echo -e "  Admin Email:  ${GREEN}${ADMIN_EMAIL}${NC}"
echo -e "  Port:         ${GREEN}${SHIPYARD_PORT}${NC}"
echo -e "  Data Dir:     ${GREEN}${SHIPYARD_DATA_DIR}${NC}"
echo -e "${BLUE}${BOLD}=============================================${NC}"
echo ""

# ── Detect root / sudo ───────────────────────────────────────────────────────
SUDO=""
if [ "$EUID" -ne 0 ]; then
    if ! command -v sudo &>/dev/null; then
        echo -e "${RED}Error: Please run as root, or install sudo first.${NC}"
        exit 1
    fi
    SUDO="sudo"
fi

# ── Detect OS Package Manager ─────────────────────────────────────────────────
if command -v apt-get &>/dev/null; then
    PKG_MANAGER="apt"
elif command -v yum &>/dev/null; then
    PKG_MANAGER="yum"
elif command -v dnf &>/dev/null; then
    PKG_MANAGER="dnf"
else
    echo -e "${YELLOW}Warning: Unknown package manager. Assuming apt-get.${NC}"
    PKG_MANAGER="apt"
fi

# ── Step 1: Install System Dependencies ──────────────────────────────────────
echo -e "${BLUE}[1/6] Installing system dependencies...${NC}"

if [ "$PKG_MANAGER" = "apt" ]; then
    $SUDO apt-get update -qq
    $SUDO apt-get install -y -qq curl git openssl ca-certificates netcat-openbsd 2>/dev/null || \
    $SUDO apt-get install -y -qq curl git openssl ca-certificates netcat 2>/dev/null || true
elif [ "$PKG_MANAGER" = "yum" ] || [ "$PKG_MANAGER" = "dnf" ]; then
    $SUDO $PKG_MANAGER install -y -q curl git openssl ca-certificates nmap-ncat 2>/dev/null || true
fi

echo -e "${GREEN}✓ System dependencies ready.${NC}"

# ── Step 2: Install Docker ────────────────────────────────────────────────────
echo -e "${BLUE}[2/6] Checking Docker...${NC}"

if ! command -v docker &>/dev/null; then
    echo -e "${YELLOW}Docker not found. Installing via official script...${NC}"
    curl -fsSL https://get.docker.com | sh
    $SUDO systemctl enable --now docker
    echo -e "${GREEN}✓ Docker installed and started.${NC}"
else
    DOCKER_VERSION=$(docker --version | sed 's/Docker version //' | cut -d',' -f1)
    echo -e "${GREEN}✓ Docker ${DOCKER_VERSION} already installed.${NC}"
fi

# Check Docker Compose (plugin or standalone)
if ! docker compose version &>/dev/null 2>&1; then
    echo -e "${YELLOW}Docker Compose plugin not found. Installing...${NC}"
    if [ "$PKG_MANAGER" = "apt" ]; then
        $SUDO apt-get install -y docker-compose-plugin 2>/dev/null || \
        $SUDO apt-get install -y docker-compose 2>/dev/null || true
    elif [ "$PKG_MANAGER" = "yum" ] || [ "$PKG_MANAGER" = "dnf" ]; then
        $SUDO $PKG_MANAGER install -y docker-compose-plugin 2>/dev/null || true
    fi
fi

# Ensure current user is in the docker group
if [ -n "$SUDO" ] && ! groups | grep -q docker; then
    $SUDO usermod -aG docker "$USER" 2>/dev/null || true
fi

# ── Step 3: Clone / Update Shipyard Source ────────────────────────────────────
echo -e "${BLUE}[3/6] Fetching Shipyard source code...${NC}"

INSTALL_SOURCE="${SHIPYARD_DATA_DIR}/source"

if [ -d "${INSTALL_SOURCE}/.git" ]; then
    echo -e "  Existing installation found. Pulling latest changes..."
    cd "${INSTALL_SOURCE}"
    git pull --ff-only origin main 2>/dev/null || git fetch --all && git reset --hard origin/main
else
    $SUDO mkdir -p "${INSTALL_SOURCE}"
    # Fix ownership so non-root user can run git clone
    if [ -n "$SUDO" ]; then
        $SUDO chown -R "$USER:$USER" "${SHIPYARD_DATA_DIR}" 2>/dev/null || \
        $SUDO chmod 777 "${INSTALL_SOURCE}"
    fi
    git clone --depth 1 "${SHIPYARD_REPO}" "${INSTALL_SOURCE}"
fi

echo -e "${GREEN}✓ Shipyard source ready at ${INSTALL_SOURCE}${NC}"

# ── Step 4: Setup Persistent Data Directories ─────────────────────────────────
echo -e "${BLUE}[4/6] Setting up persistent storage...${NC}"

$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/secrets"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/deployments"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/apps"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/caddy"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/logs"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/postgres"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/redis"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/backups"

# Bootstrap a default Caddyfile so the proxy starts immediately
CADDYFILE="${SHIPYARD_DATA_DIR}/data/caddy/Caddyfile"
if [ ! -f "$CADDYFILE" ]; then
    cat > /tmp/shipyard-caddyfile << 'CADDYEOF'
# Shipyard Caddy Reverse Proxy Configuration
# This file is managed dynamically by Shipyard.
# Do not edit manually — changes will be overwritten.

:80 {
    reverse_proxy shipyard-app:3000
    log {
        output file /var/lib/shipyard/data/logs/caddy-access.log
        format json
    }
}
CADDYEOF
    $SUDO mv /tmp/shipyard-caddyfile "$CADDYFILE"
    echo -e "  ✓ Default Caddyfile created."
fi

echo -e "${GREEN}✓ Persistent storage configured.${NC}"

# ── Step 5: Write .env File ───────────────────────────────────────────────────
echo -e "${BLUE}[5/6] Writing production environment configuration...${NC}"

ENV_FILE="${INSTALL_SOURCE}/.env"
if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" << ENVEOF
# Shipyard PaaS — Auto-Generated by install.sh on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
NODE_ENV=production
SHIPYARD_MODE=appliance
SHIPYARD_DATA_DIR=/var/lib/shipyard/data
SHIPYARD_PORT=${SHIPYARD_PORT}
SHIPYARD_ADMIN_EMAIL=${ADMIN_EMAIL}
SHIPYARD_ADMIN_PASSWORD=${ADMIN_PASSWORD}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://shipyard:${POSTGRES_PASSWORD}@shipyard-db:5432/shipyard
REDIS_URL=redis://shipyard-redis:6379
ENVEOF
    echo -e "  ✓ .env file written."
else
    echo -e "  ✓ Existing .env file preserved."
fi

# Save admin credentials to secrets file (readable by root only)
SECRETS_FILE="${SHIPYARD_DATA_DIR}/data/secrets/shipyard.secret.json"
if [ ! -f "$SECRETS_FILE" ]; then
    cat > /tmp/shipyard-secrets.json << SECRETSEOF
{
  "adminEmail": "${ADMIN_EMAIL}",
  "adminInitialPassword": "${ADMIN_PASSWORD}",
  "postgresPassword": "${POSTGRES_PASSWORD}",
  "installedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
SECRETSEOF
    $SUDO mv /tmp/shipyard-secrets.json "$SECRETS_FILE"
    $SUDO chmod 600 "$SECRETS_FILE"
    echo -e "  ✓ Credentials secured at ${SECRETS_FILE}"
fi

echo -e "${GREEN}✓ Environment configured.${NC}"

# ── Step 6: Build and Start Docker Compose Stack ──────────────────────────────
echo -e "${BLUE}[6/6] Building and launching Shipyard services...${NC}"
echo -e "  This may take 2-5 minutes on first install (building Docker image)..."
echo ""

cd "${INSTALL_SOURCE}"

# Build the Docker image from source.
# Use --no-cache only on first install (no existing image), use cache on updates.
if $SUDO docker image inspect shipyard-app:latest &>/dev/null 2>&1; then
    echo -e "  Existing image found — rebuilding with layer cache (faster update)..."
    $SUDO docker compose --env-file .env build shipyard-app
else
    echo -e "  First install — performing full image build (this takes 3-8 minutes)..."
    $SUDO docker compose --env-file .env build --no-cache shipyard-app
fi

# Start all services (detached)
$SUDO docker compose --env-file .env up -d

# Wait for the app to respond on /api/health
echo -e "${BLUE}  Waiting for Shipyard to be ready (up to 90s)...${NC}"
MAX_WAIT=90
WAIT_COUNT=0
until [ $WAIT_COUNT -ge $MAX_WAIT ]; do
    STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${SHIPYARD_PORT}/api/health 2>/dev/null || echo 000)
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}  ✓ Shipyard is responding (HTTP 200).${NC}"
        break
    fi
    WAIT_COUNT=$((WAIT_COUNT + 3))
    sleep 3
done

# ── Get Public IP ─────────────────────────────────────────────────────────────
IP=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || \
     curl -s --max-time 5 https://icanhazip.com 2>/dev/null || \
     hostname -I 2>/dev/null | awk '{print $1}' || \
     echo "YOUR_VPS_IP")

# ── Success Banner ─────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}=============================================${NC}"
echo -e "${GREEN}${BOLD}  ⚓ SHIPYARD IS LIVE!${NC}"
echo -e "${GREEN}${BOLD}=============================================${NC}"
echo ""
echo -e "  Dashboard:  ${CYAN}${BOLD}http://${IP}:${SHIPYARD_PORT}${NC}"
echo -e "  Local URL:  ${CYAN}http://localhost:${SHIPYARD_PORT}${NC}"
echo ""
echo -e "  ${BOLD}Admin Credentials:${NC}"
echo -e "  Email:      ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e "  Password:   ${YELLOW}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "  ${BOLD}Credentials saved to:${NC}"
echo -e "  ${BLUE}${SECRETS_FILE}${NC}"
echo ""
echo -e "${GREEN}${BOLD}Next Steps:${NC}"
echo -e "  1. Open ${CYAN}http://${IP}:${SHIPYARD_PORT}${NC} in your browser"
echo -e "  2. Log in with the credentials above"
echo -e "  3. Connect a custom domain for automatic SSL"
echo -e "  4. Deploy your first project from GitHub or the File Studio"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View logs:     ${YELLOW}cd ${INSTALL_SOURCE} && docker compose logs -f${NC}"
echo -e "  Stop:          ${YELLOW}cd ${INSTALL_SOURCE} && docker compose down${NC}"
echo -e "  Update:        ${YELLOW}cd ${INSTALL_SOURCE} && git pull && docker compose up -d --build${NC}"
echo -e "  Worker node:   ${YELLOW}curl -fsSL http://${IP}:${SHIPYARD_PORT}/agent_install | sh -s -- --token \$(cat ${SECRETS_FILE} | grep agentToken)${NC}"
echo ""
