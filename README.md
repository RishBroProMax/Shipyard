# ⚓ Shipyard — Self-Hosted Developer Platform & PaaS Appliance

<p align="center">
  <strong>Transform any fresh Linux VPS into your personal deployment platform in 60 seconds.</strong>
  <br />
  Zero configuration · Automatic SSL · Real hardware telemetry · One-command interactive install
</p>

<p align="center">
  <a href="https://shipyard-paas.vercel.app">Live Demo</a>
  ·
  <a href="https://shipyard-paas.vercel.app/docs">Documentation</a>
  ·
  <a href="#-quick-start">Quick Start</a>
  ·
  <a href="#-troubleshooting--self-host-error-runbooks">Error Runbooks</a>
</p>

---

## ✨ What is Shipyard?

Shipyard is a **zero-configuration self-hosted PaaS appliance** that runs on any fresh Linux VPS. It operates as a dual-mode system from a single repository:

| Mode | Where | What it does |
|------|-------|-------------|
| **Cloud (Vercel)** | `VERCEL=1` | Serves the public landing page, interactive docs, and installer bootstrap endpoints |
| **Appliance (VPS)** | `SHIPYARD_MODE=appliance` | Full PaaS control plane: Docker orchestration, Git deployments, In-browser IDE, Caddy reverse proxy, auto-SSL, real telemetry |

---

## 🚀 Quick Start

### 1. Interactive VPS Installation (Recommended)

Run this single command on any fresh Ubuntu/Debian/CentOS VPS:

```bash
curl -fsSL https://shipyard.example/install.sh | bash
```

> **Interactive Terminal Prompt:**  
> The installer opens `/dev/tty` and interactively prompts for your **Admin Email** and **Admin Password** (with silent input and confirmation). Pressing Enter on the password prompt automatically generates a cryptographically secure 20-character password.

### 2. Headless / Automated Provisioning (CI/CD & Cloud-Init)

For non-interactive automation (Ansible, Terraform, cloud-init), provide CLI flags:

```bash
curl -fsSL https://shipyard.example/install.sh | bash -s -- \
  --email admin@mycompany.com \
  --password "MySuperSecurePassword123" \
  --port 3000 \
  --non-interactive
```

---

## ⚙️ Minimum Requirements & VPS Sizing

| Hardware | Spec | Recommendation |
|----------|------|----------------|
| **CPU** | 1 vCPU | 2+ vCPUs recommended for concurrent builds |
| **RAM** | 512 MB | 2GB+ recommended (or 1GB with 2GB swap) |
| **OS** | Ubuntu 20.04+, Debian 11+, CentOS 8+, Rocky 8+ | Ubuntu 22.04 LTS or 24.04 LTS |
| **Storage** | 10 GB SSD | 30 GB+ NVMe SSD |

### ⚠️ Low-RAM VPS (1GB / 2GB) — Fix Exit 137 OOM

Heavy compilation steps (Next.js, Webpack, Rust/Go Docker layers) can momentarily spike above 1.2GB RAM. If your VPS has 1GB RAM without swap, the Linux kernel terminates the build with `exit status 137`.

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
| **80** | TCP | HTTP & ACME Let's Encrypt certificate challenge | Public |
| **443** | TCP / UDP | HTTPS & HTTP/3 QUIC web traffic | Public |
| **3000** | TCP | Shipyard Dashboard Control Plane | Public / Private |
| **30000–39999** | TCP | Internal container workload allocation | Internal (routed via Caddy) |

**Quick UFW setup:**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw allow 3000/tcp
sudo ufw enable
```

---

## 🔑 Administrator Password Management & Reset

If you ever forget your admin password or need to reset credentials:

```bash
cd /var/lib/shipyard/source
node scripts/init-appliance.js --reset-password <admin-email> <new-password>
```

Credentials are saved locally with `chmod 0600` permissions at:
```bash
/var/lib/shipyard/data/secrets/shipyard.secret.json
```

---

## 🌐 Custom Domains & Cloudflare SSL

1. Create a DNS **A Record** pointing your domain (e.g. `app.example.com`) to your VPS IP address.
2. In the Shipyard dashboard, add `app.example.com` under your project settings.
3. Caddy 2 automatically provisions and manages Let's Encrypt TLS certificates.
4. **Cloudflare Note:** If using Cloudflare with Orange Cloud (Proxied), set Cloudflare SSL/TLS encryption mode to **Full (Strict)** to avoid infinite redirect loops.

---

## 🚨 Troubleshooting & Self-Host Error Runbooks

### 1. `bind: address already in use (80 / 443)`
- **Cause:** Apache or default Nginx is running on the host and holding ports 80/443.
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
- **Cause:** Physical RAM exhaustion during build.
- **Fix:** Add a 2GB swap file using the swap recipe above.

### 4. `PostgreSQL connection refused / pg_isready timeout`
- **Fix:**
  ```bash
  cd /var/lib/shipyard/source && docker compose logs shipyard-db
  docker compose restart shipyard-db
  ```

---

## 📦 Disaster Recovery & Backups

All application state, databases, Caddy routes, and encrypted secrets reside in:
```bash
/var/lib/shipyard/data
```

**To create a complete backup archive:**
```bash
sudo tar -czvf /root/shipyard-backup-$(date +%F).tar.gz /var/lib/shipyard/data
```

**To restore on a brand new VPS:**
```bash
sudo mkdir -p /var/lib/shipyard
sudo tar -xzvf /root/shipyard-backup-*.tar.gz -C /
curl -fsSL https://shipyard.example/install.sh | bash
```

---

## 🔄 Updating Shipyard

Update to the latest release with zero data loss:

```bash
cd /var/lib/shipyard/source
git pull
docker compose up -d --build
```

---

## 🏗️ Architecture Stack

- **Frontend & API:** Next.js 14 App Router
- **Database:** PostgreSQL 16 & Shipyard Flat-File Engine fallback
- **Proxy & Auto-HTTPS:** Caddy 2 (HTTP/3 QUIC & Let's Encrypt)
- **Container Runtime:** Docker Engine
- **Telemetry:** Direct Linux `/proc` kernel inspection (zero mock data)
- **Cluster Mesh:** Lightweight Node.js agent (`shipyard-agent.js`)

---

## 📝 License

MIT — Built by [@RishBroProMax](https://github.com/RishBroProMax)
