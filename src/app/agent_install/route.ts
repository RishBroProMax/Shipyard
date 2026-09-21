import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ||
    req.nextUrl.protocol.replace(":", "") ||
    "http";
  const leaderUrl = `${proto}://${host}`;

  // Read the canonical agent-install.sh from the scripts directory.
  let scriptContent: string;
  const scriptPath = path.join(process.cwd(), "scripts", "agent-install.sh");

  try {
    scriptContent = fs.readFileSync(scriptPath, "utf8");
    // Inject the leader URL into the script
    scriptContent = scriptContent.replace(
      /LEADER_URL=""/,
      `LEADER_URL="\${LEADER_URL:-${leaderUrl}}"`
    );
  } catch {
    // Fallback: inline a minimal agent installer
    // IMPORTANT: all bash variables must be escaped (\$VAR) to avoid
    // JavaScript template literal substitution.
    scriptContent = `#!/usr/bin/env bash
# ==============================================================================
# Shipyard Remote Worker Node Agent Installer
# Leader: ${leaderUrl}
#
# Usage:
#   curl -fsSL ${leaderUrl}/agent_install | sh -s -- --token <SECRET_KEY> [--name <NODE_NAME>]
# ==============================================================================

set -euo pipefail

RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

LEADER_URL="${leaderUrl}"
AGENT_TOKEN=""
NODE_NAME="\$(hostname)"

while [[ "\$#" -gt 0 ]]; do
    case \$1 in
        --token)  AGENT_TOKEN="\$2";  shift ;;
        --name)   NODE_NAME="\$2";   shift ;;
        --leader) LEADER_URL="\$2";  shift ;;
        *) echo -e "\${RED}Unknown parameter: \$1\${NC}"; exit 1 ;;
    esac
    shift
done

if [ -z "\$AGENT_TOKEN" ]; then
    echo -e "\${RED}Error: --token is required.\${NC}"
    echo "Usage: curl -fsSL ${leaderUrl}/agent_install | sh -s -- --token <TOKEN> [--name <NAME>]"
    exit 1
fi

echo -e "\${BLUE}======================================================\${NC}"
echo -e "\${BLUE}       SHIPYARD WORKER NODE AGENT INSTALLER          \${NC}"
echo -e "\${BLUE}======================================================\${NC}"
echo -e "Leader URL: \${GREEN}\${LEADER_URL}\${NC}"
echo -e "Node Name:  \${GREEN}\${NODE_NAME}\${NC}"
echo -e "------------------------------------------------------"

SUDO=""
if [ "\$EUID" -ne 0 ]; then
    SUDO="sudo"
fi

# 1. Install Docker if missing
if ! command -v docker &>/dev/null; then
    echo -e "\${YELLOW}Installing Docker...\${NC}"
    curl -fsSL https://get.docker.com | sh
    \$SUDO systemctl enable --now docker
else
    echo -e "\${GREEN}✓ Docker \$(docker --version | cut -d' ' -f3 | tr -d ',') installed.\${NC}"
fi

# 2. Install Node.js 20 if missing
if ! command -v node &>/dev/null; then
    echo -e "\${YELLOW}Installing Node.js 20...\${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | \$SUDO -E bash - 2>/dev/null || true
    \$SUDO apt-get install -y nodejs 2>/dev/null || \
    \$SUDO yum install -y nodejs 2>/dev/null || \
    \$SUDO dnf install -y nodejs 2>/dev/null || true
else
    echo -e "\${GREEN}✓ Node.js \$(node -v) installed.\${NC}"
fi

# 3. Setup agent directory
INSTALL_DIR="/opt/shipyard-agent"
\$SUDO mkdir -p "\$INSTALL_DIR"
\$SUDO mkdir -p "/var/lib/shipyard-agent"

echo -e "\${BLUE}Downloading agent script from leader...\${NC}"
\$SUDO curl -fsSL "\${LEADER_URL}/api/agent/script" -o "\${INSTALL_DIR}/shipyard-agent.js"
\$SUDO chmod +x "\${INSTALL_DIR}/shipyard-agent.js"

# 4. Create systemd service
echo -e "\${BLUE}Configuring systemd service...\${NC}"
NODE_BIN="\$(which node)"
cat <<SERVICE_EOF | \$SUDO tee /etc/systemd/system/shipyard-agent.service >/dev/null
[Unit]
Description=Shipyard Deployment Agent
After=network-online.target docker.service
Wants=network-online.target
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=\${INSTALL_DIR}
ExecStart=\${NODE_BIN} \${INSTALL_DIR}/shipyard-agent.js --leader \${LEADER_URL} --token \${AGENT_TOKEN} --name "\${NODE_NAME}"
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# 5. Enable and start
\$SUDO systemctl daemon-reload
\$SUDO systemctl enable shipyard-agent
\$SUDO systemctl restart shipyard-agent

echo -e "\${GREEN}======================================================\${NC}"
echo -e "\${GREEN}✓ Worker node '\${NODE_NAME}' is now connected to leader!\${NC}"
echo -e "\${GREEN}✓ Real-time CPU, RAM, & Network telemetry is streaming.\${NC}"
echo -e "\${GREEN}======================================================\${NC}"
echo ""
echo -e "Check status:  \${YELLOW}sudo systemctl status shipyard-agent\${NC}"
echo -e "View logs:     \${YELLOW}sudo journalctl -u shipyard-agent -f\${NC}"
`;
  }

  return new NextResponse(scriptContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Disposition": "inline; filename=agent_install.sh",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
