"use client";

import { useState, useEffect } from "react";
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
  Layers,
  Network,
  Radio,
  Rocket,
  Server,
  Shield,
  Terminal,
  Zap,
  Code2,
  ExternalLink,
  ChevronDown,
  Activity,
  GitBranch,
  Lock,
  RefreshCw,
  Sparkles,
  Monitor,
  CheckCircle2,
} from "lucide-react";
import ShapeWaves from "@/components/ui/ShapeWaves";

export function LandingView() {
  const [copied, setCopied] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<"appliance" | "agent">("appliance");
  const [activeDemoTab, setActiveDemoTab] = useState<"deployment" | "editor" | "telemetry">("deployment");
  const [currentOrigin, setCurrentOrigin] = useState("https://shipyard.example");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const applianceCmd = `curl -fsSL ${currentOrigin}/install.sh | sh`;
  const agentCmd = `curl -fsSL ${currentOrigin}/agent_install | sh -s -- --token <YOUR_CLUSTER_TOKEN>`;
  const activeCmd = activeInstallTab === "appliance" ? applianceCmd : agentCmd;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-cyan-950 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-cyan-500/30 bg-cyan-950/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Anchor className="w-4 h-4" />
          </div>
          <span className="font-mono text-base font-bold tracking-wider text-zinc-100">
            SHIPYARD
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            PaaS Appliance v1.0
          </span>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-medium text-zinc-400">
          <Link href="/docs" className="hover:text-zinc-100 transition-colors">
            Documentation
          </Link>
          <a
            href="https://github.com/RishBroProMax/Shipyard"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-100 transition-colors hidden sm:flex items-center gap-1"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
          <Link
            href="/docs#self-hosting"
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
          >
            <span>Install on VPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section with React Bits ShapeWaves Background */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 min-h-[640px] flex flex-col items-center justify-center">
        {/* React Bits ShapeWaves Canvas Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <ShapeWaves
            shapes="mixed"
            cellSize={26}
            dotSize={0.65}
            color="#18181b"
            hoverColor="#38bdf8"
            backgroundColor="transparent"
            speed={0.9}
            scale={1.1}
            contrast={1.15}
            brightness={0.45}
            flow={0.25}
            direction={45}
            fade={0.4}
            interactive={true}
            splashRadius={160}
            splashStrength={0.85}
            glow={0.5}
            className="w-full h-full opacity-70"
          />
          {/* Radial vignettes for contrast and soft transition into body */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-transparent to-[#09090b] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(6,182,212,0.08),transparent)] pointer-events-none" />
        </div>

        {/* Hero Content (Floating above ShapeWaves) */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-7">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md text-xs font-mono text-zinc-300 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-200 font-medium">Zero-Configuration Self-Hosted PaaS</span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-400 font-mono">100% Real Hardware Telemetry</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Deploy Applications <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-cyan-400 font-mono font-medium">
              Zero Config Required.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed font-light">
            Shipyard transforms any standard Linux VPS into a self-contained developer platform. It automatically initializes PostgreSQL 16, Redis queues, Let&apos;s Encrypt SSL, and multi-node runners with zero post-deployment setup.
          </p>

          {/* Tabbed 1-Click Install Command Box */}
          <div className="max-w-xl mx-auto pt-2">
            {/* Install Tabs */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={() => setActiveInstallTab("appliance")}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeInstallTab === "appliance"
                    ? "bg-zinc-800 text-cyan-300 border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                1. VPS Appliance Install
              </button>
              <button
                onClick={() => setActiveInstallTab("agent")}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeInstallTab === "agent"
                    ? "bg-zinc-800 text-cyan-300 border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                2. Worker Node Agent
              </button>
            </div>

            {/* Command Container */}
            <div className="relative flex items-center bg-[#0d0e12]/95 border border-zinc-800 rounded-xl p-3.5 shadow-2xl backdrop-blur font-mono text-xs text-zinc-200 group hover:border-zinc-700 transition-all">
              <span className="text-cyan-500 font-bold select-none mr-2.5">$</span>
              <span className="flex-1 text-left select-all truncate text-zinc-200">
                {activeCmd}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 transition-all shadow-sm border border-zinc-700 active:scale-95 shrink-0 ml-2"
                title="Copy installation command"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 mt-3 font-mono">
              <span className="flex items-center gap-1 text-zinc-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Requires only Docker
              </span>
              <span className="flex items-center gap-1 text-zinc-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-Generated Secrets
              </span>
              <span className="flex items-center gap-1 text-zinc-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Instant SSL
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-zinc-800/60">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-center">
              <div className="text-xl font-bold font-mono text-cyan-400">60s</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Bootstrap Time</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400">0 Mock</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Real Telemetry</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-center">
              <div className="text-xl font-bold font-mono text-purple-400">100%</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Data Privacy</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-center">
              <div className="text-xl font-bold font-mono text-amber-400">AES-256</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Secret Vault</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Terminal Demonstration Preview */}
      <section className="px-6 max-w-5xl mx-auto pb-24">
        <div className="rounded-xl border border-zinc-800 bg-[#0d0e12] shadow-2xl overflow-hidden font-mono text-xs">
          {/* Header Bar with Tabs */}
          <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-zinc-400 text-[11px] hidden sm:inline">
                shipyard-core ~ live preview
              </span>
            </div>

            {/* Interactive Showcase Tabs */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveDemoTab("deployment")}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  activeDemoTab === "deployment"
                    ? "bg-zinc-800 text-cyan-400 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Git Auto-Deploy
              </button>
              <button
                onClick={() => setActiveDemoTab("editor")}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  activeDemoTab === "editor"
                    ? "bg-zinc-800 text-purple-400 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                In-Browser IDE
              </button>
              <button
                onClick={() => setActiveDemoTab("telemetry")}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  activeDemoTab === "telemetry"
                    ? "bg-zinc-800 text-emerald-400 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Hardware Telemetry
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 text-zinc-300 leading-relaxed overflow-x-auto min-h-[220px]">
            {activeDemoTab === "deployment" && (
              <div className="space-y-2">
                <div className="text-cyan-400 font-semibold">
                  [10:14:02] &gt; GitHub Webhook received: commit 8f2a1c9 &quot;feat: modernize checkout flow&quot;
                </div>
                <div className="text-zinc-400">
                  [10:14:03] Supervisor: resolving environment variables from AES-256 vault...
                </div>
                <div className="text-zinc-400">
                  [10:14:04] Runner: building isolated Docker image &apos;shipyard-app-checkout:v24&apos;...
                </div>
                <div className="text-zinc-400">
                  [10:14:07] Runner: database migrations applied cleanly (0 errors).
                </div>
                <div className="text-zinc-400">
                  [10:14:09] Healthcheck: GET /api/health returned 200 OK (latency: 2ms).
                </div>
                <div className="text-zinc-300">
                  [10:14:10] Reverse Proxy: traffic shifted dynamically to container port :30042.
                </div>
                <div className="text-emerald-400 font-bold pt-2 border-t border-zinc-900">
                  ✓ Deployment #24 LIVE in 8.2s with zero-downtime cutover.
                </div>
              </div>
            )}

            {activeDemoTab === "editor" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-[11px] text-zinc-400">
                  <span>File: src/pages/index.html</span>
                  <span className="text-purple-400 font-semibold">● Auto-Save Enabled</span>
                </div>
                <div className="text-zinc-500">// Upload static HTML, CSS &amp; JS files or edit code in browser</div>
                <div className="text-zinc-300">
                  <span className="text-cyan-400">&lt;div</span> <span className="text-amber-300">class</span>=&quot;hero-banner&quot;<span className="text-cyan-400">&gt;</span>
                </div>
                <div className="text-zinc-300 pl-4">
                  <span className="text-cyan-400">&lt;h1&gt;</span>Shipyard Live In-Browser Preview<span className="text-cyan-400">&lt;/h1&gt;</span>
                </div>
                <div className="text-zinc-300 pl-4">
                  <span className="text-cyan-400">&lt;p&gt;</span>Save and redeploy instantly with zero command-line tools.<span className="text-cyan-400">&lt;/p&gt;</span>
                </div>
                <div className="text-zinc-300">
                  <span className="text-cyan-400">&lt;/div&gt;</span>
                </div>
                <div className="text-purple-400 font-semibold pt-2 border-t border-zinc-900">
                  [Shipyard IDE] Click &apos;Save &amp; Redeploy&apos; &rarr; Caddy updates in 250ms.
                </div>
              </div>
            )}

            {activeDemoTab === "telemetry" && (
              <div className="space-y-3">
                <div className="text-zinc-400">
                  Real hardware counters sampled directly from OS kernel (`os` &amp; `process`):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="flex justify-between text-zinc-400">
                      <span>Node: local-supervisor</span>
                      <span className="text-emerald-400">ONLINE</span>
                    </div>
                    <div className="text-white font-bold text-sm mt-1">CPU Load: 8.4% (8 cores)</div>
                    <div className="text-zinc-400 text-[11px]">RAM: 4.8 GB / 16.0 GB (30%)</div>
                  </div>
                  <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800">
                    <div className="flex justify-between text-zinc-400">
                      <span>Node: worker-lon-01</span>
                      <span className="text-emerald-400">ONLINE</span>
                    </div>
                    <div className="text-white font-bold text-sm mt-1">Docker Containers: 12 Active</div>
                    <div className="text-zinc-400 text-[11px]">Net: ↓ 2.4 MB/s | ↑ 1.1 MB/s</div>
                  </div>
                </div>
                <div className="text-emerald-400 font-semibold text-[11px] pt-1">
                  ✓ Heartbeat check passed (interval: 10s, ping: 1.2ms).
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 max-w-6xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FULL PRODUCTION CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to Run Cloud Applications
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
            No complex Kubernetes manifests. No fragile SaaS dependencies. Complete privacy and zero vendor lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-cyan-500/40 transition-all group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Zero Configuration Setup</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No manual database configuration, port conflicts, or setup scripts. Shipyard automatically initializes PostgreSQL, Redis, and encryption keys on boot.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-emerald-500/40 transition-all group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Multi-Node Worker Clustering</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Scale out across unlimited servers. Join any remote VPS with one command. The agent establishes an encrypted outbound connection to execute workloads.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-purple-500/40 transition-all group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">In-Browser File Editor</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload raw HTML, CSS, and JS files or edit code directly in your browser. Click &quot;Save &amp; Redeploy&quot; to update your live app in under a second.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/40 transition-all group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Git Push Auto-Deploy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect your GitHub repository. Webhooks automatically trigger zero-downtime builds with real-time SSE terminal streaming and 1-click instant rollback.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-blue-500/40 transition-all group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Automatic SSL &amp; Domains</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dynamic port assignment (30000-39999) with integrated Caddy reverse proxy routing and automated Let&apos;s Encrypt SSL certificates for your custom domains.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-rose-500/40 transition-all group space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">AES-256-GCM Secret Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All environment variables, tokens, and database secrets are strongly encrypted at rest. Workloads run inside isolated Docker sandboxes with no root leaks.
            </p>
          </div>
        </div>
      </section>

      {/* Deployment Modes Callout */}
      <section className="px-6 max-w-5xl mx-auto pb-24">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-[#0c0d11] border border-zinc-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>UNIFIED ARCHITECTURE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
                One Repository. Dual Operating Modes.
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                Deploy this exact repository on Vercel to serve the official public showcase &amp; docs, or run the installer script on any Linux VPS to launch the full self-contained PaaS control plane.
              </p>
            </div>
            <Link
              href="/docs"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-mono font-medium shrink-0 self-start sm:self-auto transition-colors border border-zinc-700"
            >
              Read Architecture Docs &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
              <span className="text-cyan-400 font-semibold text-sm block">▲ Vercel Cloud Mode</span>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Built as a lightning-fast serverless website serving the official landing page, technical documentation, and install script endpoints (`/install.sh`, `/agent_install`).
              </p>
            </div>
            <div className="p-5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
              <span className="text-emerald-400 font-semibold text-sm block">⚓ Self-Hosted Appliance</span>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Installed on your VPS with full Docker management, in-browser file editor, dynamic reverse proxy, real-time hardware telemetry, and automated deployments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-6 max-w-5xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Shipyard Compares
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Why developers choose Shipyard over complex cloud infrastructure.
          </p>
        </div>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-300">
                  <th className="p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold text-cyan-400">Shipyard Appliance</th>
                  <th className="p-4 font-semibold text-zinc-400">Heroku / AWS</th>
                  <th className="p-4 font-semibold text-zinc-400">Kubernetes / Helm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="p-4 font-sans font-medium text-zinc-200">Setup Time</td>
                  <td className="p-4 text-emerald-400 font-bold">60 Seconds</td>
                  <td className="p-4 text-zinc-400">Hours (Complex IAM)</td>
                  <td className="p-4 text-zinc-500">Days / Weeks</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-zinc-200">Zero Mock Telemetry</td>
                  <td className="p-4 text-emerald-400 font-bold">Real Kernel Metrics</td>
                  <td className="p-4 text-zinc-400">Add-on Pricing</td>
                  <td className="p-4 text-zinc-400">Prometheus / Grafana</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-zinc-200">In-Browser File IDE</td>
                  <td className="p-4 text-emerald-400 font-bold">Built-in (Instant)</td>
                  <td className="p-4 text-zinc-500">None</td>
                  <td className="p-4 text-zinc-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-zinc-200">Multi-Node Worker Join</td>
                  <td className="p-4 text-emerald-400 font-bold">1 Token Command</td>
                  <td className="p-4 text-zinc-400">VPC Peering</td>
                  <td className="p-4 text-zinc-500">Complex Kubeadm</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-zinc-200">Cloud &amp; Appliance Dual Mode</td>
                  <td className="p-4 text-emerald-400 font-bold">Yes (Unified Repo)</td>
                  <td className="p-4 text-zinc-500">No</td>
                  <td className="p-4 text-zinc-500">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 max-w-4xl mx-auto pb-28">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Common questions about deploying and running Shipyard.
          </p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {[
            {
              q: "Can I host this on Vercel and also run on my VPS?",
              a: "Yes! Shipyard is built with a dual-operating mode architecture in a single unified repository. When deployed on Vercel, it acts as the official public showcase, documentation site, and dynamic script distributor. When installed on any Linux VPS, it unlocks the full PaaS control plane, Docker runner orchestration, in-browser file editor, and database engine.",
            },
            {
              q: "Does Shipyard require Kubernetes or heavy background processes?",
              a: "No. Shipyard is deliberately designed without Kubernetes overhead. It runs directly on Docker and a resilient lightweight Node.js supervisor, using less than 150 MB of idle RAM. It runs effortlessly on a $5/month VPS.",
            },
            {
              q: "How does the Git Push Auto-Deployment work?",
              a: "Shipyard generates a secure webhook endpoint for each project. Whenever you push code to GitHub or GitLab, the webhook receives the commit, clones the branch, builds the container in an isolated sandbox, runs health checks, and shifts traffic with zero downtime.",
            },
            {
              q: "Can I host plain HTML, CSS, and JavaScript files?",
              a: "Absolutely. You can drag and drop static website files or use Shipyard's built-in in-browser file editor to create, edit, and preview files with instant 1-click live redeployment.",
            },
            {
              q: "How do custom domains and SSL certificates work?",
              a: "Shipyard integrates directly with the Caddy web server. When you add a custom domain to any workload, Caddy automatically acquires and renews Let's Encrypt TLS certificates without any manual certbot intervention.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-800 rounded-xl bg-zinc-950/80 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-zinc-200 hover:text-white transition-colors"
              >
                <span className="font-sans font-semibold text-sm">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    openFaq === idx ? "transform rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-zinc-400 font-sans text-xs leading-relaxed border-t border-zinc-900 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 max-w-5xl mx-auto pb-28">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-zinc-950 via-[#0d1520] to-zinc-950 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight relative z-10">
            Ready to Take Control of Your Infrastructure?
          </h2>
          <p className="text-sm text-zinc-300 max-w-xl mx-auto relative z-10">
            Spin up Shipyard on your VPS right now with one command, or explore our documentation to learn about multi-node clustering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-zinc-950" />
                  <span>Command Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-950" />
                  <span>Copy 1-Line VPS Install Command</span>
                </>
              )}
            </button>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs transition-colors border border-zinc-700 text-center"
            >
              Read Full Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-10 px-6 text-center text-xs text-zinc-500 font-mono bg-[#070709]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300">
              <Anchor className="w-3.5 h-3.5" />
            </div>
            <span className="text-zinc-200 font-bold tracking-wider">SHIPYARD</span>
            <span className="text-zinc-600">|</span>
            <span>Zero-Config PaaS Appliance</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-zinc-300 transition-colors">
              Docs
            </Link>
            <Link href="/docs#self-hosting" className="hover:text-zinc-300 transition-colors">
              Install Script
            </Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">
              Appliance Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
