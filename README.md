# ⚓ Shipyard — Self-Hosted Developer Platform & PaaS Appliance

<p align="center">
  <strong>Transform any fresh Linux VPS into a self-contained deployment platform in 60 seconds.</strong>
  <br />
  Zero configuration · Automatic SSL · Real hardware telemetry · One-command install
</p>

<p align="center">
  <a href="https://shipyard-paas.vercel.app">Live Demo</a>
  ·
  <a href="https://shipyard-paas.vercel.app/docs">Documentation</a>
  ·
  <a href="#-quick-start">Quick Start</a>
</p>

---

## ✨ What is Shipyard?

Shipyard is a **self-hosted PaaS appliance** that runs on any fresh Linux VPS. It operates as a dual-mode system from a single repository:

| Mode | Where | What it does |
|------|-------|-------------|
| **Cloud (Vercel)** | `VERCEL=1` | Serves the public landing page, docs, and install script endpoints |
| **Appliance (VPS)** | `SHIPYARD_MODE=appliance` | Full PaaS control plane: Docker orchestration, Git deployments, SSL, real telemetry |

---

## 🚀 Quick Start

### Deploy to VPS (Self-Hosted Appliance)

Run this single command on any fresh Ubuntu/Debian/CentOS VPS:

```bash
curl -fsSL https://shipyard.example/install.sh | sh
```

**With custom options:**
```bash
curl -fsSL https://shipyard.example/install.sh | sh -s -- \
  --email admin@mycompany.com \
  --password MySecurePassword123 \
  --port 3000
```

That's it. Shipyard will:
1. Install Docker (if not present)
2. Clone the source from GitHub
3. Generate unique secrets and a Postgres password
4. Build and start the full stack (PostgreSQL 16, Redis 7, Caddy, Next.js)
5. Bootstrap the admin account
6. Print your dashboard URL and credentials

**Minimum requirements:** 1 vCPU · 512MB RAM · Ubuntu 20.04+ / Debian 11+ / CentOS 8+

---

### Deploy to Vercel (Public Showcase / Docs)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RishBroProMax/Shipyard)

No environment variables needed — Vercel auto-detects `VERCEL=1` and serves only the landing page and docs.

---

## 🔧 Development Setup

```bash
git clone https://github.com/RishBroProMax/Shipyard.git
cd Shipyard
npm install

# Start in local appliance mode
cp .env.example .env
# Edit .env: set SHIPYARD_MODE=appliance and DATABASE_URL

npm run dev
```

---

## 🏗️ Architecture

```
Shipyard Repository (Single Source of Truth)
├── Vercel Deployment     → Landing page + Docs + Install script server
│   └── VERCEL=1         → Shows LandingView + DocsPage only
│
└── VPS Appliance         → Full self-hosted PaaS control plane
    ├── install.sh        → Bootstraps Docker stack from source
    ├── docker-compose.yml → PostgreSQL + Redis + Caddy + Next.js
    └── SHIPYARD_MODE=appliance → Unlocks full dashboard
```

**Stack:**
- **Frontend / API:** Next.js 14 (App Router)
- **Database:** PostgreSQL 16 via Prisma ORM (+ JSON flat-file fallback)
- **Cache / Pub-Sub:** Redis 7
- **Reverse Proxy / SSL:** Caddy 2 (auto Let's Encrypt)
- **Container Runtime:** Docker Engine
- **Worker Agents:** Node.js agent (zero external dependencies)

---

## 🌐 Adding Worker Nodes

Connect additional servers to your Shipyard cluster:

```bash
# On the remote VPS you want to add as a worker:
curl -fsSL http://YOUR_LEADER_IP:3000/agent_install | sh -s -- \
  --token <CLUSTER_TOKEN_FROM_DASHBOARD>
```

The agent streams real-time CPU, RAM, disk, and network telemetry back to the leader every 3 seconds.

---

## 📦 Project Structure

```
Shipyard/
├── src/
│   ├── app/
│   │   ├── install.sh/      # Dynamic install script endpoint
│   │   ├── agent_install/   # Dynamic agent installer endpoint
│   │   ├── api/             # REST API (auth, projects, deployments, servers)
│   │   ├── docs/            # Documentation page
│   │   └── landing/         # Public landing page
│   ├── agent/
│   │   └── shipyard-agent.js  # Worker node agent (zero dependencies)
│   ├── lib/
│   │   ├── db.ts            # JSON flat-file database (VPS mode)
│   │   ├── init/            # Appliance boot supervisor
│   │   ├── security/        # JWT, AES-256, bcrypt
│   │   ├── proxy/           # Caddy config generator
│   │   └── system/          # Host telemetry (Linux /proc/)
│   └── components/          # React UI components
├── scripts/
│   ├── safe-build.js        # Vercel-safe build pipeline
│   └── agent-install.sh     # Worker node install script
├── install.sh               # Main VPS installer
├── Dockerfile               # Multi-stage production Docker build
├── docker-compose.yml       # Full production stack
└── .env.example             # Environment variable reference
```

---

## 🔐 Security

- **AES-256-GCM** encryption for all stored environment variables
- **bcrypt** password hashing (cost factor 12)
- **JWT** session tokens (configurable expiry)
- Auto-generated unique Postgres password per installation
- Secrets stored at `$SHIPYARD_DATA_DIR/data/secrets/shipyard.secret.json` (mode 0600)
- Docker socket access is scoped to the control plane container only

---

## 📝 License

MIT — Built by [@RishBroProMax](https://github.com/RishBroProMax)
