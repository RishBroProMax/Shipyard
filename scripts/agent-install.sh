#!/usr/bin/env bash
# ==============================================================================
# Shipyard Remote Node Agent Installer
# 
# Usage:
#   curl -fsSL https://<LEADER_HOST>/api/agent/install.sh | bash -s -- --leader <LEADER_URL> --token <TOKEN> [--name <NAME>]
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

LEADER_URL=""
AGENT_TOKEN=""
NODE_NAME="$(hostname)"

# Parse CLI arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --leader) LEADER_URL="$2"; shift ;;
        --token) AGENT_TOKEN="$2"; shift ;;
        --name) NODE_NAME="$2"; shift ;;
        *) echo -e "${RED}Unknown parameter: $1${NC}"; exit 1 ;;
    esac
    shift
done

if [ -z "$LEADER_URL" ] || [ -z "$AGENT_TOKEN" ]; then
    echo -e "${RED}Error: Both --leader and --token are required.${NC}"
    echo "Usage: curl -fsSL <URL>/api/agent/install.sh | bash -s -- --leader <LEADER_URL> --token <TOKEN> [--name <NODE_NAME>]"
    exit 1
fi

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}       SHIPYARD REMOTE NODE AGENT INSTALLER          ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "Leader URL:  ${GREEN}${LEADER_URL}${NC}"
echo -e "Node Name:   ${GREEN}${NODE_NAME}${NC}"
echo -e "Platform:    $(uname -s) $(uname -m)"
echo -e "------------------------------------------------------"

# Check root / sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}Notice: Not running as root. Using sudo for system setup.${NC}"
    SUDO="sudo"
else
    SUDO=""
fi

# 1. Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    $SUDO systemctl enable --now docker
else
    echo -e "${GREEN}✓ Docker is already installed.${NC}"
fi

# 2. Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Installing Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs || $SUDO yum install -y nodejs
else
    echo -e "${GREEN}✓ Node.js $(node -v) is already installed.${NC}"
fi

# 3. Setup Agent Directory
INSTALL_DIR="/opt/shipyard-agent"
$SUDO mkdir -p "$INSTALL_DIR"
$SUDO mkdir -p "/var/lib/shipyard-agent"

echo -e "${BLUE}Fetching agent script from leader...${NC}"
$SUDO curl -fsSL "${LEADER_URL}/api/agent/script" -o "${INSTALL_DIR}/shipyard-agent.js"
$SUDO chmod +x "${INSTALL_DIR}/shipyard-agent.js"

# 4. Create Systemd Service
echo -e "${BLUE}Configuring systemd service 'shipyard-agent'...${NC}"
cat <<EOF | $SUDO tee /etc/systemd/system/shipyard-agent.service > /dev/null
[Unit]
Description=Shipyard Deployment Agent
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=$(which node) ${INSTALL_DIR}/shipyard-agent.js --leader ${LEADER_URL} --token ${AGENT_TOKEN} --name "${NODE_NAME}"
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 5. Enable and Start Service
$SUDO systemctl daemon-reload
$SUDO systemctl enable shipyard-agent
$SUDO systemctl restart shipyard-agent

echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}✓ Shipyard Agent installed and started successfully!  ${NC}"
echo -e "${GREEN}✓ This machine is now an active worker node.          ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Check status anytime with:"
echo -e "  ${YELLOW}sudo systemctl status shipyard-agent${NC}"
echo -e "View live agent logs with:"
echo -e "  ${YELLOW}sudo journalctl -u shipyard-agent -f${NC}"
