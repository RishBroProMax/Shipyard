#!/usr/bin/env bash
# ==============================================================================
# Shipyard PaaS — Zero-Configuration Self-Hosted VPS Appliance Installer
#
# Interactive usage (terminal prompt for email & admin password):
#   curl -fsSL https://shipyard.example/install.sh | bash
#
# Headless / Scripted usage (CI/CD, cloud-init, Ansible):
#   curl -fsSL https://shipyard.example/install.sh | bash -s -- \
#     --email admin@mycompany.com \
#     --password mySecurePassword \
#     --port 3000 \
#     --non-interactive
#
# Supported OS: Ubuntu 20.04+, Debian 11+, CentOS 8+, Rocky Linux 8+, AlmaLinux 8+
# Minimum requirements: 1 CPU, 512MB RAM (2GB+ recommended for builds)
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
ADMIN_EMAIL="${SHIPYARD_ADMIN_EMAIL:-}"
ADMIN_PASSWORD="${SHIPYARD_ADMIN_PASSWORD:-}"
SHIPYARD_REPO="${SHIPYARD_REPO:-https://github.com/RishBroProMax/Shipyard.git}"
NON_INTERACTIVE=false

# ── Parse CLI Flags ───────────────────────────────────────────────────────────
EMAIL_EXPLICIT=false
PASSWORD_EXPLICIT=false

if [ -n "$ADMIN_EMAIL" ]; then
    EMAIL_EXPLICIT=true
fi
if [ -n "$ADMIN_PASSWORD" ]; then
    PASSWORD_EXPLICIT=true
fi

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --port|-p)          SHIPYARD_PORT="$2"; shift ;;
        --email|-e)         ADMIN_EMAIL="$2"; EMAIL_EXPLICIT=true; shift ;;
        --password|-w)      ADMIN_PASSWORD="$2"; PASSWORD_EXPLICIT=true; shift ;;
        --data-dir|-d)      SHIPYARD_DATA_DIR="$2"; shift ;;
        --repo|-r)          SHIPYARD_REPO="$2"; shift ;;
        --non-interactive|-y|--yes) NON_INTERACTIVE=true ;;
        *) ;;
    esac
    shift
done

# ── Terminal & TTY Detection for Interactive Prompts ─────────────────────────
# When piped via `curl ... | bash` or `sh`, stdin is the curl stream.
# To interact with the administrator, we read directly from /dev/tty.
TTY_DEV=""
if [ -r /dev/tty ] && [ -w /dev/tty ]; then
    TTY_DEV="/dev/tty"
elif [ -t 0 ]; then
    TTY_DEV="/dev/stdin"
fi

if [ -z "$TTY_DEV" ] || [ "${CI:-}" = "true" ] || [ "${DEBIAN_FRONTEND:-}" = "noninteractive" ]; then
    NON_INTERACTIVE=true
fi

# ── Interactive Setup Prompt ─────────────────────────────────────────────────
if [ "$NON_INTERACTIVE" = false ]; then
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
    echo -e "${BLUE}${BOLD}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}${BOLD}│       Shipyard PaaS — Initial Setup Configuration           │${NC}"
    echo -e "${BLUE}${BOLD}└─────────────────────────────────────────────────────────────┘${NC}"
    echo ""

    # Prompt for Admin Email if not passed via flags
    if [ "$EMAIL_EXPLICIT" = false ]; then
        DEFAULT_EMAIL="admin@shipyard.local"
        printf "  %bAdmin Email%b [%s]: " "${BOLD}" "${NC}" "${DEFAULT_EMAIL}" > "$TTY_DEV"
        read -r INPUT_EMAIL < "$TTY_DEV" || true
        if [ -n "$INPUT_EMAIL" ]; then
            ADMIN_EMAIL="$INPUT_EMAIL"
        else
            ADMIN_EMAIL="$DEFAULT_EMAIL"
        fi
        echo -e "  Using admin email: ${GREEN}${ADMIN_EMAIL}${NC}"
        echo ""
    fi

    # Prompt for Admin Password if not passed via flags
    if [ "$PASSWORD_EXPLICIT" = false ]; then
        while true; do
            printf "  %bAdmin Password%b (leave empty to auto-generate secure password): " "${BOLD}" "${NC}" > "$TTY_DEV"
            INPUT_PASS=""
            stty -echo < "$TTY_DEV" 2>/dev/null || true
            read -r INPUT_PASS < "$TTY_DEV" || true
            stty echo < "$TTY_DEV" 2>/dev/null || true
            echo "" > "$TTY_DEV"

            if [ -z "$INPUT_PASS" ]; then
                ADMIN_PASSWORD=$(openssl rand -base64 18 2>/dev/null | tr -dc 'A-Za-z0-9!@#$%^&*' | head -c 20 || \
                                tr -dc 'A-Za-z0-9' </dev/urandom 2>/dev/null | head -c 20)
                echo -e "  ${YELLOW}✓ Auto-generating cryptographically secure administrator password.${NC}"
                break
            fi

            if [ ${#INPUT_PASS} -lt 8 ]; then
                echo -e "  ${RED}⚠ Password must be at least 8 characters long. Please try again.${NC}"
                continue
            fi

            printf "  %bConfirm Admin Password%b: " "${BOLD}" "${NC}" > "$TTY_DEV"
            CONFIRM_PASS=""
            stty -echo < "$TTY_DEV" 2>/dev/null || true
            read -r CONFIRM_PASS < "$TTY_DEV" || true
            stty echo < "$TTY_DEV" 2>/dev/null || true
            echo "" > "$TTY_DEV"

            if [ "$INPUT_PASS" != "$CONFIRM_PASS" ]; then
                echo -e "  ${RED}⚠ Passwords do not match. Please try again.${NC}"
                continue
            fi

            ADMIN_PASSWORD="$INPUT_PASS"
            echo -e "  ${GREEN}✓ Admin password confirmed.${NC}"
            break
        done
        echo ""
    fi
else
    # Non-interactive fallback
    if [ -z "$ADMIN_EMAIL" ]; then
        ADMIN_EMAIL="admin@shipyard.local"
    fi
    if [ -z "$ADMIN_PASSWORD" ]; then
        ADMIN_PASSWORD=$(openssl rand -base64 18 2>/dev/null | tr -dc 'A-Za-z0-9!@#$%^&*' | head -c 20 || \
                        tr -dc 'A-Za-z0-9' </dev/urandom 2>/dev/null | head -c 20)
    fi
fi

# Generate a unique Postgres password (stored in .env and secrets file)
POSTGRES_PASSWORD=$(openssl rand -hex 24 2>/dev/null || tr -dc 'a-f0-9' </dev/urandom | head -c 48)

# ── Summary Banner ────────────────────────────────────────────────────────────
echo -e "${BLUE}${BOLD}======================================================${NC}"
echo -e "  Installing Shipyard PaaS on this VPS..."
echo -e "  Admin Email:  ${GREEN}${ADMIN_EMAIL}${NC}"
echo -e "  Port:         ${GREEN}${SHIPYARD_PORT}${NC}"
echo -e "  Data Dir:     ${GREEN}${SHIPYARD_DATA_DIR}${NC}"
echo -e "${BLUE}${BOLD}======================================================${NC}"
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
echo -e "${BLUE}[2/6] Checking Docker & Container Runtime...${NC}"

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
    git pull --ff-only origin main 2>/dev/null || (git fetch --all && git reset --hard origin/main)
else
    $SUDO mkdir -p "${INSTALL_SOURCE}"
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

# Ensure non-root write access for application container
$SUDO chmod -R 777 "${SHIPYARD_DATA_DIR}/data" 2>/dev/null || true

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

# ── Step 5: Write .env & Secrets File ─────────────────────────────────────────
echo -e "${BLUE}[5/6] Writing production environment configuration...${NC}"

ENV_FILE="${INSTALL_SOURCE}/.env"
cat > "$ENV_FILE" << ENVEOF
# Shipyard PaaS — Auto-Generated by install.sh on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
NODE_ENV=production
SHIPYARD_MODE=appliance
SHIPYARD_DATA_DIR=${SHIPYARD_DATA_DIR}/data
SHIPYARD_PORT=${SHIPYARD_PORT}
SHIPYARD_ADMIN_EMAIL=${ADMIN_EMAIL}
SHIPYARD_ADMIN_PASSWORD=${ADMIN_PASSWORD}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://shipyard:${POSTGRES_PASSWORD}@shipyard-db:5432/shipyard
REDIS_URL=redis://shipyard-redis:6379
ENVEOF
echo -e "  ✓ .env file written."

# Save admin credentials to secrets file (readable by root only)
SECRETS_FILE="${SHIPYARD_DATA_DIR}/data/secrets/shipyard.secret.json"
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

echo -e "${GREEN}✓ Environment configured.${NC}"

# ── Step 6: Build and Start Docker Compose Stack ──────────────────────────────
echo -e "${BLUE}[6/6] Building and launching Shipyard services...${NC}"
echo -e "  Starting Docker stack (PostgreSQL, Redis, Caddy, Shipyard Control Plane)..."
echo ""

cd "${INSTALL_SOURCE}"

# Build the Docker image from source
if $SUDO docker image inspect shipyard-app:latest &>/dev/null 2>&1; then
    echo -e "  Existing image found — rebuilding with layer cache..."
    $SUDO docker compose --env-file .env build shipyard-app
else
    echo -e "  Building production image (this may take 2-4 minutes)..."
    $SUDO docker compose --env-file .env build shipyard-app
fi

# Start all services (detached)
$SUDO docker compose --env-file .env up -d

# Wait for the app to respond on /api/health
echo -e "${BLUE}  Waiting for Shipyard control plane to become healthy (up to 90s)...${NC}"
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
echo -e "${GREEN}${BOLD}=============================================================${NC}"
echo -e "${GREEN}${BOLD}  ⚓ SHIPYARD PAAS IS LIVE AND OPERATIONAL!${NC}"
echo -e "${GREEN}${BOLD}=============================================================${NC}"
echo ""
echo -e "  Dashboard URL:  ${CYAN}${BOLD}http://${IP}:${SHIPYARD_PORT}${NC}"
echo -e "  Local URL:      ${CYAN}http://localhost:${SHIPYARD_PORT}${NC}"
echo ""
echo -e "  ${BOLD}Administrator Credentials:${NC}"
echo -e "  Email:          ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e "  Password:       ${YELLOW}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "  ${BOLD}Credentials secured at:${NC}"
echo -e "  ${BLUE}${SECRETS_FILE}${NC} (mode 0600)"
echo ""
echo -e "${GREEN}${BOLD}Next Steps:${NC}"
echo -e "  1. Open ${CYAN}http://${IP}:${SHIPYARD_PORT}${NC} in your web browser"
echo -e "  2. Sign in with the administrator credentials above"
echo -e "  3. Connect a custom domain for zero-configuration Let's Encrypt SSL"
echo -e "  4. Deploy your first Git repository or drag-and-drop static files"
echo ""
echo -e "${BLUE}Useful Management Commands:${NC}"
echo -e "  View logs:      ${YELLOW}cd ${INSTALL_SOURCE} && docker compose logs -f shipyard-app${NC}"
echo -e "  Restart stack:  ${YELLOW}cd ${INSTALL_SOURCE} && docker compose restart${NC}"
echo -e "  Stop stack:     ${YELLOW}cd ${INSTALL_SOURCE} && docker compose down${NC}"
echo -e "  Reset password: ${YELLOW}cd ${INSTALL_SOURCE} && node scripts/init-appliance.js --reset-password ${ADMIN_EMAIL} <new-password>${NC}"
echo -e "  Update app:     ${YELLOW}cd ${INSTALL_SOURCE} && git pull && docker compose up -d --build${NC}"
echo ""
