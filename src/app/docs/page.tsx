"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Anchor,
  ArrowLeft,
  Copy,
  Check,
  Server,
  Terminal,
  Shield,
  Rocket,
  Globe,
  FileCode,
  Users,
  Database,
  Layers,
  Cloud,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  Play,
  Cpu,
  Lock,
  GitBranch,
} from "lucide-react";

interface DocSection {
  id: string;
  category: string;
  title: string;
  badge?: string;
  keywords: string[];
}

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [currentOrigin, setCurrentOrigin] = useState("https://shipyard.example");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("quickstart");
  const [apiResponse, setApiResponse] = useState<Record<string, string>>({});
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const testEndpoint = async (endpoint: string, key: string) => {
    setApiLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse((prev) => ({ ...prev, [key]: JSON.stringify(data, null, 2) }));
    } catch (err: any) {
      setApiResponse((prev) => ({
        ...prev,
        [key]: JSON.stringify({ error: "Failed to fetch endpoint", details: err.message }, null, 2),
      }));
    } finally {
      setApiLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const installCmd = `curl -fsSL ${currentOrigin}/install.sh | sh`;
  const agentCmd = `curl -fsSL ${currentOrigin}/agent_install | bash -s -- --token <YOUR_CLUSTER_TOKEN>`;

  const docSections: DocSection[] = [
    {
      id: "quickstart",
      category: "Getting Started",
      title: "One-Line Appliance Install",
      badge: "60s Boot",
      keywords: ["install", "curl", "quickstart", "setup", "vps", "linux", "bootstrap"],
    },
    {
      id: "prerequisites",
      category: "Getting Started",
      title: "Hardware Specs & OS Support",
      badge: "Specs",
      keywords: ["requirements", "ubuntu", "debian", "memory", "ram", "cpu", "docker"],
    },
    {
      id: "dual-modes",
      category: "Architecture",
      title: "Vercel vs Self-Hosted Appliance",
      badge: "Dual-Mode",
      keywords: ["vercel", "appliance", "cloud", "hybrid", "repository", "modes"],
    },
    {
      id: "supervisor",
      category: "Architecture",
      title: "Autonomous Supervisor Engine",
      badge: "Zero-Config",
      keywords: ["supervisor", "database", "postgres", "redis", "migrations", "keys"],
    },
    {
      id: "telemetry",
      category: "Architecture",
      title: "Zero-Mock Real Hardware Telemetry",
      badge: "Kernel",
      keywords: ["telemetry", "hardware", "cpu", "ram", "metrics", "os", "real-time"],
    },
    {
      id: "worker-nodes",
      category: "Cluster & Mesh",
      title: "Connecting Worker Nodes",
      badge: "Multi-Node",
      keywords: ["worker", "nodes", "cluster", "scaling", "agent", "remote", "mesh"],
    },
    {
      id: "file-editor",
      category: "Developer Workflow",
      title: "In-Browser File Studio & Static Hosting",
      badge: "Web IDE",
      keywords: ["editor", "html", "css", "js", "static", "upload", "files", "browser"],
    },
    {
      id: "git-auto-deploy",
      category: "CI/CD & Deployments",
      title: "Git Webhook Auto-Deploy & SSE",
      badge: "Webhooks",
      keywords: ["git", "github", "webhook", "ci", "cd", "sse", "stream", "rollback"],
    },
    {
      id: "custom-domains",
      category: "Networking",
      title: "Dynamic Caddy Proxy & Auto-SSL",
      badge: "Let's Encrypt",
      keywords: ["domains", "ssl", "caddy", "reverse-proxy", "ports", "https", "certificates"],
    },
    {
      id: "security-vault",
      category: "Security",
      title: "AES-256-GCM Vault & Rootless Docker",
      badge: "AES-256",
      keywords: ["security", "vault", "encryption", "aes", "gcm", "isolation", "sandbox"],
    },
    {
      id: "api-reference",
      category: "API Reference",
      title: "Interactive System API Reference",
      badge: "Live REST",
      keywords: ["api", "rest", "endpoints", "health", "system", "status"],
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return docSections;
    const q = searchQuery.toLowerCase();
    return docSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats: Record<string, DocSection[]> = {};
    filteredSections.forEach((sec) => {
      if (!cats[sec.category]) cats[sec.category] = [];
      cats[sec.category].push(sec);
    });
    return cats;
  }, [filteredSections]);

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Tactical Grid Overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.25] pointer-events-none z-0" />

      {/* Top Header Navigation */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#050608]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
              <Anchor className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-widest text-white">
                SHIPYARD
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 font-mono font-bold">
                DOCUMENTATION
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>RETURN TO LANDING</span>
          </Link>
        </div>
      </header>

      {/* Main Documentation Shell */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Left-Hand Table of Contents */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Search Filter Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search specs, curl, vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#090d14] border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-colors"
              />
            </div>

            {/* Categorized TOC Navigation */}
            <nav className="space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
              {Object.entries(categories).map(([catName, items]) => (
                <div key={catName} className="space-y-1.5">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono px-3">
                    {catName}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={() => setActiveSection(sec.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors group ${
                          activeSection === sec.id
                            ? "bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-bold"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                        }`}
                      >
                        <span className="truncate">{sec.title}</span>
                        {sec.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 text-zinc-500 border border-zinc-800 shrink-0 ml-2 group-hover:text-zinc-300">
                            {sec.badge}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-4 rounded-xl bg-[#090d14] border border-zinc-800 text-xs font-mono space-y-1 text-zinc-400">
              <div className="text-white font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>SHIPYARD V1.0.0</span>
              </div>
              <div className="text-[11px] text-zinc-500">Autonomous PaaS Appliance</div>
            </div>
          </div>
        </aside>

        {/* Right-Hand Documentation Body */}
        <main className="flex-1 max-w-4xl space-y-16 text-sm text-zinc-300 leading-relaxed font-sans">
          {/* Section 1: Quickstart */}
          <section id="quickstart" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Rocket className="w-4 h-4" />
              <span>GETTING STARTED // BOOTSTRAP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-display">
              One-Line Appliance Installation
            </h1>
            <p className="text-zinc-300">
              Shipyard is distributed as a self-contained autonomous appliance. Deploying it on any clean Linux VPS transforms the machine into a multi-tenant developer platform in approximately 60 seconds with zero post-deployment setup:
            </p>

            {/* Industrial Code Box */}
            <div className="relative rounded-xl bg-black border border-cyan-500/30 overflow-hidden shadow-2xl">
              <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="text-cyan-400 font-bold">BASH // ROOT EXECUTION</span>
                <span>INSTALLS DOCKER, POSTGRES 16, REDIS 7, CADDY</span>
              </div>
              <div className="p-5 font-mono text-xs text-zinc-100 flex items-center justify-between gap-4 overflow-x-auto">
                <span className="text-cyan-400 font-bold select-none">$</span>
                <code className="flex-1 text-zinc-200">{installCmd}</code>
                <button
                  onClick={() => copyCode("quickstart", installCmd)}
                  className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-cyan-300 border border-zinc-700 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedSection === "quickstart" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-zinc-300 font-mono space-y-2">
              <div className="text-cyan-300 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>WHAT HAPPENS UNDER THE HOOD:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>Installs Docker Engine if missing on host.</li>
                <li>Creates persistent storage volumes at <code className="text-zinc-200">/var/lib/shipyard</code>.</li>
                <li>Generates 256-bit AES cryptographic encryption keys.</li>
                <li>Initializes PostgreSQL 16 &amp; Redis 7 queues and applies schema migrations.</li>
                <li>Seeds initial administrative credentials (<code className="text-zinc-200">admin@shipyard.local</code>).</li>
                <li>Launches Caddy 2 dynamic reverse proxy and prints live dashboard URL.</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Prerequisites */}
          <section id="prerequisites" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Cpu className="w-4 h-4" />
              <span>HARDWARE &amp; OS // COMPATIBILITY</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Hardware Specifications &amp; Compatibility
            </h2>
            <p className="text-zinc-300">
              Shipyard was engineered with an ultra-compact footprint to run comfortably on standard, low-cost virtual private servers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#090d14] border border-zinc-800 space-y-2">
                <div className="text-zinc-500 font-bold uppercase text-[10px]">MINIMUM RAM</div>
                <div className="text-xl font-bold text-cyan-400">1.0 GB</div>
                <div className="text-zinc-400 text-[11px]">Supervisor uses &lt; 140 MB idle.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#090d14] border border-zinc-800 space-y-2">
                <div className="text-zinc-500 font-bold uppercase text-[10px]">MINIMUM CPU</div>
                <div className="text-xl font-bold text-emerald-400">1 vCPU</div>
                <div className="text-zinc-400 text-[11px]">x86_64 or ARM64 architecture.</div>
              </div>
              <div className="p-4 rounded-xl bg-[#090d14] border border-zinc-800 space-y-2">
                <div className="text-zinc-500 font-bold uppercase text-[10px]">DISK STORAGE</div>
                <div className="text-xl font-bold text-purple-400">10 GB SSD</div>
                <div className="text-zinc-400 text-[11px]">For base OS &amp; container images.</div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-zinc-400">
              <div className="text-zinc-300 font-bold">SUPPORTED OPERATING SYSTEMS:</div>
              <div className="flex flex-wrap gap-2">
                {["Ubuntu 20.04 / 22.04 / 24.04 LTS", "Debian 11 / 12", "CentOS Stream 9", "Rocky Linux 9", "AlmaLinux 9", "Alpine 3.19+"].map((os, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-black border border-zinc-800 text-zinc-300">
                    ✓ {os}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Dual Modes */}
          <section id="dual-modes" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Cloud className="w-4 h-4" />
              <span>UNIFIED ARCHITECTURE // DUAL-MODE</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Vercel Cloud Mode vs Bare-Metal Appliance
            </h2>
            <p className="text-zinc-300">
              Shipyard eliminates repository fragmentation by providing both public cloud showcase capabilities and on-premise bare-metal execution from a single code base:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-5 rounded-xl bg-[#090d14] border border-zinc-800 space-y-3">
                <span className="text-cyan-400 font-bold text-sm block">▲ Vercel Cloud Mode</span>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Triggered when deployed to Vercel (<code className="text-zinc-200">VERCEL=1</code>):
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-400 text-[11px]">
                  <li>Serves public landing page with ReactBits ShapeWaves backdrop.</li>
                  <li>Serves complete technical documentation at <code className="text-zinc-200">/docs</code>.</li>
                  <li>Dynamically generates bash installer scripts at <code className="text-zinc-200">/install.sh</code>.</li>
                  <li>Requires zero PostgreSQL, Docker, or persistent disk dependencies.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-[#090d14] border border-zinc-800 space-y-3">
                <span className="text-emerald-400 font-bold text-sm block">⚓ Bare-Metal Appliance Mode</span>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Activated when installed on a Linux VPS (<code className="text-zinc-200">SHIPYARD_MODE=appliance</code>):
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-400 text-[11px]">
                  <li>Root route serves full PaaS Control Plane (Dashboard, Workloads, Servers).</li>
                  <li>Directly manages Docker Engine containers, builds, and sandboxes.</li>
                  <li>Configures Caddy dynamic reverse proxy and auto Let&apos;s Encrypt SSL.</li>
                  <li>Zero mock data: real-time hardware telemetry measured via OS kernel.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Supervisor */}
          <section id="supervisor" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <Zap className="w-4 h-4" />
              <span>SUPERVISOR // AUTONOMOUS BOOTSTRAP</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Autonomous Supervisor State Engine
            </h2>
            <p className="text-zinc-300">
              The Shipyard Supervisor is the brain of the appliance. It executes a 6-phase state machine on every start to ensure self-healing and zero downtime:
            </p>

            <div className="p-5 rounded-xl bg-black border border-zinc-800 font-mono text-xs space-y-2 text-zinc-300">
              <div className="text-zinc-500">// Supervisor Autonomous Startup Sequence:</div>
              <div className="text-cyan-400">[PHASE 1] Checking host environment, Docker socket, and /var/lib/shipyard</div>
              <div className="text-zinc-400">[PHASE 2] Initializing AES-256 vault encryption key &amp; JWT secrets</div>
              <div className="text-zinc-400">[PHASE 3] Connecting to PostgreSQL 16 &amp; executing database migrations</div>
              <div className="text-zinc-400">[PHASE 4] Spawning Redis 7 worker queue &amp; Caddy dynamic reverse proxy</div>
              <div className="text-zinc-400">[PHASE 5] Seeding initial admin account &amp; Local Host worker node</div>
              <div className="text-emerald-400 font-bold">[PHASE 6] Appliance READY &rarr; Listening on 0.0.0.0:3000</div>
            </div>
          </section>

          {/* Section 5: Telemetry */}
          <section id="telemetry" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Activity className="w-4 h-4" />
              <span>TELEMETRY // ZERO MOCK DATA</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Zero-Mock Real Hardware Telemetry
            </h2>
            <p className="text-zinc-300">
              Unlike ordinary dashboards that render randomized mock curves, Shipyard samples genuine hardware metrics directly from the host operating system:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#090d14] border border-zinc-800 space-y-2">
                <span className="text-cyan-400 font-bold block">CPU &amp; Core Calculation</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Samples <code className="text-zinc-200">os.cpus()</code> user/system/idle ticks across 100ms delta windows to compute exact CPU utilization per core.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#090d14] border border-zinc-800 space-y-2">
                <span className="text-emerald-400 font-bold block">Memory &amp; Swap</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Reads real kernel byte allocations via <code className="text-zinc-200">os.totalmem()</code> and <code className="text-zinc-200">os.freemem()</code> with byte-perfect precision.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Worker Nodes */}
          <section id="worker-nodes" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Server className="w-4 h-4" />
              <span>CLUSTER // WORKER NODES</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Connecting Remote Worker Nodes
            </h2>
            <p className="text-zinc-300">
              To join any remote server or bare-metal machine to your Shipyard cluster, execute the tokenized agent command:
            </p>

            <div className="relative rounded-xl bg-black border border-zinc-800 p-4 font-mono text-xs text-zinc-100 flex items-center justify-between gap-4 overflow-x-auto">
              <span className="text-amber-400 font-bold select-none">$</span>
              <code className="flex-1 text-zinc-200">{agentCmd}</code>
              <button
                onClick={() => copyCode("agent", agentCmd)}
                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-cyan-300 border border-zinc-700 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedSection === "agent" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Section 7: File Editor */}
          <section id="file-editor" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <FileCode className="w-4 h-4" />
              <span>DEVELOPER STUDIO // STATIC HOSTING</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              In-Browser File Studio &amp; Static Hosting
            </h2>
            <p className="text-zinc-300">
              Shipyard includes a built-in file editor and static hosting engine. You can create projects by uploading HTML, CSS, and JS files without needing a GitHub repository:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-400 font-mono">
              <li>Drag-and-drop raw static assets (<code className="text-zinc-200">.html, .css, .js, .json, .svg, .png</code>).</li>
              <li>Edit code directly inside the browser with live syntax buffers.</li>
              <li>Click &quot;Save &amp; Redeploy&quot; to instantaneously update live reverse proxy routes in under 250ms.</li>
            </ul>
          </section>

          {/* Section 8: Git Webhook */}
          <section id="git-auto-deploy" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <GitBranch className="w-4 h-4" />
              <span>CI/CD // GIT WEBHOOKS</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Git Webhook Auto-Deploy &amp; Live SSE
            </h2>
            <p className="text-zinc-300">
              Every project generates an authenticated webhook endpoint:
            </p>
            <pre className="p-3.5 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-emerald-400">
              {currentOrigin}/api/webhooks/github
            </pre>
            <p className="text-xs text-zinc-400">
              Configure this in your GitHub repository settings under Webhooks (Payload URL: above, Content type: <code className="text-zinc-200">application/json</code>). Every push automatically triggers an isolated Docker build with real-time SSE log streaming and zero-downtime traffic cutover.
            </p>
          </section>

          {/* Section 9: Custom Domains */}
          <section id="custom-domains" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Globe className="w-4 h-4" />
              <span>NETWORKING // CADDY &amp; SSL</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Dynamic Reverse Proxy &amp; Automatic SSL
            </h2>
            <p className="text-zinc-300">
              Shipyard allocates non-conflicting internal container ports from the range <code className="text-zinc-200">30000-39999</code>. It connects each workload dynamically to the embedded Caddy reverse proxy. Adding a custom domain provisions automated Let&apos;s Encrypt TLS certificates with automatic renewals.
            </p>
          </section>

          {/* Section 10: Security Vault */}
          <section id="security-vault" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Lock className="w-4 h-4" />
              <span>SECURITY // AES-256-GCM VAULT</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              AES-256-GCM Vault &amp; Rootless Docker Sandboxing
            </h2>
            <p className="text-zinc-300">
              All sensitive environment variables, database passwords, and cluster tokens are encrypted at rest using AES-256-GCM authenticated ciphers. Workloads execute inside isolated rootless Docker containers to prevent privilege escalation.
            </p>
          </section>

          {/* Section 11: Interactive API Reference */}
          <section id="api-reference" className="space-y-6 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span>REST API // INTERACTIVE TESTER</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight font-display">
              Interactive System API Reference
            </h2>
            <p className="text-zinc-300">
              Test live Shipyard endpoints directly from this documentation page:
            </p>

            <div className="space-y-4 font-mono text-xs">
              {/* Endpoint 1: Healthcheck */}
              <div className="p-5 rounded-xl bg-[#090d14] border border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      GET
                    </span>
                    <span className="text-white font-bold">/api/health</span>
                  </div>
                  <button
                    onClick={() => testEndpoint("/api/health", "health")}
                    disabled={apiLoading["health"]}
                    className="px-3 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{apiLoading["health"] ? "FETCHING..." : "TEST ENDPOINT"}</span>
                  </button>
                </div>
                <div className="text-zinc-400 text-[11px]">
                  Returns cluster health, uptime, and database connection status.
                </div>
                {apiResponse["health"] && (
                  <pre className="p-3.5 rounded-lg bg-black border border-zinc-800 text-emerald-400 overflow-x-auto text-[11px]">
                    {apiResponse["health"]}
                  </pre>
                )}
              </div>

              {/* Endpoint 2: System Status */}
              <div className="p-5 rounded-xl bg-[#090d14] border border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      GET
                    </span>
                    <span className="text-white font-bold">/api/system/status</span>
                  </div>
                  <button
                    onClick={() => testEndpoint("/api/system/status", "status")}
                    disabled={apiLoading["status"]}
                    className="px-3 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{apiLoading["status"] ? "FETCHING..." : "TEST ENDPOINT"}</span>
                  </button>
                </div>
                <div className="text-zinc-400 text-[11px]">
                  Returns live hardware telemetry: CPU load, RAM usage, storage bytes, and active processes.
                </div>
                {apiResponse["status"] && (
                  <pre className="p-3.5 rounded-lg bg-black border border-zinc-800 text-cyan-400 overflow-x-auto text-[11px]">
                    {apiResponse["status"]}
                  </pre>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
