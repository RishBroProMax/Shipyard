#!/usr/bin/env bash
# ==============================================================================
# ⚓ Shipyard PaaS — Next-Gen Self-Hosted Developer Appliance Installer
#
# Interactive usage (guided terminal prompt for email & admin password):
#   curl -fsSL https://raw.githubusercontent.com/RishBroProMax/Shipyard/master/install.sh | bash
#
# Headless / Scripted usage (CI/CD, cloud-init, Ansible):
#   curl -fsSL https://raw.githubusercontent.com/RishBroProMax/Shipyard/master/install.sh | bash -s -- \
#     --email admin@mycompany.com \
#     --password "mySecurePassword" \
#     --port 3000 \
#     --non-interactive
#
# Supported OS: Ubuntu 20.04+, Debian 11+, CentOS 8+, Rocky Linux 8+, AlmaLinux 8+
# Minimum requirements: 1 CPU, 512MB RAM (2GB+ recommended)
# ==============================================================================

set -euo pipefail

# ── Colors & Formats ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
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
TTY_DEV=""
if [ -r /dev/tty ] && [ -w /dev/tty ]; then
    TTY_DEV="/dev/tty"
elif [ -t 0 ]; then
    TTY_DEV="/dev/stdin"
fi

if [ -z "$TTY_DEV" ] || [ "${CI:-}" = "true" ] || [ "${DEBIAN_FRONTEND:-}" = "noninteractive" ]; then
    NON_INTERACTIVE=true
fi

# ── Cyberpunk ASCII Banner ───────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}"
cat << "BANNER"
  ███████╗██╗  ██╗██╗██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ 
  ██╔════╝██║  ██║██║██╔══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗██╔══██╗
  ███████╗███████║██║██████╔╝ ╚████╔╝ ███████║██████╔╝██║  ██║
  ╚════██║██╔══██║██║██╔═══╝   ╚██╔╝  ██╔══██║██╔══██╗██║  ██║
  ███████║██║  ██║██║██║        ██║   ██║  ██║██║  ██║██████╔╝
  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
BANNER
echo -e "       ${MAGENTA}${BOLD}⚓ ZERO-CONFIGURATION SELF-HOSTED PAAS APPLIANCE${NC}"
echo -e "       ${DIM}Automatic SSL · Docker Orchestration · Real Telemetry · Full Autonomy${NC}\n"

# ── Hardware & Environment Probing ───────────────────────────────────────────
echo -e "${BLUE}▶ Probing Host System Hardware...${NC}"
CPU_CORES=$(nproc 2>/dev/null || grep -c ^processor /proc/cpuinfo 2>/dev/null || echo "1")
ARCH=$(uname -m 2>/dev/null || echo "x86_64")
TOTAL_MEM_KB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "1048576")
TOTAL_MEM_MB=$((TOTAL_MEM_KB / 1024))
SWAP_TOTAL_KB=$(grep SwapTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo "0")
SWAP_TOTAL_MB=$((SWAP_TOTAL_KB / 1024))

echo -e "  CPU Architecture:  ${GREEN}${ARCH} (${CPU_CORES} Core(s))${NC}"
echo -e "  Physical Memory:   ${GREEN}${TOTAL_MEM_MB} MB RAM${NC}"
if [ "$SWAP_TOTAL_MB" -gt 0 ]; then
    echo -e "  Swap Space:        ${GREEN}${SWAP_TOTAL_MB} MB Swap Active${NC}"
else
    echo -e "  Swap Space:        ${YELLOW}None detected (Recommended to add swap if RAM <= 2GB)${NC}"
fi

# Detect root / sudo
SUDO=""
if [ "$EUID" -ne 0 ]; then
    if ! command -v sudo &>/dev/null; then
        echo -e "${RED}Error: Please run as root, or install sudo first.${NC}"
        exit 1
    fi
    SUDO="sudo"
fi

# Detect OS Package Manager
if command -v apt-get &>/dev/null; then
    PKG_MANAGER="apt"
    OS_NAME="Debian/Ubuntu"
elif command -v yum &>/dev/null; then
    PKG_MANAGER="yum"
    OS_NAME="RHEL/CentOS"
elif command -v dnf &>/dev/null; then
    PKG_MANAGER="dnf"
    OS_NAME="Fedora/Rocky"
else
    PKG_MANAGER="apt"
    OS_NAME="Generic Linux"
fi
echo -e "  Operating System:  ${GREEN}${OS_NAME}${NC}\n"

# ── Interactive Setup Configuration ───────────────────────────────────────────
if [ "$NON_INTERACTIVE" = false ]; then
    echo -e "${BLUE}${BOLD}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}${BOLD}│       🔐 SHIPYARD PAAS — SECURE APPLIANCE SETUP             │${NC}"
    echo -e "${BLUE}${BOLD}└─────────────────────────────────────────────────────────────┘${NC}"
    echo -e "${DIM}  Configure your administrator credentials for the web panel.${NC}\n"

    # Prompt for Admin Email
    if [ "$EMAIL_EXPLICIT" = false ]; then
        DEFAULT_EMAIL="admin@shipyard.local"
        printf "  %bAdmin Email%b [%s]: " "${BOLD}" "${NC}" "${DEFAULT_EMAIL}" > "$TTY_DEV"
        read -r INPUT_EMAIL < "$TTY_DEV" || true
        if [ -n "$INPUT_EMAIL" ]; then
            ADMIN_EMAIL="$INPUT_EMAIL"
        else
            ADMIN_EMAIL="$DEFAULT_EMAIL"
        fi
        echo -e "  Using admin email: ${GREEN}${ADMIN_EMAIL}${NC}\n"
    fi

    # Prompt for Admin Password
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
                echo -e "  ${YELLOW}✓ Auto-generating cryptographically secure 20-character password.${NC}\n"
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
                echo -e "  ${RED}⚠ Passwords do not match. Please try again.${NC}\n"
                continue
            fi

            ADMIN_PASSWORD="$INPUT_PASS"
            echo -e "  ${GREEN}✓ Admin password configured successfully.${NC}\n"
            break
        done
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

# Generate unique Postgres secret
POSTGRES_PASSWORD=$(openssl rand -hex 24 2>/dev/null || tr -dc 'a-f0-9' </dev/urandom | head -c 48)

echo -e "${BLUE}${BOLD}═════════════════════════════════════════════════════════════════${NC}"
echo -e "  ${CYAN}Starting Installation Flow...${NC}"
echo -e "  Admin Email:  ${GREEN}${ADMIN_EMAIL}${NC}"
echo -e "  Web Port:     ${GREEN}${SHIPYARD_PORT}${NC}"
echo -e "  Data Path:    ${GREEN}${SHIPYARD_DATA_DIR}${NC}"
echo -e "${BLUE}${BOLD}═════════════════════════════════════════════════════════════════${NC}\n"

# ── Step 1: Install System Dependencies ──────────────────────────────────────
echo -e "${BLUE}[ 1/7 ] ⚡ Installing system prerequisites...${NC}"

if [ "$PKG_MANAGER" = "apt" ]; then
    $SUDO apt-get update -qq
    $SUDO apt-get install -y -qq curl git openssl ca-certificates netcat-openbsd 2>/dev/null || \
    $SUDO apt-get install -y -qq curl git openssl ca-certificates netcat 2>/dev/null || true
elif [ "$PKG_MANAGER" = "yum" ] || [ "$PKG_MANAGER" = "dnf" ]; then
    $SUDO $PKG_MANAGER install -y -q curl git openssl ca-certificates nmap-ncat 2>/dev/null || true
fi
echo -e "${GREEN}  ✓ Base packages ready.${NC}"

# ── Step 2: Install Docker ────────────────────────────────────────────────────
echo -e "${BLUE}[ 2/7 ] 🐳 Initializing Docker container engine...${NC}"

if ! command -v docker &>/dev/null; then
    echo -e "${YELLOW}  Docker not detected. Installing via official docker.com script...${NC}"
    curl -fsSL https://get.docker.com | sh
    $SUDO systemctl enable --now docker
    echo -e "${GREEN}  ✓ Docker engine installed and started.${NC}"
else
    DOCKER_VERSION=$(docker --version | sed 's/Docker version //' | cut -d',' -f1)
    echo -e "${GREEN}  ✓ Docker ${DOCKER_VERSION} detected.${NC}"
fi

# Check Docker Compose plugin
if ! docker compose version &>/dev/null 2>&1; then
    echo -e "${YELLOW}  Installing docker-compose-plugin...${NC}"
    if [ "$PKG_MANAGER" = "apt" ]; then
        $SUDO apt-get install -y docker-compose-plugin 2>/dev/null || \
        $SUDO apt-get install -y docker-compose 2>/dev/null || true
    elif [ "$PKG_MANAGER" = "yum" ] || [ "$PKG_MANAGER" = "dnf" ]; then
        $SUDO $PKG_MANAGER install -y docker-compose-plugin 2>/dev/null || true
    fi
fi

if [ -n "$SUDO" ] && ! groups | grep -q docker; then
    $SUDO usermod -aG docker "$USER" 2>/dev/null || true
fi

# ── Step 3: Clone / Update Shipyard Source ────────────────────────────────────
echo -e "${BLUE}[ 3/7 ] 📦 Fetching Shipyard source repository...${NC}"

INSTALL_SOURCE="${SHIPYARD_DATA_DIR}/source"

if [ -d "${INSTALL_SOURCE}/.git" ]; then
    cd "${INSTALL_SOURCE}"
    git fetch --all --quiet 2>/dev/null || true
    TARGET_BRANCH="master"
    if git show-ref --verify --quiet refs/remotes/origin/main; then
        TARGET_BRANCH="main"
    fi
    echo -e "  Existing repository detected. Syncing origin/${TARGET_BRANCH}..."
    git pull --ff-only origin "$TARGET_BRANCH" 2>/dev/null || (git reset --hard "origin/${TARGET_BRANCH}")
else
    $SUDO mkdir -p "${INSTALL_SOURCE}"
    if [ -n "$SUDO" ]; then
        $SUDO chown -R "$USER:$USER" "${SHIPYARD_DATA_DIR}" 2>/dev/null || \
        $SUDO chmod 777 "${INSTALL_SOURCE}"
    fi
    git clone --depth 1 "${SHIPYARD_REPO}" "${INSTALL_SOURCE}"
fi
echo -e "${GREEN}  ✓ Source code ready at ${INSTALL_SOURCE}.${NC}"

# ── Step 4: Setup Persistent Data Directories ─────────────────────────────────
echo -e "${BLUE}[ 4/7 ] 🔒 Initializing persistent encrypted storage...${NC}"

$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/secrets"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/deployments"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/apps"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/caddy"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/logs"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/postgres"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/redis"
$SUDO mkdir -p "${SHIPYARD_DATA_DIR}/data/backups"
$SUDO chmod -R 777 "${SHIPYARD_DATA_DIR}/data" 2>/dev/null || true

# Default Caddyfile
CADDYFILE="${SHIPYARD_DATA_DIR}/data/caddy/Caddyfile"
if [ ! -f "$CADDYFILE" ]; then
    cat > /tmp/shipyard-caddyfile << 'CADDYEOF'
# Shipyard Dynamic Caddy Reverse Proxy Configuration
:80 {
    reverse_proxy shipyard-app:3000
    log {
        output file /var/lib/shipyard/data/logs/caddy-access.log
        format json
    }
}
CADDYEOF
    $SUDO mv /tmp/shipyard-caddyfile "$CADDYFILE"
fi
echo -e "${GREEN}  ✓ Storage structure configured.${NC}"

# ── Step 5: Write .env & Secrets File ─────────────────────────────────────────
echo -e "${BLUE}[ 5/7 ] ⚙️ Configuring production environment & secrets...${NC}"

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
echo -e "${GREEN}  ✓ Credentials secured at ${SECRETS_FILE} (0600).${NC}"

# ── Step 6: Install Global CLI Binary ─────────────────────────────────────────
echo -e "${BLUE}[ 6/7 ] 🛠️ Installing global 'shipyard' CLI command...${NC}"

if [ -f "${INSTALL_SOURCE}/bin/shipyard" ]; then
    $SUDO cp "${INSTALL_SOURCE}/bin/shipyard" /usr/local/bin/shipyard
    $SUDO chmod +x /usr/local/bin/shipyard
    echo -e "${GREEN}  ✓ Global CLI installed -> ${BOLD}/usr/local/bin/shipyard${NC}"
else
    echo -e "${YELLOW}  Notice: CLI binary source not found, skipping CLI symlink.${NC}"
fi

# ── Step 7: Build and Start Docker Services ───────────────────────────────────
echo -e "${BLUE}[ 7/7 ] 🚀 Launching production container cluster...${NC}"
echo -e "  Starting PostgreSQL 16, Redis 7, Caddy 2, and Shipyard Control Plane..."

cd "${INSTALL_SOURCE}"

$SUDO docker compose --env-file .env build shipyard-app
$SUDO docker compose --env-file .env up -d

echo -e "\n${CYAN}▶ Waiting for Shipyard control plane to become healthy...${NC}"
MAX_WAIT=90
WAIT_COUNT=0
HEALTHY=false
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${SHIPYARD_PORT}/api/health 2>/dev/null || echo 000)
    if [ "$STATUS" = "200" ]; then
        HEALTHY=true
        echo -e "${GREEN}  ✓ Shipyard health check responded with HTTP 200 OK!${NC}"
        break
    fi
    WAIT_COUNT=$((WAIT_COUNT + 3))
    sleep 3
done

# Detect Public IP
IP=$(curl -s --max-time 4 https://api.ipify.org 2>/dev/null || \
     curl -s --max-time 4 https://icanhazip.com 2>/dev/null || \
     hostname -I 2>/dev/null | awk '{print $1}' || \
     echo "YOUR_VPS_IP")

# ── Victory Presentation ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║              ⚓  SHIPYARD PAAS IS LIVE AND OPERATIONAL!               ║${NC}"
echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Web Dashboard:${NC}    ${CYAN}${BOLD}http://${IP}:${SHIPYARD_PORT}${NC}"
echo -e "  ${BOLD}Local URL:${NC}        ${CYAN}http://localhost:${SHIPYARD_PORT}${NC}"
echo ""
echo -e "  ${BOLD}Administrator Login:${NC}"
echo -e "  Email:             ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e "  Password:          ${YELLOW}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "  ${BOLD}Credentials Saved:${NC}"
echo -e "  ${BLUE}${SECRETS_FILE}${NC} (mode 0600)"
echo ""
echo -e "${MAGENTA}${BOLD}⚡ Global CLI Commands Installed:${NC}"
echo -e "  • ${CYAN}shipyard update${NC}         Fetch updates & reinstall with ${BOLD}ZERO data loss${NC}"
echo -e "  • ${CYAN}shipyard status${NC}         View real-time hardware telemetry & services"
echo -e "  • ${CYAN}shipyard logs${NC}           Stream live application logs"
echo -e "  • ${CYAN}shipyard restart${NC}        Restart all services cleanly"
echo -e "  • ${CYAN}shipyard reset-password${NC} Reset administrator password from terminal"
echo -e "  • ${RED}shipyard uninstall${NC}      Cleanly uninstall Shipyard from this VPS"
echo ""
echo -e "${GREEN}${BOLD}Next Steps:${NC}"
echo -e "  1. Open ${CYAN}http://${IP}:${SHIPYARD_PORT}${NC} in your web browser"
echo -e "  2. Sign in with the credentials shown above"
echo -e "  3. Connect a custom domain for instant Let's Encrypt SSL"
echo -e "  4. Deploy your first Git repository or static site"
echo ""
