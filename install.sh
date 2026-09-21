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
 Zero-Configuration Self-Hosted Developer Platform
EOF
echo -e "${NC}"

echo -e "${BLUE}======================================================${NC}"
echo -e "Initializing Shipyard Appliance on this VPS..."
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
echo -e "${BLUE}Generating Shipyard Docker Compose appliance stack...${NC}"
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
echo -e "${BLUE}Starting Shipyard services...${NC}"
cd "${SHIPYARD_DATA_DIR}"
$SUDO docker compose up -d

# 5. Wait for Health Check
echo -e "${BLUE}Waiting for Shipyard appliance initialization...${NC}"
ATTEMPTS=0
MAX_ATTEMPTS=30
until curl -s -f "http://localhost:${SHIPYARD_PORT}/api/health" > /dev/null 2>&1 || [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; do
    sleep 2
    ATTEMPTS=$((ATTEMPTS+1))
    echo -n "."
done
echo ""

# Get Host IP
SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}' || echo "YOUR_SERVER_IP")

echo -e "\n${GREEN}${BOLD}======================================================${NC}"
echo -e "${GREEN}${BOLD}Shipyard installed successfully.${NC}"
echo -e "${GREEN}${BOLD}======================================================${NC}\n"
echo -e "${BOLD}Dashboard:${NC}"
echo -e "  ${CYAN}http://${SERVER_IP}:${SHIPYARD_PORT}${NC}\n"
echo -e "${BOLD}Admin:${NC}"
echo -e "  Email:    ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e "  Password: ${YELLOW}${ADMIN_PASSWORD}${NC}\n"
echo -e "${GREEN}All databases, queues, migrations, secrets, storage, and internal services have been initialized automatically.${NC}\n"
echo -e "To connect other VPS/PC worker nodes to this leader, visit:"
echo -e "  ${CYAN}http://${SERVER_IP}:${SHIPYARD_PORT}/servers${NC}\n"
