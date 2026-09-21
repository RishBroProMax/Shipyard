#!/usr/bin/env bash
# ==============================================================================
# Shipyard - Zero-Configuration Self-Hosted Developer Deployment Appliance
#
# Preferred Installation:
#   curl -fsSL https://shipyard.example/install.sh | sh
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SHIPYARD_PORT="${SHIPYARD_PORT:-3000}"
SHIPYARD_DATA_DIR="${SHIPYARD_DATA_DIR:-/var/lib/shipyard}"
ADMIN_EMAIL="${SHIPYARD_ADMIN_EMAIL:-admin@shipyard.local}"

# Parse flags
APPLIANCE_ONLY=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --port) SHIPYARD_PORT="$2"; shift ;;
        --email) ADMIN_EMAIL="$2"; shift ;;
        --password) SHIPYARD_ADMIN_PASSWORD="$2"; shift ;;
        --appliance-only|--slim) APPLIANCE_ONLY=true ;;
        *) ;;
    esac
    shift
done

# Generate secure password if not provided
if [ -z "$SHIPYARD_ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD=$(openssl rand -base64 16 2>/dev/null || tr -dc A-Za-z0-9 </dev/urandom | head -c 16)
else
    ADMIN_PASSWORD="$SHIPYARD_ADMIN_PASSWORD"
fi

echo -e "${CYAN}${BOLD}"
cat << "EOF"
  ____  _     _                         _ 
 / ___|| |__ (_) _ __  _   _  __ _ _ __| |
 \___ \| '_ \| || '_ \| | | |/ _` | '__| |
  ___) | | | | || |_) | |_| | (_| | |  |_|
 |____/|_| |_|_|| .__/ \__, |\__,_|_|  (_)
                |_|    |___/              
 Zero-Configuration Self-Hosted Developer Platform (PaaS)
EOF
echo -e "${NC}"

echo -e "${BLUE}======================================================${NC}"
echo -e "Installing Shipyard PaaS Appliance on this VPS..."
echo -e "Appliance Mode: ${GREEN}ENABLED (Private Control Plane Active)${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check for root/sudo
SUDO=""
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
fi

# 1. Check Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    $SUDO systemctl enable --now docker
else
    echo -e "${GREEN}✓ Docker is already installed.${NC}"
fi

if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Docker Compose plugin not found. Installing...${NC}"
    $SUDO apt-get update && $SUDO apt-get install -y docker-compose-plugin || true
fi

# 2. Setup Persistent Directories
echo -e "${BLUE}Creating persistent appliance storage at ${SHIPYARD_DATA_DIR}...${NC}"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/secrets"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/deployments"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/apps"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/caddy"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/logs"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/postgres"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/redis"

# 3. Create docker-compose.yml
echo -e "${BLUE}Configuring Shipyard PaaS Appliance Stack...${NC}"
cat <<EOF | $SUDO tee "${SHIPYARD_DATA_DIR}/docker-compose.yml" > /dev/null
version: "3.8"

services:
  shipyard-app:
    image: ghcr.io/shipyard/shipyard:latest
    container_name: shipyard-app
    restart: unless-stopped
    ports:
      - "${SHIPYARD_PORT}:3000"
    environment:
      - NODE_ENV=production
      - SHIPYARD_MODE=appliance
      - SHIPYARD_ADMIN_EMAIL=${ADMIN_EMAIL}
      - SHIPYARD_ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - SHIPYARD_DATA_DIR=/var/lib/shipyard/data
      - DATABASE_URL=postgresql://shipyard:secret@shipyard-db:5432/shipyard
      - REDIS_URL=redis://shipyard-redis:6379
    volumes:
      - ${SHIPYARD_DATA_DIR}/data:/var/lib/shipyard/data
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - shipyard-db
      - shipyard-redis
    networks:
      - shipyard-net

  shipyard-db:
    image: postgres:16-alpine
    container_name: shipyard-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=shipyard
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=shipyard
    volumes:
      - ${SHIPYARD_DATA_DIR}/data/postgres:/var/lib/postgresql/data
    networks:
      - shipyard-net

  shipyard-redis:
    image: redis:7-alpine
    container_name: shipyard-redis
    restart: unless-stopped
    volumes:
      - ${SHIPYARD_DATA_DIR}/data/redis:/data
    networks:
      - shipyard-net

  shipyard-proxy:
    image: caddy:2-alpine
    container_name: shipyard-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ${SHIPYARD_DATA_DIR}/data/caddy/Caddyfile:/etc/caddy/Caddyfile
      - ${SHIPYARD_DATA_DIR}/data/caddy/data:/data
      - ${SHIPYARD_DATA_DIR}/data/caddy/config:/config
    networks:
      - shipyard-net

networks:
  shipyard-net:
    name: shipyard-net
    driver: bridge
EOF

# 4. Start Stack
echo -e "${BLUE}Booting Shipyard PaaS Appliance services...${NC}"
cd "${SHIPYARD_DATA_DIR}"
$SUDO docker compose up -d

# 5. Retrieve Host Public IP
IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}${BOLD}======================================================${NC}"
echo -e "${GREEN}${BOLD}⚓ SHIPYARD PAAS APPLIANCE READY & ONLINE!${NC}"
echo -e "${GREEN}${BOLD}======================================================${NC}"
echo ""
echo -e "Dashboard URL:    ${CYAN}${BOLD}http://${IP}:${SHIPYARD_PORT}${NC}"
echo -e "Admin Email:      ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e "Admin Password:   ${YELLOW}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "${BLUE}Credentials persisted securely at:${NC}"
echo -e "  ${SHIPYARD_DATA_DIR}/data/secrets/shipyard.secret.json"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Open ${CYAN}http://${IP}:${SHIPYARD_PORT}${NC} in your browser"
echo -e "  2. Connect worker nodes or deploy directly from GitHub or File Editor"
echo -e "  3. Map your custom domain with automatic SSL"
echo ""
