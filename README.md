# ⚓ Shipyard

> **Production-Quality Zero-Configuration Self-Hosted Developer Platform (PaaS Appliance)**

Shipyard is a self-contained, developer-focused PaaS that behaves like a complete appliance. Deploy it on any VPS or server, and it automatically provisions and manages all required internal services—including PostgreSQL, Redis, job queues, reverse proxy, background workers, and deployment agents—with **zero configuration after deployment**.

---

## 🚀 One-Line Installation (Appliance Mode)

On a fresh Linux VPS (Ubuntu, Debian, CentOS, Rocky Linux):

```bash
curl -fsSL https://shipyard.example/install.sh | sh
```

Or run directly from this repository:

```bash
bash install.sh
```

### The Zero-Configuration Guarantee:
- **No manual database setup**: PostgreSQL 16 is created and configured automatically.
- **No manual Redis setup**: Redis 7 and background workers initialize on first boot.
- **No manual migrations**: Database schema and initial seeds apply automatically.
- **No manual secret generation**: Cryptographic 256-bit secrets (AES-256-GCM master key, JWT secret, DB passwords, agent tokens) are generated on first startup and persisted in `/var/lib/shipyard/data/secrets/shipyard.secret.json`.
- **Only 2 optional environment variables**:
  - `SHIPYARD_ADMIN_EMAIL` (default: `admin@shipyard.local`)
  - `SHIPYARD_ADMIN_PASSWORD` (auto-generated if omitted)

---

## 🖥️ Connect Remote Worker Nodes

Shipyard uses a **Control Plane (Leader) + Deployment Agent (Worker Node)** architecture. You can connect any other VPS, bare-metal server, or PC to join the cluster.

### 1. Linux One-Liner (cURL)
From the Shipyard dashboard &rarr; **Servers** page, copy your node command:

```bash
curl -fsSL http://<LEADER_HOST>:3000/agent_install | bash -s -- --token <AGENT_TOKEN> --name "worker-vps-01"
```

### 2. Docker Container
```bash
docker run -d \
  --name shipyard-agent \
  --restart always \
  --net host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e SHIPYARD_LEADER_URL=http://<LEADER_HOST>:3000 \
  -e SHIPYARD_AGENT_TOKEN=<AGENT_TOKEN> \
  -e SHIPYARD_NODE_NAME="worker-vps-01" \
  node:20-alpine sh -c "curl -fsSL http://<LEADER_HOST>:3000/agent_install | bash -s -- --token <AGENT_TOKEN>"
```

### 3. Standalone Node.js Runner
```bash
curl -fsSL http://<LEADER_HOST>:3000/api/agent/script -o shipyard-agent.js
node shipyard-agent.js --leader http://<LEADER_HOST>:3000 --token <AGENT_TOKEN> --name "my-pc"
```

Worker nodes report real-time telemetry (CPU %, RAM %, Disk %, and In/Out Network throughput in KB/s & MB/s) every 3 seconds and execute container builds inside isolated Docker sandboxes.

---

## ⚡ Key PaaS Features

### 🔄 Git Push Auto-Deploy
1. Create a project with your GitHub repository URL and branch (e.g. `main`).
2. Add the Webhook URL to GitHub: `http://<LEADER_HOST>:3000/api/webhooks/github`
3. Every `git push` automatically triggers:
   `Webhook -> Buildpack Detection -> Docker Build -> Dynamic Port Allocation -> Container Start -> Health Check -> Reverse Proxy -> Live URL`.

### 📦 Automatic Buildpack Detection
- **Dockerfile**: Native multi-stage Docker build.
- **Node.js / Next.js**: Detected via `package.json` with optimized production standalone build.
- **Python (FastAPI / Flask / Django)**: Detected via `requirements.txt` or `pyproject.toml` with Gunicorn / Uvicorn.
- **Static Sites**: Detected via `index.html` with Nginx Alpine container.

### 📝 In-Browser File Editor & Direct HTML/CSS/JS Hosting
- Upload or create HTML, CSS, JavaScript, JSON, or configuration files directly in the dashboard.
- Built-in syntax-highlighted code editor with line numbers, status indicators, and keyboard shortcuts.
- Instant **"Save & Redeploy"** triggers live zero-downtime container compilation and reverse proxy updates.

### 🌐 Custom Domains & Automated SSL
- Map custom domains (e.g. `api.yourdomain.com`).
- Dynamic reverse proxy automatically routes incoming traffic to the container's dynamically allocated internal port (30000-39999).
- Automatic Let's Encrypt SSL/TLS certificates.

### 🔐 Zero-Trust Security & AES-256 Vault
- Untrusted repository code builds exclusively on worker nodes—never in the main control plane.
- Project environment variables are encrypted at rest using AES-256-GCM.
- GitHub webhooks verified via HMAC SHA-256 signatures.
- Granular team user management (Admin, Operator, Viewer roles).
- Complete audit activity logging (`ActivityLog`) tracking all user and system events.

### 📜 Real-Time Live Logs & 1-Click Rollback
- Real-time Server-Sent Events (SSE) log streaming with terminal styling and color highlights.
- Instant 1-click rollback to any previous commit or deployment.

---

## 🛠️ Local Development & Standalone Run

```bash
# Clone repository
git clone https://github.com/your-org/shipyard.git
cd shipyard

# Install dependencies
npm install --ignore-scripts

# Run supervisor verification tests
node scripts/test-supervisor.js

# Start Next.js development server
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.
