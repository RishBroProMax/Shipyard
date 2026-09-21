"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Check,
  Copy,
  Cpu,
  Database,
  FileCode,
  Globe,
  HardDrive,
  Network,
  Radio,
  Rocket,
  Server,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  const installCmd = "curl -fsSL https://shipyard.example/install.sh | sh";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-100">
            <Anchor className="w-4 h-4 text-zinc-200" />
          </div>
          <span className="font-mono text-base font-bold tracking-wider text-zinc-100">
            SHIPYARD
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
            PaaS Appliance
          </span>
        </div>

        <nav className="flex items-center gap-6 text-xs font-medium text-zinc-400">
          <Link href="/docs" className="hover:text-zinc-100 transition-colors">
            Documentation
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-100 transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/"
            className="px-3.5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Zero-Configuration Self-Hosted PaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Deploy Your Applications. <br />
          <span className="text-zinc-400 font-mono font-medium">Zero Configuration Required.</span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Shipyard transforms any fresh Linux VPS into a self-contained developer platform. It automatically initializes PostgreSQL, Redis, job queues, reverse proxy, and deployment agents with zero post-deployment setup.
        </p>

        {/* 1-Click Install Command Box */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg p-3.5 shadow-2xl font-mono text-xs text-zinc-200">
            <span className="text-zinc-600 select-none mr-2">$</span>
            <span className="flex-1 text-left select-all">{installCmd}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">
            Requires only Docker. Generates all internal credentials &amp; secrets automatically.
          </p>
        </div>
      </section>

      {/* Interactive Terminal Demonstration Preview */}
      <section className="px-6 max-w-5xl mx-auto pb-20">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-2xl overflow-hidden font-mono text-xs">
          <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              <span className="ml-2 text-zinc-400 text-[11px]">shipyard-cluster ~ telemetry</span>
            </div>
            <span className="text-[11px] text-emerald-400">● 100% HEALTHY</span>
          </div>
          <div className="p-6 space-y-2 text-zinc-300 leading-relaxed overflow-x-auto">
            <div className="text-cyan-400">[Shipyard Supervisor] First boot detected! Initializing appliance...</div>
            <div className="text-zinc-400">✓ Generating 256-bit AES-256-GCM master encryption key</div>
            <div className="text-zinc-400">✓ Initializing PostgreSQL 16 &amp; executing schema migrations</div>
            <div className="text-zinc-400">✓ Spawning Redis 7 worker queue &amp; Caddy dynamic reverse proxy</div>
            <div className="text-zinc-400">✓ Seeding initial administrator account: admin@shipyard.local</div>
            <div className="text-zinc-400">✓ Registering default Local Host worker node</div>
            <div className="text-emerald-400 font-semibold pt-2">
              Shipyard installed successfully. Dashboard: http://YOUR_SERVER_IP:3000
            </div>
            <div className="text-zinc-500 pt-2 border-t border-zinc-900">
              Cluster Node [worker-01]: CPU: 12.4% | RAM: 3.2/16 GB | Net: ↓ 142 KB/s ↑ 68 KB/s
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 max-w-6xl mx-auto pb-24 border-t border-zinc-800/80 pt-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Developers Who Value Simplicity &amp; Speed
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            No complex Kubernetes YAMLs. No fragile third-party SaaS dependencies. Complete control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Zero Configuration</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No manual database credentials, ports, or migration commands. Shipyard handles all internal setup on first startup and never wipes state.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Multi-Node Clustering</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Join any remote VPS, server, or PC with a single command. The agent connects outbound, authenticates, and reports live CPU, RAM, Disk, and Network I/O.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <FileCode className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">In-Browser File Editor</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload HTML, CSS, and JS files directly or edit code inside the dashboard. Click &ldquo;Save &amp; Redeploy&rdquo; to update your live app instantaneously.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Terminal className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Git Push Auto-Deploy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect your GitHub repository. Webhooks automatically trigger zero-downtime builds with real-time SSE terminal streaming and 1-click rollback.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Dynamic Reverse Proxy &amp; SSL</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dynamic port allocation (30000-39999) and automatic Caddy reverse proxy routing with automated Let&apos;s Encrypt SSL certificates for custom domains.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">AES-256 Secret Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Environment variables are encrypted at rest using AES-256-GCM. Untrusted code executes exclusively inside isolated Docker worker sandboxes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 px-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-300 font-semibold">SHIPYARD</span>
            <span>— The Zero-Config Developer Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-zinc-300">
              Documentation
            </Link>
            <Link href="/login" className="hover:text-zinc-300">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
