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
  Sliders,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  AlertCircle,
  Network,
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

  const installCmd = `curl -fsSL ${currentOrigin}/install.sh | bash`;
  const agentCmd = `curl -fsSL ${currentOrigin}/agent_install | bash -s -- --token <CLUSTER_TOKEN>`;

  const docSections: DocSection[] = [
    // Getting Started
    {
      id: "quickstart",
      category: "Getting Started",
      title: "One-Line Appliance Install",
      badge: "60s Boot",
      keywords: ["install", "curl", "quickstart", "setup", "vps", "linux", "bootstrap"],
    },
    {
      id: "interactive-setup",
      category: "Getting Started",
      title: "Interactive Email & Password Setup",
      badge: "Credentials",
      keywords: ["password", "email", "interactive", "tty", "admin", "setup", "credentials"],
    },
    {
      id: "prerequisites",
      category: "Getting Started",
      title: "System Requirements & Hardware",
      badge: "Specs",
      keywords: ["requirements", "ubuntu", "debian", "memory", "ram", "cpu", "docker"],
    },
    {
      id: "swap-guide",
      category: "Getting Started",
      title: "Low-RAM VPS & Swap Setup (Fix OOM 137)",
      badge: "Crucial",
      keywords: ["swap", "oom", "137", "ram", "low memory", "build failed", "fallocate"],
    },

    // Architecture
    {
      id: "overview",
      category: "Architecture",
      title: "Architecture Overview & Philosophy",
      badge: "Core",
      keywords: ["overview", "about", "philosophy", "architecture", "paas", "self-hosted"],
    },
    {
      id: "dual-modes",
      category: "Architecture",
      title: "Dual-Mode (Vercel vs Appliance)",
      badge: "Hybrid",
      keywords: ["vercel", "appliance", "cloud", "hybrid", "repository", "modes"],
    },
    {
      id: "supervisor",
      category: "Architecture",
      title: "Supervisor State Engine & DB",
      badge: "Engine",
      keywords: ["supervisor", "database", "postgres", "redis", "migrations", "keys"],
    },
    {
      id: "telemetry",
      category: "Architecture",
      title: "Real Kernel Telemetry (0 Mock)",
      badge: "Telemetry",
      keywords: ["telemetry", "hardware", "cpu", "ram", "metrics", "os", "proc"],
    },

    // Networking & SSL
    {
      id: "firewall-ports",
      category: "Networking & SSL",
      title: "Firewall Rules & Port Matrix",
      badge: "Firewall",
      keywords: ["firewall", "ufw", "ports", "iptables", "security group", "80", "443"],
    },
    {
      id: "port-conflicts",
      category: "Networking & SSL",
      title: "Resolving Port 80 & 443 Conflicts",
      badge: "Runbook",
      keywords: ["port conflict", "apache", "nginx", "bind", "address in use", "80", "443"],
    },
    {
      id: "reverse-proxy",
      category: "Networking & SSL",
      title: "Caddy Dynamic Proxy & Auto-SSL",
      badge: "Let's Encrypt",
      keywords: ["domains", "ssl", "caddy", "reverse-proxy", "https", "certificates", "cloudflare"],
    },

    // Deploying Applications
    {
      id: "deploy-git",
      category: "Deploying Applications",
      title: "Deploying from Git & Webhooks",
      badge: "CI/CD",
      keywords: ["git", "github", "webhook", "ci", "cd", "sse", "stream", "rollback"],
    },
    {
      id: "deploy-files",
      category: "Deploying Applications",
      title: "In-Browser File Studio",
      badge: "Web IDE",
      keywords: ["editor", "html", "css", "js", "static", "upload", "files", "browser"],
    },
    {
      id: "deploy-docker",
      category: "Deploying Applications",
      title: "Dockerfiles & Buildpacks",
      badge: "Containers",
      keywords: ["dockerfile", "container", "node", "python", "go", "nextjs"],
    },
    {
      id: "security-vault",
      category: "Deploying Applications",
      title: "AES-256 Secret Vault",
      badge: "AES-256",
      keywords: ["security", "vault", "encryption", "aes", "gcm", "isolation", "env"],
    },

    // Cluster & Operations
    {
      id: "worker-nodes",
      category: "Cluster & Operations",
      title: "Connecting Remote Worker Nodes",
      badge: "Multi-Node",
      keywords: ["worker", "nodes", "cluster", "scaling", "agent", "remote", "mesh"],
    },
    {
      id: "password-reset",
      category: "Cluster & Operations",
      title: "Admin Password Reset via CLI",
      badge: "Admin",
      keywords: ["reset password", "admin", "forgot password", "cli", "credential"],
    },
    {
      id: "backup-recovery",
      category: "Cluster & Operations",
      title: "Disaster Recovery & Backups",
      badge: "Backup",
      keywords: ["backup", "restore", "disaster", "migration", "data", "tar"],
    },
    {
      id: "updates",
      category: "Cluster & Operations",
      title: "Upgrading Shipyard Without Downtime",
      badge: "Updates",
      keywords: ["upgrade", "update", "git pull", "docker", "new release"],
    },

    // Troubleshooting & Error Recovery
    {
      id: "selfhost-errors",
      category: "Troubleshooting & Recovery",
      title: "The Self-Host Error Reference Guide",
      badge: "Diagnostic",
      keywords: ["error", "troubleshooting", "failed", "exit code", "oom", "postgres", "ssl"],
    },
    {
      id: "diagnostic-commands",
      category: "Troubleshooting & Recovery",
      title: "Essential CLI Diagnostics Cheat-Sheet",
      badge: "CLI",
      keywords: ["commands", "docker logs", "netstat", "journalctl", "lsof", "curl"],
    },
    {
      id: "api-reference",
      category: "Troubleshooting & Recovery",
      title: "Interactive Live API Diagnostics",
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
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-medium">
                Production Docs
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <a
            href="https://github.com/RishBroProMax/Shipyard"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
        </div>
      </header>

      {/* Main Documentation Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:overflow-y-auto pr-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides, errors, configs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Table of Contents by Category */}
          <div className="space-y-5 text-xs">
            {Object.entries(categories).map(([cat, sections]) => (
              <div key={cat} className="space-y-1.5">
                <div className="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider px-2">
                  {cat}
                </div>
                <div className="space-y-0.5">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={() => setActiveSection(sec.id)}
                      className={`px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors group ${
                        activeSection === sec.id
                          ? "bg-cyan-950/50 text-cyan-300 border border-cyan-800/40 font-medium"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      {sec.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 group-hover:text-zinc-300 font-mono">
                          {sec.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 min-w-0 space-y-16 pb-24 text-sm text-zinc-300 leading-relaxed font-sans">
          {/* ================================================================
              SECTION 1: QUICKSTART
             ================================================================ */}
          <section id="quickstart" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Rocket className="w-4 h-4" />
              <span>GETTING STARTED</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One-Line Appliance Installation
            </h1>
            <p className="text-zinc-300">
              Shipyard turns any clean Linux VPS into a self-contained PaaS in under 60 seconds. The installer automatically provisions Docker, sets up isolated PostgreSQL 16 and Redis 7 containers, configures Caddy 2 for automated Let&apos;s Encrypt SSL, and starts the Next.js control plane.
            </p>

            <div className="relative p-4 rounded-xl bg-black border border-zinc-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-900">
                <span>Interactive VPS Installer (asks for email &amp; password in terminal):</span>
                <button
                  onClick={() => copyCode("cmd-quickstart", installCmd)}
                  className="hover:text-zinc-200 flex items-center gap-1"
                >
                  {copiedSection === "cmd-quickstart" ? (
                    <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-cyan-400 select-all">$ {installCmd}</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Headless / Scripted Mode (CI/CD, cloud-init, Ansible, Terraform)</span>
              </div>
              <p className="text-zinc-400">
                To bypass interactive prompts and provision unattended nodes, supply CLI flags:
              </p>
              <pre className="p-3 bg-black rounded border border-zinc-800 text-zinc-300 overflow-x-auto text-[11px]">
                {`curl -fsSL ${currentOrigin}/install.sh | bash -s -- \\
  --email admin@mycompany.com \\
  --password "MyStrongSecretPass123" \\
  --port 3000 \\
  --non-interactive`}
              </pre>
            </div>
          </section>

          {/* ================================================================
              SECTION 2: INTERACTIVE SETUP
             ================================================================ */}
          <section id="interactive-setup" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>SETUP WORKFLOW</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Interactive Email &amp; Password Prompts
            </h2>
            <p>
              When executed in a terminal, <code className="text-cyan-300 font-mono">install.sh</code> detects the active TTY device (<code className="text-cyan-300 font-mono">/dev/tty</code>) even when piped through <code className="text-cyan-300 font-mono">curl | bash</code>. It safely requests your desired credentials:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Admin Email Prompt</span>
                </div>
                <p className="text-zinc-400 font-sans">
                  Defaults to <code className="text-zinc-200">admin@shipyard.local</code> if left blank, or you can enter your team email address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Admin Password Prompt</span>
                </div>
                <p className="text-zinc-400 font-sans">
                  Typing is hidden (<code className="text-zinc-200">stty -echo</code>). If you press Enter without typing a password, Shipyard automatically generates a cryptographically secure 20-character password.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200 space-y-1">
              <div className="font-semibold text-white">Where are credentials stored?</div>
              <p>
                Credentials are saved with restrictive file permissions (<code className="font-mono text-cyan-300">chmod 0600</code>) on the host filesystem at:
              </p>
              <code className="block bg-black/60 p-2 rounded text-zinc-300 font-mono">
                /var/lib/shipyard/data/secrets/shipyard.secret.json
              </code>
            </div>
          </section>

          {/* ================================================================
              SECTION 3: SYSTEM REQUIREMENTS & SPECS
             ================================================================ */}
          <section id="prerequisites" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>HARDWARE REQUIREMENTS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              System Specs &amp; Linux Compatibility
            </h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#0c0d12]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-300 font-semibold">
                    <th className="p-3.5">Component</th>
                    <th className="p-3.5">Minimum Requirements</th>
                    <th className="p-3.5 text-cyan-400">Recommended for Production</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
                  <tr>
                    <td className="p-3.5 font-sans font-medium text-white">Operating System</td>
                    <td className="p-3.5">Ubuntu 20.04+, Debian 11+, CentOS 8+</td>
                    <td className="p-3.5 text-emerald-400">Ubuntu 22.04 LTS or 24.04 LTS</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-sans font-medium text-white">Processor (CPU)</td>
                    <td className="p-3.5">1 vCPU (x86_64 or ARM64)</td>
                    <td className="p-3.5 text-emerald-400">2 - 4 vCPUs</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-sans font-medium text-white">Physical Memory (RAM)</td>
                    <td className="p-3.5">512 MB (with swap enabled)</td>
                    <td className="p-3.5 text-emerald-400">2 GB – 4 GB RAM</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-sans font-medium text-white">Storage</td>
                    <td className="p-3.5">10 GB SSD / NVMe</td>
                    <td className="p-3.5 text-emerald-400">40 GB+ NVMe SSD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ================================================================
              SECTION 4: LOW-RAM VPS & SWAP GUIDE (CRUCIAL)
             ================================================================ */}
          <section id="swap-guide" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>CRUCIAL FOR 1GB / 2GB VPS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Low-RAM VPS &amp; Swap Setup (Fix Exit 137 OOM)
            </h2>
            <p>
              When building modern applications (like Next.js, Webpack, or compiling Rust/Go Docker images), the compiler can momentarily consume 1.2GB–1.8GB of RAM. If your VPS has 1GB RAM without swap, the Linux kernel&apos;s Out-of-Memory Killer will abruptly kill the build process with <code className="text-rose-400 font-mono">exit status 137</code>.
            </p>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
              <div className="font-semibold text-amber-300">Run this 3-command recipe to create a 2GB swap file:</div>
              <pre className="p-3 bg-black rounded border border-zinc-800 text-zinc-200 overflow-x-auto font-mono text-[11px]">
{`sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab`}
              </pre>
              <p className="text-zinc-400 text-[11px]">
                Verify with <code className="text-zinc-200">free -h</code>. You will now see 2.0Gi of swap available, completely eliminating OOM 137 build crashes!
              </p>
            </div>
          </section>

          {/* ================================================================
              SECTION 5: ARCHITECTURE OVERVIEW
             ================================================================ */}
          <section id="overview" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>CORE ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Architecture Overview &amp; Philosophy
            </h2>
            <p>
              Shipyard is engineered with zero runtime magic. It uses native industry-standard tools instead of proprietary daemon layers:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-300">
              <li><strong className="text-white">Docker Engine:</strong> Provides sandboxing and process isolation.</li>
              <li><strong className="text-white">Caddy 2 Reverse Proxy:</strong> Hot-reloads routes without dropping TCP connections, automatically handling HTTP/3 QUIC and ACME Let&apos;s Encrypt issuance.</li>
              <li><strong className="text-white">PostgreSQL 16 &amp; JSON Store:</strong> Dual storage with automated fallback ensures zero database lockups or boot failures.</li>
              <li><strong className="text-white">Redis 7:</strong> Background event queues and session cache.</li>
            </ul>
          </section>

          {/* ================================================================
              SECTION 6: FIREWALL RULES & PORT MATRIX
             ================================================================ */}
          <section id="firewall-ports" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Network className="w-4 h-4" />
              <span>NETWORK CONFIGURATION</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Firewall Rules &amp; Port Matrix
            </h2>
            <p>
              Ensure the following ports are open on your host firewall (UFW / iptables) and cloud provider security group (Hetzner, AWS EC2, DigitalOcean):
            </p>

            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#0c0d12]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-300 font-semibold">
                    <th className="p-3">Port</th>
                    <th className="p-3">Protocol</th>
                    <th className="p-3">Service / Purpose</th>
                    <th className="p-3">Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  <tr>
                    <td className="p-3 text-cyan-400">80</td>
                    <td className="p-3">TCP</td>
                    <td className="p-3 font-sans">HTTP &amp; Let&apos;s Encrypt ACME challenge verification</td>
                    <td className="p-3 text-emerald-400 font-sans">Public (Required)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-400">443</td>
                    <td className="p-3">TCP / UDP</td>
                    <td className="p-3 font-sans">HTTPS &amp; HTTP/3 QUIC client traffic</td>
                    <td className="p-3 text-emerald-400 font-sans">Public (Required)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-400">3000</td>
                    <td className="p-3">TCP</td>
                    <td className="p-3 font-sans">Shipyard Web Dashboard UI (control plane)</td>
                    <td className="p-3 font-sans text-zinc-400">Public or VPN</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-400">30000–39999</td>
                    <td className="p-3">TCP</td>
                    <td className="p-3 font-sans">Internal workload containers (routed via Caddy)</td>
                    <td className="p-3 text-zinc-500 font-sans">Internal only</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="font-semibold text-white">Recommended UFW setup command:</div>
              <pre className="p-3 bg-black rounded border border-zinc-800 text-zinc-200 font-mono text-[11px]">
{`sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw allow 3000/tcp
sudo ufw enable`}
              </pre>
            </div>
          </section>

          {/* ================================================================
              SECTION 7: RESOLVING PORT 80 & 443 CONFLICTS
             ================================================================ */}
          <section id="port-conflicts" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>CONFLICT RESOLUTION</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Resolving Port 80 &amp; 443 Conflicts
            </h2>
            <p>
              If your VPS previously had Apache, Nginx, or another web server installed, Caddy will fail to bind with:
              <br />
              <code className="text-rose-400 font-mono text-xs">bind: address already in use :80 / :443</code>.
            </p>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
              <div className="font-semibold text-white">Step 1: Check what is occupying port 80 / 443</div>
              <pre className="p-2.5 bg-black rounded border border-zinc-800 text-cyan-300 font-mono text-[11px]">
sudo lsof -i :80 -i :443
# OR
sudo netstat -tulpn | grep -E ":(80|443)"
              </pre>

              <div className="font-semibold text-white pt-2">Step 2: Stop and disable the conflicting services</div>
              <pre className="p-2.5 bg-black rounded border border-zinc-800 text-cyan-300 font-mono text-[11px]">
# If Apache is running:
sudo systemctl stop apache2 && sudo systemctl disable apache2

# If standalone Nginx is running:
sudo systemctl stop nginx && sudo systemctl disable nginx
              </pre>

              <div className="font-semibold text-white pt-2">Step 3: Restart Shipyard Caddy proxy container</div>
              <pre className="p-2.5 bg-black rounded border border-zinc-800 text-emerald-400 font-mono text-[11px]">
cd /var/lib/shipyard/source
docker compose restart shipyard-proxy
              </pre>
            </div>
          </section>

          {/* ================================================================
              SECTION 8: CADDY DYNAMIC PROXY & AUTO-SSL
             ================================================================ */}
          <section id="reverse-proxy" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>SSL &amp; PROXY</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Dynamic Caddy Proxy, Custom Domains &amp; Cloudflare
            </h2>
            <p>
              Every time you add a custom domain to a project in the Shipyard dashboard, Shipyard writes the route to <code className="text-cyan-300 font-mono">/var/lib/shipyard/data/caddy/Caddyfile</code> and triggers a non-disruptive hot-reload.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="font-semibold text-white">Direct DNS (Standard)</div>
                <p className="text-zinc-400">
                  Create an <strong className="text-zinc-200">A Record</strong> pointing your domain (e.g., <code className="text-cyan-300">api.domain.com</code>) to your VPS IP address. Let&apos;s Encrypt will automatically issue valid certificates in &lt;10 seconds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="font-semibold text-white">Using Cloudflare DNS &amp; CDN</div>
                <p className="text-zinc-400">
                  If using Cloudflare with Orange Cloud (Proxy enabled), set your Cloudflare SSL/TLS encryption mode to <strong className="text-cyan-300">Full (Strict)</strong>. Setting it to Flexible will cause redirect loop errors!
                </p>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION 9: ADMIN PASSWORD RESET RUNBOOK
             ================================================================ */}
          <section id="password-reset" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>OPERATIONS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Resetting Forgotten Admin Passwords
            </h2>
            <p>
              If you ever forget your admin login or get locked out, you can instantly reset the password from your VPS terminal using our built-in appliance tool:
            </p>

            <div className="p-4 rounded-xl bg-black border border-zinc-800 text-xs font-mono space-y-2">
              <div className="text-zinc-400">// Run on the host VPS:</div>
              <div className="text-cyan-400">
                cd /var/lib/shipyard/source
              </div>
              <div className="text-cyan-400">
                node scripts/init-appliance.js --reset-password &lt;admin-email&gt; &lt;new-password&gt;
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              This command directly calculates a new salt, hashes the password via bcrypt (cost factor 12), invalidates all existing sessions for safety, and updates the local credentials file.
            </p>
          </section>

          {/* ================================================================
              SECTION 10: DISASTER RECOVERY & BACKUPS
             ================================================================ */}
          <section id="backup-recovery" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <HardDrive className="w-4 h-4" />
              <span>DISASTER RECOVERY</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              3-Minute Backup, Restore &amp; Migration
            </h2>
            <p>
              Because Shipyard is fully self-contained in <code className="text-cyan-300 font-mono">/var/lib/shipyard/data</code>, migration to a new server or taking disaster recovery snapshots is trivial:
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="text-white font-semibold font-sans">To Create a Full Backup Archive:</div>
                <pre className="p-2.5 bg-black rounded border border-zinc-800 text-cyan-300 text-[11px]">
sudo tar -czvf /root/shipyard-backup-$(date +%F).tar.gz /var/lib/shipyard/data
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="text-white font-semibold font-sans">To Restore on a Fresh Server:</div>
                <pre className="p-2.5 bg-black rounded border border-zinc-800 text-emerald-400 text-[11px]">
sudo mkdir -p /var/lib/shipyard
sudo tar -xzvf /root/shipyard-backup-*.tar.gz -C /
curl -fsSL https://shipyard.example/install.sh | bash
                </pre>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION 11: THE DEFINITIVE ERROR REFERENCE GUIDE
             ================================================================ */}
          <section id="selfhost-errors" className="space-y-6 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>SELF-HOST TROUBLESHOOTING</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              The Self-Host Error Reference &amp; Recovery Guide
            </h2>
            <p>
              Diagnose and solve every known edge-case and environment fault with verified terminal recipes.
            </p>

            <div className="space-y-4 text-xs">
              {/* Error 1: Port bind */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 font-mono text-sm">
                    ERROR: bind: address already in use (80 / 443)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px]">High Frequency</span>
                </div>
                <p className="text-zinc-400">
                  <strong className="text-zinc-200">Root Cause:</strong> Apache, default Nginx, or an old Caddy process is already holding TCP port 80 or 443.
                </p>
                <div className="p-3 bg-black rounded border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  # Find process PID: <br />
                  sudo lsof -i :80 -i :443 <br />
                  # Disable conflicting web servers: <br />
                  sudo systemctl stop apache2 nginx 2&gt;/dev/null || true <br />
                  sudo systemctl disable apache2 nginx 2&gt;/dev/null || true <br />
                  cd /var/lib/shipyard/source &amp;&amp; docker compose restart shipyard-proxy
                </div>
              </div>

              {/* Error 2: Docker Socket Permission */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 font-mono text-sm">
                    ERROR: permission denied while connecting to Docker daemon socket
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">Permission</span>
                </div>
                <p className="text-zinc-400">
                  <strong className="text-zinc-200">Root Cause:</strong> The active user does not belong to the <code className="text-zinc-200">docker</code> group or <code className="text-zinc-200">/var/run/docker.sock</code> permissions are restricted.
                </p>
                <div className="p-3 bg-black rounded border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  sudo usermod -aG docker $USER <br />
                  sudo chmod 666 /var/run/docker.sock
                </div>
              </div>

              {/* Error 3: Build killed exit 137 */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 font-mono text-sm">
                    ERROR: build failed with exit status 137 (OOM Killer)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px]">Memory Exhaustion</span>
                </div>
                <p className="text-zinc-400">
                  <strong className="text-zinc-200">Root Cause:</strong> The VPS ran out of physical memory during compilation and the Linux kernel terminated the process.
                </p>
                <div className="p-3 bg-black rounded border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  # Enable 2GB swap space: <br />
                  sudo fallocate -l 2G /swapfile &amp;&amp; sudo chmod 600 /swapfile &amp;&amp; sudo mkswap /swapfile &amp;&amp; sudo swapon /swapfile
                </div>
              </div>

              {/* Error 4: PostgreSQL startup */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 font-mono text-sm">
                    ERROR: PostgreSQL connection refused / pg_isready timeout
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">Database</span>
                </div>
                <p className="text-zinc-400">
                  <strong className="text-zinc-200">Root Cause:</strong> Database volume initialization permissions or old lock file in postgres data volume.
                </p>
                <div className="p-3 bg-black rounded border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  # Inspect postgres container logs: <br />
                  cd /var/lib/shipyard/source &amp;&amp; docker compose logs shipyard-db <br />
                  # Reset postgres container if corrupt: <br />
                  docker compose restart shipyard-db
                </div>
              </div>

              {/* Error 5: ACME Challenge Failure */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 font-mono text-sm">
                    ERROR: ACME challenge failed / Let&apos;s Encrypt rate limit or timeout
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">Certificates</span>
                </div>
                <p className="text-zinc-400">
                  <strong className="text-zinc-200">Root Cause:</strong> Port 80 is blocked by a firewall, DNS A-record has not propagated, or Cloudflare SSL is set to Flexible.
                </p>
                <div className="p-3 bg-black rounded border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                  # Verify domain resolves to this VPS: <br />
                  dig +short A yourdomain.com <br />
                  # Verify port 80 is reachable from the outside world: <br />
                  curl -I http://yourdomain.com/.well-known/acme-challenge/test
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION 12: ESSENTIAL CLI DIAGNOSTIC CHEAT SHEET
             ================================================================ */}
          <section id="diagnostic-commands" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>OPERATIONS TOOLKIT</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Essential CLI Diagnostics Cheat-Sheet
            </h2>
            <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-[#0c0d12] text-xs font-mono">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 font-sans mr-2">Stream app logs:</span>
                  <span className="text-white">docker compose -f /var/lib/shipyard/source/docker-compose.yml logs -f shipyard-app</span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 font-sans mr-2">Check proxy logs:</span>
                  <span className="text-white">docker compose -f /var/lib/shipyard/source/docker-compose.yml logs -f shipyard-proxy</span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 font-sans mr-2">Check appliance health:</span>
                  <span className="text-white">curl -s http://localhost:3000/api/health | jq .</span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 font-sans mr-2">Worker agent status:</span>
                  <span className="text-white">sudo systemctl status shipyard-agent</span>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================
              SECTION 13: LIVE REST API EXPLORER
             ================================================================ */}
          <section id="api-reference" className="space-y-6 scroll-mt-24 border-t border-zinc-800/80 pt-12">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>LIVE INTERACTION</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Interactive System API Diagnostics
            </h2>
            <p>
              Execute real live queries against your Shipyard control plane right here:
            </p>

            <div className="space-y-4 text-xs font-mono">
              {/* Endpoint 1: Health */}
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
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{apiLoading["health"] ? "Testing..." : "Test Health Endpoint"}</span>
                  </button>
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  Returns cluster health status, uptime, host architecture, and online node counts.
                </div>
                {apiResponse["health"] && (
                  <pre className="p-3.5 rounded-lg bg-black border border-zinc-800 text-emerald-400 overflow-x-auto text-[11px]">
                    {apiResponse["health"]}
                  </pre>
                )}
              </div>

              {/* Endpoint 2: Status */}
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
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{apiLoading["status"] ? "Testing..." : "Test Status Endpoint"}</span>
                  </button>
                </div>
                <div className="text-zinc-400 text-[11px] font-sans">
                  Returns real host telemetry: CPU load, RAM allocation, storage, and active Caddy proxy routes.
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
