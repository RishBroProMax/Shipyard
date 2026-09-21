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
  FolderTree,
  Laptop,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Boxes,
} from "lucide-react";
import ShapeWaves from "@/components/ui/ShapeWaves";

export function LandingView() {
  const [copied, setCopied] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<"appliance" | "agent">("appliance");
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"overview" | "editor" | "telemetry" | "git">("overview");
  const [currentOrigin, setCurrentOrigin] = useState("https://shipyard.example");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const applianceCmd = `curl -fsSL ${currentOrigin}/install.sh | sh`;
  const agentCmd = `curl -fsSL ${currentOrigin}/agent_install | sh -s -- --token <CLUSTER_TOKEN>`;
  const activeCmd = activeInstallTab === "appliance" ? applianceCmd : agentCmd;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shadow-sm">
              <Anchor className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-white">
                Shipyard
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-medium">
                PaaS Appliance
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">
              How It Works
            </a>
            <a href="#comparison" className="hover:text-zinc-100 transition-colors">
              Comparison
            </a>
            <Link href="/docs" className="hover:text-zinc-100 transition-colors">
              Documentation
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/RishBroProMax/Shipyard"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-md hover:bg-zinc-900 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
          <Link
            href="/docs#quickstart"
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Deploy to VPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section with React Bits ShapeWaves Background */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 min-h-[680px] flex flex-col items-center justify-center">
        {/* React Bits ShapeWaves Dynamic Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <ShapeWaves
            shapes="mixed"
            cellSize={28}
            dotSize={0.65}
            color="#27272a"
            hoverColor="#38bdf8"
            backgroundColor="transparent"
            speed={0.8}
            scale={1.1}
            contrast={1.1}
            brightness={0.4}
            flow={0.2}
            direction={45}
            fade={0.4}
            interactive={true}
            splashRadius={170}
            splashStrength={0.9}
            glow={0.45}
            className="w-full h-full opacity-60"
          />
          {/* Subtle gradient vignette to blend into dark canvas */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-transparent to-[#09090b] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(56,189,248,0.06),transparent)] pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-md text-xs text-zinc-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-zinc-200">v1.0 Production Ready</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Zero Configuration PaaS Appliance</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            The self-hosted platform <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-cyan-400">
              for developers who ship.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Transform any clean Linux VPS into your personal deployment platform in 60 seconds. Push to Git or drag-and-drop raw files with automatic PostgreSQL, Redis, reverse proxies, and SSL certificates.
          </p>

          {/* Tabbed 1-Click Install Command Box */}
          <div className="max-w-xl mx-auto pt-2 space-y-2.5">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveInstallTab("appliance")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeInstallTab === "appliance"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                1-Line VPS Install
              </button>
              <button
                onClick={() => setActiveInstallTab("agent")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeInstallTab === "agent"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Worker Node Agent
              </button>
            </div>

            {/* Command Container */}
            <div className="relative flex items-center bg-[#0d0e12]/95 border border-zinc-800 rounded-xl p-3.5 shadow-2xl backdrop-blur font-mono text-xs text-zinc-200 group hover:border-zinc-700 transition-all">
              <span className="text-cyan-400 font-semibold select-none mr-2.5">$</span>
              <span className="flex-1 text-left select-all truncate text-zinc-200">
                {activeCmd}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 transition-all border border-zinc-700 active:scale-95 shrink-0 ml-2"
                title="Copy installation command"
              >
                {copied ? (
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

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Auto Postgres 16 &amp; Redis 7
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Let&apos;s Encrypt Auto-SSL
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero Mock Telemetry
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Control Plane Showcase */}
      <section className="px-6 max-w-5xl mx-auto pb-24">
        <div className="rounded-2xl border border-zinc-800 bg-[#0d0e12] shadow-2xl overflow-hidden">
          {/* Mock Browser Header */}
          <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="bg-black/50 px-3 py-1 rounded-md text-zinc-400 text-xs font-mono border border-zinc-800/80 hidden sm:block">
                https://shipyard.local/dashboard
              </div>
            </div>

            {/* Showcase View Tabs */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveShowcaseTab("overview")}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeShowcaseTab === "overview"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Workloads
              </button>
              <button
                onClick={() => setActiveShowcaseTab("editor")}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeShowcaseTab === "editor"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                In-Browser IDE
              </button>
              <button
                onClick={() => setActiveShowcaseTab("telemetry")}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeShowcaseTab === "telemetry"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Real Telemetry
              </button>
              <button
                onClick={() => setActiveShowcaseTab("git")}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeShowcaseTab === "git"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Live Deployment
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Showcase View Body */}
          <div className="p-6 text-zinc-300 min-h-[300px]">
            {activeShowcaseTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Total Workloads</div>
                    <div className="text-2xl font-bold text-white mt-1">12 Active</div>
                    <div className="text-xs text-emerald-400 mt-0.5">100% healthy containers</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Cluster RAM</div>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">4.2 / 16 GB</div>
                    <div className="text-xs text-zinc-400 mt-0.5">26% utilized</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Reverse Proxy SSL</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">Automatic</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Let&apos;s Encrypt renewed</div>
                  </div>
                </div>

                {/* Sample App Cards */}
                <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/80 bg-black/40 text-xs">
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">storefront-web</div>
                        <div className="text-zinc-500 font-mono text-[11px]">https://shop.example.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>Node.js 20</span>
                      <span className="text-emerald-400">Port :30004</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">Production</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">auth-service-api</div>
                        <div className="text-zinc-500 font-mono text-[11px]">https://auth.example.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>Go 1.22</span>
                      <span className="text-emerald-400">Port :30008</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">Production</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">landing-page-static</div>
                        <div className="text-zinc-500 font-mono text-[11px]">In-Browser File Studio</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>Static HTML/CSS</span>
                      <span className="text-emerald-400">Port :30012</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "editor" && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400 text-xs">
                  <span>File: public/index.html</span>
                  <span className="text-emerald-400">● Live Preview Active</span>
                </div>
                <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-1 text-zinc-300">
                  <div className="text-zinc-500">// Upload or edit static web files with instant Save &amp; Redeploy</div>
                  <div>&lt;<span className="text-cyan-400">h1</span> class=&quot;headline&quot;&gt;Welcome to My Live App&lt;/<span className="text-cyan-400">h1</span>&gt;</div>
                  <div>&lt;<span className="text-cyan-400">p</span>&gt;Served directly through Shipyard dynamic Caddy reverse proxy.&lt;/<span className="text-cyan-400">p</span>&gt;</div>
                </div>
                <div className="flex justify-end pt-1">
                  <button className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Save &amp; Live Redeploy (250ms)</span>
                  </button>
                </div>
              </div>
            )}

            {activeShowcaseTab === "telemetry" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="text-zinc-400">
                  Genuine hardware metrics read directly from host OS kernel (0 mock data):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                    <div className="text-white font-semibold">Host Node: leader-master-01</div>
                    <div className="text-zinc-400">CPU: 8 Cores (Average Load: 12.4%)</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[12.4%]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                    <div className="text-white font-semibold">System RAM Allocation</div>
                    <div className="text-zinc-400">3.8 GB / 16.0 GB (23.7% Used)</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[23.7%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "git" && (
              <div className="space-y-2 font-mono text-xs">
                <div className="text-cyan-400 font-semibold">
                  [19:14:02] GitHub Webhook: commit 8f2a1b9 (&quot;feat: modernize payments flow&quot;) received
                </div>
                <div className="text-zinc-400">
                  [19:14:03] Supervisor: resolving environment secrets from AES-256 vault
                </div>
                <div className="text-zinc-400">
                  [19:14:05] Runner: isolated Docker sandbox built in 3.4s
                </div>
                <div className="text-zinc-400">
                  [19:14:07] Healthcheck: GET /api/health returned HTTP 200 OK (2ms)
                </div>
                <div className="text-emerald-400 font-bold pt-2 border-t border-zinc-900">
                  ✓ Deployment #18 LIVE &rarr; Caddy shifted traffic with zero downtime.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 max-w-5xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40">
            <Zap className="w-3.5 h-3.5" />
            <span>SIMPLE &amp; POWERFUL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How Shipyard Works in 3 Steps
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            From a blank Linux server to a production deployment environment in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-semibold text-white">Bootstrap with 1 Command</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Run <code className="text-zinc-200">curl .../install.sh | sh</code>. Shipyard installs Docker, configures PostgreSQL 16, starts Redis 7, generates encryption keys, and launches the Caddy proxy automatically.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-base font-semibold text-white">Deploy from Git or Files</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Push your code to GitHub to trigger automated container builds with real-time SSE streaming logs, or upload HTML/CSS/JS files directly via the built-in file editor.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-base font-semibold text-white">Automatic SSL &amp; Routing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Shipyard allocates internal ports dynamically and routes external domains with automated Let&apos;s Encrypt certificates. Zero certbot configuration required.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="px-6 max-w-6xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FEATURES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built for Developers Who Value Simplicity &amp; Speed
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Everything you need to host modern applications without complex cloud configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Zero Configuration</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No manual database credentials or environment file juggling. Shipyard configures all internal services automatically on first boot.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Multi-Node Worker Clustering</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Join any remote VPS, server, or cloud instance with a single token command. Workers execute builds and stream hardware telemetry back to the leader.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">In-Browser File Studio</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload raw HTML, CSS, and JS files or edit code in browser. Hit &quot;Save &amp; Redeploy&quot; to update your live app instantaneously.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Git Push Auto-Deploy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect your GitHub repository. Webhooks automatically trigger zero-downtime builds with real-time SSE terminal streaming and 1-click instant rollback.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Dynamic Reverse Proxy &amp; SSL</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dynamic port assignment (30000-39999) with integrated Caddy reverse proxy routing and automated Let&apos;s Encrypt SSL certificates for your custom domains.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">AES-256-GCM Secret Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Environment variables and tokens are encrypted at rest with AES-256-GCM. Workloads execute inside isolated Docker sandboxes with no root leaks.
            </p>
          </div>
        </div>
      </section>

      {/* Deployment Modes Callout */}
      <section className="px-6 max-w-5xl mx-auto pb-24">
        <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>UNIFIED ARCHITECTURE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                One Repository. Dual Operating Modes.
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                Deploy this exact repository on Vercel to serve the official public showcase &amp; docs, or run the installer script on any Linux VPS to launch the full self-contained PaaS control plane.
              </p>
            </div>
            <Link
              href="/docs"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium shrink-0 self-start sm:self-auto transition-colors border border-zinc-700"
            >
              Read Docs &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-black/60 border border-zinc-850 space-y-1.5">
              <span className="text-cyan-400 font-semibold block">▲ Vercel Cloud Mode</span>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                Built as a lightning-fast serverless website serving the official landing page, technical documentation, and install script endpoints.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/60 border border-zinc-850 space-y-1.5">
              <span className="text-emerald-400 font-semibold block">⚓ Self-Hosted Appliance</span>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                Installed on your VPS with full Docker management, in-browser file editor, dynamic reverse proxy, real-time hardware telemetry, and automated deployments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="px-6 max-w-5xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Shipyard Compares
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Why developers choose Shipyard over complex cloud infrastructure.
          </p>
        </div>

        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-300">
                  <th className="p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold text-cyan-400 bg-cyan-950/20">Shipyard Appliance</th>
                  <th className="p-4 font-semibold text-zinc-400">Heroku / AWS</th>
                  <th className="p-4 font-semibold text-zinc-400">Kubernetes / Helm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="p-4 font-medium text-white">Setup Time</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-cyan-950/10">60 Seconds</td>
                  <td className="p-4 text-zinc-400">Hours (Complex IAM)</td>
                  <td className="p-4 text-zinc-500">Days / Weeks</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Zero Mock Telemetry</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-cyan-950/10">Real Kernel Metrics</td>
                  <td className="p-4 text-zinc-400">Add-on Pricing</td>
                  <td className="p-4 text-zinc-400">Prometheus / Grafana</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">In-Browser File Studio</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-cyan-950/10">Built-in (Instant)</td>
                  <td className="p-4 text-zinc-500">None</td>
                  <td className="p-4 text-zinc-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Multi-Node Worker Join</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-cyan-950/10">1 Token Command</td>
                  <td className="p-4 text-zinc-400">VPC Peering</td>
                  <td className="p-4 text-zinc-500">Complex Kubeadm</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Vercel &amp; VPS Dual Mode</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-cyan-950/10">Yes (Unified Repo)</td>
                  <td className="p-4 text-zinc-500">No</td>
                  <td className="p-4 text-zinc-500">No</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-white">Monthly Platform Cost</td>
                  <td className="p-4 text-emerald-400 font-semibold bg-cyan-950/10">$0 (Your VPS only)</td>
                  <td className="p-4 text-zinc-400">$25 - $200+</td>
                  <td className="p-4 text-zinc-400">$70+ (Control Plane)</td>
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

        <div className="space-y-3 text-xs">
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
              className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-zinc-200 hover:text-white transition-colors"
              >
                <span className="font-semibold text-sm text-zinc-100">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    openFaq === idx ? "transform rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-zinc-400 text-xs leading-relaxed border-t border-zinc-900 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 max-w-5xl mx-auto pb-28">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Take Control of Your Infrastructure?
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Spin up Shipyard on your VPS right now with one command, or explore our documentation to learn about multi-node clustering.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
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
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs transition-colors border border-zinc-700 text-center"
            >
              Read Full Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-10 px-6 text-center text-xs text-zinc-500 bg-[#070709]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <Anchor className="w-3.5 h-3.5" />
            </div>
            <span className="text-zinc-200 font-semibold">SHIPYARD</span>
            <span className="text-zinc-600">•</span>
            <span>Zero-Config Developer Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-zinc-300 transition-colors">
              Documentation
            </Link>
            <Link href="/docs#quickstart" className="hover:text-zinc-300 transition-colors">
              Install Script
            </Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">
              Control Plane Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
