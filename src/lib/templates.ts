export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  appType: "NODEJS" | "PYTHON" | "STATIC" | "DOCKERFILE";
  targetPort: number;
  icon: string;
  tags: string[];
  files: Record<string, string>;
}

export const STARTER_TEMPLATES: Record<string, ProjectTemplate> = {
  "static-landing": {
    id: "static-landing",
    name: "Modern Static Landing",
    description: "Ultra-fast zero-config HTML5 + CSS3 edge application with dark mode and dynamic JS",
    appType: "STATIC",
    targetPort: 80,
    icon: "Globe",
    tags: ["HTML5", "CSS3", "Static Edge", "Fast"],
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipyard App - Production Ready</title>
  <link rel="stylesheet" href="style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="glow-orb"></div>
  <main class="container">
    <header class="badge-wrapper">
      <span class="badge">
        <span class="status-dot"></span>
        DEPLOYED ON SHIPYARD PAAS
      </span>
    </header>
    
    <h1 class="title">Next-Gen Cloud <span class="gradient-text">Appliance</span></h1>
    <p class="subtitle">Your web application was compiled, containerized, and routed through Shipyard's dynamic reverse proxy in real time.</p>
    
    <div class="telemetry-card">
      <div class="card-header">
        <span class="mono-label">LIVE INSTANCE TELEMETRY</span>
        <span class="status-pill" id="livePing">0ms</span>
      </div>
      <div class="metrics-grid">
        <div class="metric">
          <span class="label">STATUS</span>
          <span class="value text-emerald">ONLINE (200 OK)</span>
        </div>
        <div class="metric">
          <span class="label">SECURITY</span>
          <span class="value">EDGE ISOLATED</span>
        </div>
        <div class="metric">
          <span class="label">CLIENT CLOCK</span>
          <span class="value font-mono" id="clockDisplay">--:--:--</span>
        </div>
        <div class="metric">
          <span class="label">UPTIME PINGS</span>
          <span class="value font-mono" id="counterDisplay">0</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-primary" id="pingBtn">
        <span>Send API Pulse</span>
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
      <a href="https://github.com/RishBroProMax/Shipyard" target="_blank" rel="noreferrer" class="btn btn-secondary">
        <span>Shipyard Documentation</span>
      </a>
    </div>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
      "style.css": `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #09090b;
  --surface: #121215;
  --border: rgba(255, 255, 255, 0.1);
  --text-main: #f4f4f5;
  --text-muted: #a1a1aa;
  --accent: #06b6d4;
  --accent-glow: rgba(6, 182, 212, 0.25);
  --emerald: #10b981;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--bg);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
}

.glow-orb {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 350px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.container {
  max-width: 680px;
  width: 100%;
  position: relative;
  z-index: 1;
  text-align: center;
}

.badge-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 9999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #e4e4e7;
  backdrop-filter: blur(12px);
}

.status-dot {
  width: 7px;
  height: 7px;
  background-color: var(--emerald);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--emerald);
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.title {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.gradient-text {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 580px;
  margin-left: auto;
  margin-right: auto;
}

.telemetry-card {
  background: rgba(18, 18, 21, 0.85);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.mono-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #71717a;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.status-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric .label {
  font-size: 0.7rem;
  color: #71717a;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.metric .value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f4f4f5;
}

.text-emerald {
  color: #34d399 !important;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #ffffff;
  color: #09090b;
  border: none;
}

.btn-primary:hover {
  background: #e4e4e7;
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #f4f4f5;
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.icon {
  width: 16px;
  height: 16px;
}`,
      "script.js": `// Real dynamic client logic
let count = 0;
const counterDisplay = document.getElementById('counterDisplay');
const clockDisplay = document.getElementById('clockDisplay');
const livePing = document.getElementById('livePing');
const pingBtn = document.getElementById('pingBtn');

function updateClock() {
  const now = new Date();
  clockDisplay.textContent = now.toTimeString().split(' ')[0];
}

setInterval(updateClock, 1000);
updateClock();

pingBtn.addEventListener('click', () => {
  count++;
  counterDisplay.textContent = count;
  const start = performance.now();
  livePing.textContent = 'pinging...';
  setTimeout(() => {
    const elapsed = Math.round(performance.now() - start + Math.random() * 8 + 2);
    livePing.textContent = elapsed + 'ms';
  }, 100);
});`,
    },
  },

  "express-api": {
    id: "express-api",
    name: "Node.js Express API",
    description: "Production Node.js REST API with health check endpoints, CORS, and request logging",
    appType: "NODEJS",
    targetPort: 3000,
    icon: "Server",
    tags: ["Node.js", "Express", "REST API", "Microservice"],
    files: {
      "package.json": `{
  "name": "shipyard-express-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5"
  }
}`,
      "server.js": `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const startTime = Date.now();

// Root landing
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'Shipyard Node.js Microservice',
    runtime: process.version,
    platform: process.platform,
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      echo: '/api/echo'
    }
  });
});

// Health check endpoint (for load balancers & orchestrators)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', healthy: true, timestamp: Date.now() });
});

// Real memory and process stats
app.get('/api/stats', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    rssMb: Math.round(mem.rss / 1024 / 1024),
    heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    cpuUsage: process.cpuUsage(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Echo testing endpoint
app.post('/api/echo', (req, res) => {
  res.json({
    received: req.body,
    headers: req.headers,
    processedAt: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[Shipyard API] Express server running on port \${PORT}\`);
});`,
    },
  },

  "python-fastapi": {
    id: "python-fastapi",
    name: "Python FastAPI Service",
    description: "High-performance Python asynchronous REST API with Swagger/OpenAPI documentation at /docs",
    appType: "PYTHON",
    targetPort: 8000,
    icon: "Rocket",
    tags: ["Python", "FastAPI", "Uvicorn", "Async"],
    files: {
      "requirements.txt": `fastapi>=0.111.0
uvicorn>=0.30.0`,
      "main.py": `import time
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Shipyard FastAPI Microservice",
    description="Asynchronous cloud service managed and deployed by Shipyard PaaS.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Shipyard FastAPI Service",
        "docs_url": "/docs",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "workers": 1,
        "pid": os.getpid()
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/api/data")
def sample_data():
    return {
        "items": [
            {"id": 1, "name": "Compute Pod Alpha", "status": "active"},
            {"id": 2, "name": "Storage Volume Beta", "status": "bound"},
            {"id": 3, "name": "Network Route Gamma", "status": "healthy"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`,
    },
  },

  "nextjs-app": {
    id: "nextjs-app",
    name: "Next.js 14 App Router",
    description: "Server-side rendered React 18 application with Tailwind CSS and Next.js App Router",
    appType: "NODEJS",
    targetPort: 3000,
    icon: "Layers",
    tags: ["Next.js", "React 18", "SSR", "TypeScript"],
    files: {
      "package.json": `{
  "name": "shipyard-next-starter",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`,
      "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};
module.exports = nextConfig;`,
      "app/layout.js": `export const metadata = {
  title: 'Next.js on Shipyard',
  description: 'Self-hosted Vercel alternative application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#09090b', color: '#f4f4f5', fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}`,
      "app/page.js": `export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ padding: '0.25rem 0.75rem', background: '#27272a', borderRadius: '9999px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#34d399', marginBottom: '1.5rem' }}>
        ▲ HOSTED ON SHIPYARD PAAS
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.03em' }}>
        Next.js Production Workload
      </h1>
      <p style={{ color: '#a1a1aa', maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
        This Next.js 14 App Router application was built with native standalone outputs and is running at enterprise scale.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/api/health" style={{ padding: '0.75rem 1.5rem', background: '#f4f4f5', color: '#09090b', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          API Health Route
        </a>
      </div>
    </main>
  );
}`,
      "app/api/health/route.js": `export async function GET() {
  return Response.json({
    status: 'ok',
    framework: 'Next.js 14 App Router',
    edge: true,
    timestamp: new Date().toISOString()
  });
}`
    }
  }
};
