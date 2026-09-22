# ⚓ Shipyard — Self-Hosted Developer Platform & PaaS Appliance

<p align="center">
  <strong>Transform any Linux VPS into your personal high-performance PaaS in 60 seconds.</strong>
  <br />
  A true self-hosted alternative to Vercel, Coolify, and Dokku.
  <br />
  Docker Container Orchestration · Real Hardware Telemetry · Dynamic Caddy Proxy & Auto-SSL · 0 Mock Data
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a>
  ·
  <a href="#-management-cli-commands">Management CLI</a>
  ·
  <a href="#-system-requirements">System Requirements</a>
  ·
  <a href="#-troubleshooting--error-runbooks">Error Runbooks</a>
</p>

---

## ✨ What is Shipyard?

Shipyard is a **pure, self-hosted PaaS appliance** built for developers who want the simplicity and developer experience of Vercel on their own Linux servers.

- 🚀 **One-Click Deployments:** Deploy from GitHub/Git repositories, use built-in starters (Next.js, FastAPI, Node Express, Static Sites), or upload code directly using the in-browser Web IDE.
- 🐳 **Pure Docker Orchestration:** Real container workloads running on Docker Engine with isolated networking, environment secret injection, and automatic port binding.
- 🔒 **Dynamic Reverse Proxy & Automated SSL:** Caddy 2 reverse proxy with hot-reloading routes and instant zero-config Let's Encrypt TLS certificates.
- 📊 **Real Telemetry (0 Mock Data):** Direct Linux `/proc` and Docker daemon telemetry for real-time CPU, RAM, Network I/O, and container status.
- 🔐 **Zero-Exposure Secrets Vault:** AES-256-GCM encrypted environment variables with restricted host permissions (`0600`).
- 🖥️ **Modern Control Plane:** Sleek dark-mode interface built with shadcn/ui components and smooth animations.

---

## 🚀 Quick Start

### 1. Interactive VPS Installation (Recommended)

Run this one-line command on any clean Ubuntu, Debian, or CentOS VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/RishBroProMax/Shipyard/master/install.sh | bash
```

> **Interactive Terminal Prompt:**  
> The installer detects your active TTY (`/dev/tty`) and interactively prompts for your **Admin Email** and **Admin Password** (with masked input and confirmation). If you leave the password blank, Shipyard generates a cryptographically secure 20-character password and saves it to `/var/lib/shipyard/data/secrets/shipyard.secret.json`.

---

### 2. Headless / Automated Provisioning (CI/CD & Cloud-Init)

For unattended provisioning with Ansible, Terraform, or cloud-init:

```bash
curl -fsSL https://raw.githubusercontent.com/RishBroProMax/Shipyard/master/install.sh | bash -s -- \
  --email admin@mycompany.com \
  --password "MyStrongSecretPass123" \
  --port 3000 \
  --non-interactive
```

---

## 🛠️ Management CLI Commands

Shipyard installs a global management tool at `/usr/local/bin/shipyard`:

| Command | Description |
|---------|-------------|
| `shipyard update` | Fetch latest release from GitHub and rebuild with **ZERO data loss** |
| `shipyard update --force` | Force rebuild container layers even if code is up-to-date |
| `shipyard status` | Show real-time cluster health, container status, and memory stats |
| `shipyard logs` | Stream live logs for `shipyard-app`, `shipyard-proxy`, `shipyard-db`, or `shipyard-redis` |
| `shipyard restart` | Safely restart all appliance services |
| `shipyard stop` | Stop all running Shipyard services |
| `shipyard start` | Start all Shipyard services |
| `shipyard reset-password` | Reset administrator email and password from the terminal |
| `shipyard version` | Display installed commit hash and version metadata |
| `shipyard uninstall` | Completely uninstall Shipyard (offers option to preserve or delete data) |

---

## ⚙️ System Requirements

| Hardware | Minimum | Recommended for Production |
|----------|---------|----------------------------|
| **CPU** | 1 vCPU (x86_64 or ARM64) | 2 – 4 vCPUs |
| **RAM** | 512 MB (with swap enabled) | 2 GB – 4 GB RAM |
| **OS** | Ubuntu 20.04+, Debian 11+, CentOS 8+ | Ubuntu 22.04 LTS or 24.04 LTS |
| **Storage** | 10 GB SSD | 40 GB+ NVMe SSD |

### ⚠️ Low-RAM VPS (1GB / 2GB) — Fix Exit 137 OOM

Heavy compilation steps (e.g. Next.js builds, Webpack, Rust/Go builds) can spike memory usage above 1.2GB. If your VPS has 1GB RAM without swap, the Linux kernel Out-Of-Memory Killer will terminate builds with `exit status 137`.

**Create a 2GB swap file in 15 seconds:**

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🌐 Network Ports & Firewall Rules

Ensure your host firewall (UFW) and cloud security group open these ports:

| Port | Protocol | Purpose | Visibility |
|------|----------|---------|------------|
| **80** | TCP | HTTP & ACME Let's Encrypt challenge verification | Public (Required) |
| **443** | TCP / UDP | HTTPS & HTTP/3 QUIC client traffic | Public (Required) |
| **3000** | TCP | Shipyard Web Dashboard (Control Plane) | Public / Private |
| **30000–39999** | TCP | Internal container workload ports | Routed internally via Caddy |

**Recommended UFW configuration:**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw allow 3000/tcp
sudo ufw enable
```

---

## 🌐 Custom Domains & Automated SSL

1. Create a DNS **A Record** pointing your domain (e.g., `api.mydomain.com`) to your VPS public IP.
2. In the Shipyard dashboard, add `api.mydomain.com` in your Project Settings.
3. Caddy 2 automatically issues and renews valid Let's Encrypt certificates within seconds.
4. **Cloudflare Users:** If using Cloudflare with the proxy (orange cloud) enabled, set SSL/TLS encryption mode to **Full (Strict)** to avoid redirect loops.

---

## 🚨 Troubleshooting & Error Runbooks

### 1. `bind: address already in use (80 / 443)`
- **Cause:** Apache or an existing Nginx server is running on the host and occupying port 80/443.
- **Fix:**
  ```bash
  sudo systemctl stop apache2 nginx 2>/dev/null || true
  sudo systemctl disable apache2 nginx 2>/dev/null || true
  cd /var/lib/shipyard/source && docker compose restart shipyard-proxy
  ```

### 2. `permission denied while trying to connect to the Docker daemon socket`
- **Fix:**
  ```bash
  sudo usermod -aG docker $USER
  sudo chmod 666 /var/run/docker.sock
  ```

### 3. `build failed with exit status 137 (OOM Killer)`
- **Cause:** Host ran out of RAM during build compilation.
- **Fix:** Add a swap file using the 2GB swap recipe shown above.

### 4. `PostgreSQL connection refused`
- **Fix:**
  ```bash
  cd /var/lib/shipyard/source
  docker compose logs shipyard-db
  docker compose restart shipyard-db
  ```

---

## 📦 Disaster Recovery & Backups

All persistent data, secrets, databases, and deployment repositories are stored in:
```bash
/var/lib/shipyard/data
```

**To create a full backup archive:**
```bash
sudo tar -czvf /root/shipyard-backup-$(date +%F).tar.gz /var/lib/shipyard/data
```

**To restore on a fresh server:**
```bash
sudo mkdir -p /var/lib/shipyard
sudo tar -xzvf /root/shipyard-backup-*.tar.gz -C /
curl -fsSL https://raw.githubusercontent.com/RishBroProMax/Shipyard/master/install.sh | bash
```

---

## 🏗️ Architecture Stack

- **Control Plane:** Next.js 14 App Router + Tailwind CSS + shadcn/ui
- **Container Runtime:** Docker Engine & Docker Compose
- **Dynamic Reverse Proxy:** Caddy 2 (Automatic TLS, HTTP/3, Zero-Downtime Reload)
- **Database Engine:** PostgreSQL 16 + Shipyard Resilient State Engine
- **Task Queue:** Redis 7 (In-Memory Queue)
- **Kernel Telemetry:** Direct `/proc` and Docker socket inspection

---

## 📝 License

MIT © [RishBroProMax](https://github.com/RishBroProMax)
