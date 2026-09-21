import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (req.nextUrl.protocol.replace(":", "") || "http");
  const leaderUrl = `${proto}://${host}`;

  const script = `#!/usr/bin/env bash
# ==============================================================================
# Shipyard Remote Worker Node Installer
# Leader: ${leaderUrl}
# ==============================================================================

set -e

RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

LEADER_URL="${leaderUrl}"
AGENT_TOKEN=""
NODE_NAME="\$(hostname)"

# Parse CLI arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --token) AGENT_TOKEN="$2"; shift ;;
        --name) NODE_NAME="$2"; shift ;;
        --leader) LEADER_URL="$2"; shift ;;
        *) echo -e "\${RED}Unknown parameter: $1\${NC}"; exit 1 ;;
    esac
    shift
done

if [ -z "$AGENT_TOKEN" ]; then
    echo -e "\${RED}Error: --token is required.\${NC}"
    echo "Usage: curl -fsSL ${leaderUrl}/agent_install | bash -s -- --token <SECRET_KEY> [--name <NODE_NAME>]"
    exit 1
fi

echo -e "\${BLUE}======================================================\${NC}"
echo -e "\${BLUE}       SHIPYARD WORKER NODE AGENT INSTALLER          \${NC}"
echo -e "\${BLUE}======================================================\${NC}"
echo -e "Leader URL:   \${GREEN}\${LEADER_URL}\${NC}"
echo -e "Node Token:   \${GREEN}\${AGENT_TOKEN:0:8}...\${NC}"
echo -e "Node Name:    \${GREEN}\${NODE_NAME}\${NC}"
echo -e "Platform:     \$(uname -s) \$(uname -m)"
echo -e "------------------------------------------------------"

SUDO=""
if [ "\$EUID" -ne 0 ]; then
    SUDO="sudo"
fi

# 1. Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "\${YELLOW}Docker not found. Installing Docker...\${NC}"
    curl -fsSL https://get.docker.com | sh
    $SUDO systemctl enable --now docker
else
    echo -e "\${GREEN}✓ Docker is installed.\${NC}"
fi

# 2. Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "\${YELLOW}Node.js not found. Installing Node.js 20...\${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
    $SUDO apt-get install -y nodejs || $SUDO yum install -y nodejs
else
    echo -e "\${GREEN}✓ Node.js \$(node -v) is installed.\${NC}"
fi

# 3. Setup Agent Directory & Script
INSTALL_DIR="/opt/shipyard-agent"
$SUDO mkdir -p "$INSTALL_DIR"
$SUDO mkdir -p "/var/lib/shipyard-agent"

echo -e "\${BLUE}Downloading agent script from leader...\${NC}"
$SUDO curl -fsSL "\${LEADER_URL}/api/agent/script" -o "\${INSTALL_DIR}/shipyard-agent.js"
$SUDO chmod +x "\${INSTALL_DIR}/shipyard-agent.js"

# 4. Configure Systemd Service
echo -e "\${BLUE}Configuring systemd service 'shipyard-agent'...\${NC}"
cat <<EOF | $SUDO tee /etc/systemd/system/shipyard-agent.service > /dev/null
[Unit]
Description=Shipyard Deployment Agent
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=\${INSTALL_DIR}
ExecStart=\$(which node) \${INSTALL_DIR}/shipyard-agent.js --leader \${LEADER_URL} --token \${AGENT_TOKEN} --name "\${NODE_NAME}"
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 5. Enable and Start Service
$SUDO systemctl daemon-reload
$SUDO systemctl enable shipyard-agent
$SUDO systemctl restart shipyard-agent

echo -e "\${GREEN}======================================================\${NC}"
echo -e "\${GREEN}✓ Node '\${NODE_NAME}' successfully connected to leader!\${NC}"
echo -e "\${GREEN}✓ Real-time CPU, RAM, & Network telemetry is active.   \${NC}"
echo -e "\${GREEN}======================================================\${NC}"
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript",
      "Cache-Control": "no-cache",
    },
  });
}
