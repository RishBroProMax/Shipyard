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
  Settings,
  HelpCircle,
  AlertTriangle,
  FolderTree,
  KeyRound,
  Boxes,
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
  const agentCmd = `curl -fsSL ${currentOrigin}/agent_install | sh -s -- --token <CLUSTER_TOKEN>`;

  const docSections: DocSection[] = [
    {
      id: "overview",
      category: "Introduction",
      title: "Overview & Philosophy",
      badge: "Core",
      keywords: ["overview", "about", "philosophy", "architecture", "paas", "self-hosted"],
    },
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
      title: "System Specs & Hardware",
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
      title: "Supervisor State Engine & Zero-Config",
      badge: "Engine",
      keywords: ["supervisor", "database", "postgres", "redis", "migrations", "keys"],
    },
    {
      id: "telemetry",
      category: "Architecture",
      title: "Real Kernel Telemetry (0 Mock)",
      badge: "Telemetry",
      keywords: ["telemetry", "hardware", "cpu", "ram", "metrics", "os", "real-time"],
    },
    {
      id: "deploy-git",
      category: "Deploying Applications",
      title: "Deploying via Git Webhooks",
      badge: "CI/CD",
      keywords: ["git", "github", "webhook", "ci", "cd", "sse", "stream", "rollback"],
    },
    {
      id: "deploy-files",
      category: "Deploying Applications",
      title: "In-Browser File Studio & Static Apps",
      badge: "Web IDE",
      keywords: ["editor", "html", "css", "js", "static", "upload", "files", "browser"],
    },
    {
      id: "deploy-docker",
      category: "Deploying Applications",
      title: "Custom Dockerfiles & Frameworks",
      badge: "Containers",
      keywords: ["dockerfile", "container", "node", "python", "go", "nextjs"],
    },
    {
      id: "worker-nodes",
      category: "Cluster & Mesh",
      title: "Connecting Worker Nodes",
      badge: "Multi-Node",
      keywords: ["worker", "nodes", "cluster", "scaling", "agent", "remote", "mesh"],
    },
    {
      id: "reverse-proxy",
      category: "Networking & SSL",
      title: "Dynamic Caddy Proxy & Auto-SSL",
      badge: "Let's Encrypt",
      keywords: ["domains", "ssl", "caddy", "reverse-proxy", "ports", "https", "certificates"],
    },
    {
      id: "security-vault",
      category: "Security & Encryption",
      title: "AES-256-GCM Vault & Isolation",
      badge: "AES-256",
      keywords: ["security", "vault", "encryption", "aes", "gcm", "isolation", "sandbox"],
    },
    {
      id: "api-reference",
      category: "REST API Reference",
      title: "Interactive System API Reference",
      badge: "Live REST",
      keywords: ["api", "rest", "endpoints", "health", "system", "status"],
    },
    {
      id: "troubleshooting",
      category: "Operations",
      title: "Troubleshooting & Runbooks",
      badge: "Ops",
      keywords: ["troubleshooting", "logs", "backup", "restore", "recovery", "ports"],
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shadow-sm">
              <Anchor className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-white">
                Shipyard
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                Docs
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Return to Landing</span>
          </Link>
        </div>
      </header>

      {/* Main Documentation Shell */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12">
        {/* Left-Hand Table of Contents */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Search Filter Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            {/* Categorized TOC Navigation */}
            <nav className="space-y-5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {Object.entries(categories).map(([catName, items]) => (
                <div key={catName} className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2.5">
                    {catName}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={() => setActiveSection(sec.id)}
                        className={`px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                          activeSection === sec.id
                            ? "bg-zinc-800 text-white font-medium shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                        }`}
                      >
                        <span className="truncate">{sec.title}</span>
                        {sec.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-zinc-500 border border-zinc-800 shrink-0 ml-1.5">
                            {sec.badge}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-850 text-xs space-y-1 text-zinc-400">
              <div className="text-white font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Shipyard v1.0.0</span>
              </div>
              <div className="text-[11px] text-zinc-500">Autonomous Developer Appliance</div>
            </div>
          </div>
        </aside>

        {/* Right-Hand Documentation Body */}
        <main className="flex-1 max-w-4xl space-y-16 text-sm text-zinc-300 leading-relaxed font-normal">
          {/* Section 0: Overview */}
          <section id="overview" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <Anchor className="w-4 h-4" />
              <span>INTRODUCTION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Overview &amp; Philosophy
            </h1>
            <p className="text-base text-zinc-300 leading-relaxed">
              Shipyard was built on a simple conviction: <strong>developers should be able to deploy software to their own bare-metal servers without becoming full-time DevOps engineers or paying monthly per-seat SaaS tolls.</strong>
            </p>
            <p>
              Traditional PaaS alternatives either lock your data inside proprietary black boxes or demand that you manage complex Kubernetes clusters, ingress controllers, YAML manifests, and fragile database configurations.
            </p>
            <p>
              Shipyard functions as an <strong>autonomous appliance</strong>. When installed on any fresh Linux virtual machine, it inspects the hardware, creates encrypted storage volumes, initializes PostgreSQL 16 and Redis 7, spins up the Caddy reverse proxy, provisions SSL certificates, and begins streaming real-time hardware telemetry—with zero manual intervention.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="font-semibold text-white">Zero Configuration</div>
                <p className="text-xs text-zinc-400">
                  No database credentials, environment variable files, or port mapping to configure.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="font-semibold text-white">100% On-Premise</div>
                <p className="text-xs text-zinc-400">
                  Your code and database reside on your VPS. Zero third-party telemetry leaks.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="font-semibold text-white">True Dual-Mode</div>
                <p className="text-xs text-zinc-400">
                  Deploy to Vercel for public showcase &amp; docs, or install on a VPS for full PaaS.
                </p>
              </div>
            </div>
          </section>

          {/* Section 1: Quickstart */}
          <section id="quickstart" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Rocket className="w-4 h-4" />
              <span>QUICKSTART</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              One-Line Appliance Installation
            </h2>
            <p>
              To transform any clean Linux server into a self-contained Shipyard control plane, log in via SSH and run the following command:
            </p>

            {/* Code Box */}
            <div className="relative rounded-xl bg-black border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="text-zinc-200">bash</span>
                <span>Installs Docker, PostgreSQL 16, Redis 7, Caddy</span>
              </div>
              <div className="p-4 font-mono text-xs text-zinc-100 flex items-center justify-between gap-4 overflow-x-auto">
                <span className="text-cyan-400 font-semibold select-none">$</span>
                <code className="flex-1 text-zinc-200">{installCmd}</code>
                <button
                  onClick={() => copyCode("quickstart", installCmd)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedSection === "quickstart" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <div className="text-white font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>What Happens During the 60-Second Setup:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                <li>Detects and automatically installs Docker Engine and Compose plugins if missing.</li>
                <li>Creates persistent volumes at <code className="text-zinc-200">/var/lib/shipyard</code>.</li>
                <li>Generates a 256-bit AES cryptographic encryption key stored in a protected vault.</li>
                <li>Initializes PostgreSQL 16 and Redis 7 worker queues, executing all initial schema migrations.</li>
                <li>Creates the initial administrator account (<code className="text-zinc-200">admin@shipyard.local</code>).</li>
                <li>Launches Caddy 2 reverse proxy and displays the live Dashboard URL.</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Prerequisites */}
          <section id="prerequisites" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Cpu className="w-4 h-4" />
              <span>HARDWARE &amp; OS COMPATIBILITY</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Hardware Specifications &amp; OS Support
            </h2>
            <p>
              Shipyard was built with extreme resource efficiency in mind. The core supervisor engine consumes less than 140 MB of idle memory, allowing it to run comfortably on entry-level cloud servers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="text-zinc-400 font-medium uppercase text-[10px]">Minimum Memory</div>
                <div className="text-xl font-bold text-white">1.0 GB RAM</div>
                <div className="text-zinc-500">Supervisor + DB idle: ~220 MB.</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="text-zinc-400 font-medium uppercase text-[10px]">Processor</div>
                <div className="text-xl font-bold text-white">1 vCPU</div>
                <div className="text-zinc-500">x86_64 or ARM64 architectures.</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="text-zinc-400 font-medium uppercase text-[10px]">Storage</div>
                <div className="text-xl font-bold text-white">10 GB SSD</div>
                <div className="text-zinc-500">For OS and Docker images.</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-400 pt-2">
              <div className="text-white font-medium">Supported Operating Systems:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ubuntu 24.04 / 22.04 / 20.04 LTS",
                  "Debian 12 (Bookworm) / 11 (Bullseye)",
                  "CentOS Stream 9",
                  "Rocky Linux 9",
                  "AlmaLinux 9",
                  "Alpine Linux 3.19+",
                ].map((os, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    ✓ {os}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Dual Modes */}
          <section id="dual-modes" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <Cloud className="w-4 h-4" />
              <span>DUAL-MODE ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              One Unified Repo: Vercel vs Self-Hosted Appliance
            </h2>
            <p>
              Shipyard is designed to exist in a single repository that automatically adapts its behavior based on the hosting environment:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-cyan-400 font-semibold text-sm block">▲ Vercel Cloud Mode</span>
                <p className="text-zinc-400 leading-relaxed">
                  Automatically activated on Vercel (<code className="text-zinc-200">VERCEL=1</code>) or when <code className="text-zinc-200">SHIPYARD_MODE=public</code>:
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-400">
                  <li>Serves the public marketing landing page on <code className="text-zinc-200">/</code>.</li>
                  <li>Serves technical documentation on <code className="text-zinc-200">/docs</code>.</li>
                  <li>Dynamically generates bash installer scripts on <code className="text-zinc-200">/install.sh</code>.</li>
                  <li>Build pipeline never fails due to missing PostgreSQL or Docker engines.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-emerald-400 font-semibold text-sm block">⚓ Self-Hosted Appliance Mode</span>
                <p className="text-zinc-400 leading-relaxed">
                  Activated on your Linux VPS (<code className="text-zinc-200">SHIPYARD_MODE=appliance</code>):
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-400">
                  <li>Root route serves the full PaaS Control Plane (Dashboard, Workloads, Servers).</li>
                  <li>Directly manages Docker Engine containers, builds, and sandboxes.</li>
                  <li>Configures Caddy dynamic reverse proxy and auto Let&apos;s Encrypt SSL.</li>
                  <li>Zero mock data: real-time hardware telemetry measured via OS kernel.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Supervisor */}
          <section id="supervisor" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
              <Zap className="w-4 h-4" />
              <span>SUPERVISOR ENGINE</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Supervisor State Engine &amp; Zero-Config Lifecycle
            </h2>
            <p>
              The Shipyard supervisor coordinates startup, database schema migrations, and service heartbeats through a deterministic 6-phase state machine:
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
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Activity className="w-4 h-4" />
              <span>REAL HARDWARE TELEMETRY</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Zero-Mock Real Hardware Telemetry
            </h2>
            <p>
              Shipyard does not use placeholder or mock metrics. All telemetry shown in the dashboard is sampled directly from the Linux kernel:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-cyan-400 font-semibold block">CPU Load Calculation</span>
                <p className="text-zinc-400 leading-relaxed">
                  Samples <code className="text-zinc-200">os.cpus()</code> user/system/idle ticks across 100ms delta windows to compute exact CPU utilization per core.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-emerald-400 font-semibold block">Memory &amp; Swap</span>
                <p className="text-zinc-400 leading-relaxed">
                  Reads real kernel byte allocations via <code className="text-zinc-200">os.totalmem()</code> and <code className="text-zinc-200">os.freemem()</code> with byte-perfect precision.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Deploy Git */}
          <section id="deploy-git" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <GitBranch className="w-4 h-4" />
              <span>DEPLOYING APPLICATIONS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Deploying via Git Push Webhooks
            </h2>
            <p>
              Shipyard provides zero-downtime automated deployments triggered directly by your Git provider:
            </p>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="text-white font-semibold">Configuring GitHub / GitLab Webhooks:</div>
              <ol className="list-decimal pl-5 space-y-2 text-zinc-400">
                <li>Navigate to your GitHub repository &rarr; <strong>Settings</strong> &rarr; <strong>Webhooks</strong>.</li>
                <li>Click <strong>Add webhook</strong>.</li>
                <li>Set Payload URL to: <code className="text-zinc-200 font-mono">{currentOrigin}/api/webhooks/github</code></li>
                <li>Set Content type to: <code className="text-zinc-200 font-mono">application/json</code></li>
                <li>Select &quot;Just the push event&quot; and save.</li>
              </ol>
            </div>

            <p className="text-xs text-zinc-400">
              When a push occurs, Shipyard clones the repository into an isolated Docker build sandbox, runs database migrations, compiles production bundles, performs an HTTP health check, and shifts proxy traffic with 0ms downtime.
            </p>
          </section>

          {/* Section 7: In-Browser File Studio */}
          <section id="deploy-files" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
              <FileCode className="w-4 h-4" />
              <span>DEVELOPER STUDIO</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              In-Browser File Studio &amp; Static Apps
            </h2>
            <p>
              You do not need a Git repository to deploy with Shipyard. The built-in File Studio lets you drag and drop raw files or write code in your browser:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-400">
              <li>Upload multi-file bundles including <code className="text-zinc-200">.html, .css, .js, .json, .svg, .png</code>.</li>
              <li>Edit files in real time with syntax highlighting and automated indentation.</li>
              <li>Click &quot;Save &amp; Redeploy&quot; to instantaneously update live containers in under 250ms.</li>
              <li>Static apps are served with HTTP/2 and Brotli compression through the dynamic Caddy reverse proxy.</li>
            </ul>
          </section>

          {/* Section 8: Dockerfiles */}
          <section id="deploy-docker" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <Boxes className="w-4 h-4" />
              <span>CUSTOM CONTAINERS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Custom Dockerfiles &amp; Multi-Language Support
            </h2>
            <p>
              Shipyard automatically detects the runtime of your application:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Dockerfile First</span>
                <p className="text-zinc-400">If a Dockerfile is present, Shipyard builds it directly.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Node.js / Next.js</span>
                <p className="text-zinc-400">Detects <code className="text-zinc-200">package.json</code> and builds with Node 20 LTS.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Python / Flask / FastAPI</span>
                <p className="text-zinc-400">Detects <code className="text-zinc-200">requirements.txt</code> and runs Gunicorn / Uvicorn.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Static Web</span>
                <p className="text-zinc-400">Detects <code className="text-zinc-200">index.html</code> and serves via Caddy static engine.</p>
              </div>
            </div>
          </section>

          {/* Section 9: Worker Nodes */}
          <section id="worker-nodes" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Server className="w-4 h-4" />
              <span>CLUSTER SCALING</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Connecting Remote Worker Nodes
            </h2>
            <p>
              Scale horizontally across multiple cloud providers or on-premise servers with one command:
            </p>

            <div className="relative rounded-xl bg-black border border-zinc-800 p-4 font-mono text-xs text-zinc-100 flex items-center justify-between gap-4 overflow-x-auto">
              <span className="text-amber-400 font-semibold select-none">$</span>
              <code className="flex-1 text-zinc-200">{agentCmd}</code>
              <button
                onClick={() => copyCode("agent", agentCmd)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedSection === "agent" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              The agent creates an <strong>outbound-only TLS connection</strong> back to the leader node. You never need to open inbound firewall ports on your worker machines.
            </p>
          </section>

          {/* Section 10: Reverse Proxy & SSL */}
          <section id="reverse-proxy" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <Globe className="w-4 h-4" />
              <span>NETWORKING &amp; SSL</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Dynamic Reverse Proxy &amp; Automatic SSL
            </h2>
            <p>
              Shipyard allocates non-conflicting internal container ports from the range <code className="text-zinc-200 font-mono">30000-39999</code>. It connects each workload dynamically to the embedded Caddy reverse proxy.
            </p>
            <p>
              When you add a custom domain (e.g. <code className="text-zinc-200 font-mono">app.yourdomain.com</code>), point an A-record to your server IP. Caddy automatically requests and renews Let&apos;s Encrypt TLS certificates without manual certbot configuration.
            </p>
          </section>

          {/* Section 11: Security Vault */}
          <section id="security-vault" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-medium">
              <Lock className="w-4 h-4" />
              <span>SECURITY &amp; ENCRYPTION</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AES-256-GCM Vault &amp; Rootless Docker
            </h2>
            <p>
              All sensitive environment variables, database passwords, and cluster tokens are encrypted at rest using AES-256-GCM authenticated ciphers. Workloads execute inside isolated rootless Docker containers to prevent privilege escalation.
            </p>
          </section>

          {/* Section 12: REST API Reference */}
          <section id="api-reference" className="space-y-6 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
              <Terminal className="w-4 h-4" />
              <span>REST API REFERENCE</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Interactive System API Reference
            </h2>
            <p>
              Test live Shipyard endpoints directly from this documentation page:
            </p>

            <div className="space-y-4 text-xs font-mono">
              {/* Endpoint 1: Healthcheck */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
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
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{apiLoading["health"] ? "Fetching..." : "Test Endpoint"}</span>
                  </button>
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  Returns cluster health, uptime, and database connection status.
                </div>
                {apiResponse["health"] && (
                  <pre className="p-3.5 rounded-lg bg-black border border-zinc-800 text-emerald-400 overflow-x-auto text-[11px]">
                    {apiResponse["health"]}
                  </pre>
                )}
              </div>

              {/* Endpoint 2: System Status */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
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
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{apiLoading["status"] ? "Fetching..." : "Test Endpoint"}</span>
                  </button>
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
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

          {/* Section 13: Troubleshooting */}
          <section id="troubleshooting" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12 pb-16">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-medium">
              <HelpCircle className="w-4 h-4" />
              <span>TROUBLESHOOTING &amp; RUNBOOKS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Troubleshooting &amp; Operations
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="font-semibold text-white">How do I view live supervisor logs on the server?</div>
                <p className="text-zinc-400 font-mono text-[11px]">
                  docker logs -f shipyard-supervisor
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="font-semibold text-white">Where is application data persisted?</div>
                <p className="text-zinc-400">
                  All databases, build caches, and encrypted secrets are stored in <code className="text-zinc-200 font-mono">/var/lib/shipyard</code>. Backing up this single directory backs up your entire PaaS.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="font-semibold text-white">What if ports 80 or 443 are already in use?</div>
                <p className="text-zinc-400">
                  If another web server (e.g. Apache or Nginx) is running, stop it with <code className="text-zinc-200 font-mono">systemctl stop nginx</code> so Caddy can automatically manage incoming HTTP/HTTPS traffic.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
