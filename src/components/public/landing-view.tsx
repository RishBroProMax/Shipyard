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
  ExternalLink,
  ChevronDown,
  Activity,
  GitBranch,
  Lock,
  RefreshCw,
  Sparkles,
  Monitor,
  CheckCircle2,
  Boxes,
  Sliders,
  Settings,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  HelpCircle,
  FolderTree,
  Laptop,
  Play,
} from "lucide-react";
import ShapeWaves from "@/components/ui/ShapeWaves";

export function LandingView() {
  const [copied, setCopied] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<"appliance" | "agent">("appliance");
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"workloads" | "editor" | "telemetry" | "logs" | "proxy">("workloads");
  const [currentOrigin, setCurrentOrigin] = useState("https://shipyard.example");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Install flags customizer state
  const [showConfig, setShowConfig] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [customPort, setCustomPort] = useState("3000");
  const [isNonInteractive, setIsNonInteractive] = useState(false);

  // VPS Hardware sizing calculator
  const [vpsRam, setVpsRam] = useState<"1gb" | "2gb" | "4gb" | "8gb">("2gb");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  // Build dynamic command
  const buildApplianceCmd = () => {
    let base = `curl -fsSL ${currentOrigin}/install.sh | bash`;
    const flags: string[] = [];

    if (customEmail.trim()) {
      flags.push(`--email ${customEmail.trim()}`);
    }
    if (customPassword.trim()) {
      flags.push(`--password "${customPassword.trim()}"`);
    }
    if (customPort !== "3000" && customPort.trim()) {
      flags.push(`--port ${customPort.trim()}`);
    }
    if (isNonInteractive) {
      flags.push(`--non-interactive`);
    }

    if (flags.length > 0) {
      return `curl -fsSL ${currentOrigin}/install.sh | bash -s -- ${flags.join(" ")}`;
    }
    return base;
  };

  const agentCmd = `curl -fsSL ${currentOrigin}/agent_install | bash -s -- --token <CLUSTER_TOKEN_FROM_DASHBOARD>`;
  const activeCmd = activeInstallTab === "appliance" ? buildApplianceCmd() : agentCmd;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sizing specs lookup
  const sizingData = {
    "1gb": {
      containers: "2 - 4 apps",
      swap: "2 GB Swap Required",
      recommendedFor: "Personal side-projects, staging APIs, static sites",
      monthlyCost: "$3 - $5/mo (Hetzner / Linode)",
    },
    "2gb": {
      containers: "5 - 12 apps",
      swap: "1 GB Swap Recommended",
      recommendedFor: "Production microservices, PostgreSQL + Redis + Next.js",
      monthlyCost: "$5 - $8/mo",
    },
    "4gb": {
      containers: "15 - 30 apps",
      swap: "Optional",
      recommendedFor: "Team staging environments, high-traffic SaaS backends",
      monthlyCost: "$10 - $14/mo",
    },
    "8gb": {
      containers: "40+ apps",
      swap: "Optional",
      recommendedFor: "Agency multi-tenant hosting, high-throughput container clusters",
      monthlyCost: "$20 - $28/mo",
    },
  };

  const currentSizing = sizingData[vpsRam];

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

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-zinc-100 transition-colors">
              Architecture
            </a>
            <a href="#showcase" className="hover:text-zinc-100 transition-colors">
              Interactive Tour
            </a>
            <a href="#sizing" className="hover:text-zinc-100 transition-colors">
              VPS Sizing
            </a>
            <a href="#comparison" className="hover:text-zinc-100 transition-colors">
              Comparison
            </a>
            <Link href="/docs" className="hover:text-cyan-300 transition-colors flex items-center gap-1 font-medium">
              <span>Docs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700/40">
                100% Complete
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/RishBroProMax/Shipyard"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-md hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>
          <Link
            href="/docs#quickstart"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/10 active:scale-95"
          >
            <span>Install on VPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 px-6 min-h-[720px] flex flex-col items-center justify-center">
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-transparent to-[#09090b] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_25%,rgba(6,182,212,0.08),transparent)] pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-md text-xs text-zinc-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-zinc-200">Shipyard v1.0 Production Appliance</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Zero Configuration Self-Hosting</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.07]">
            Your private cloud PaaS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-cyan-200 to-cyan-400">
              Zero DevOps required.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Transform any clean Linux VPS into your personal deployment platform in 60 seconds. Push to Git or drag-and-drop raw files with automatic PostgreSQL 16, Redis 7, reverse proxies, and Let&apos;s Encrypt SSL.
          </p>

          {/* Tabbed 1-Click Install Command Box with Interactive Customizer */}
          <div className="max-w-xl mx-auto pt-2 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveInstallTab("appliance")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeInstallTab === "appliance"
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                1-Line VPS Install
              </button>
              <button
                onClick={() => setActiveInstallTab("agent")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeInstallTab === "agent"
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Remote Worker Node
              </button>
              {activeInstallTab === "appliance" && (
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    showConfig
                      ? "bg-cyan-950/60 text-cyan-300 border border-cyan-700/50"
                      : "text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800"
                  }`}
                  title="Configure email, password, and port flags"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize Flags</span>
                </button>
              )}
            </div>

            {/* Custom Options Panel */}
            {activeInstallTab === "appliance" && showConfig && (
              <div className="p-4 rounded-xl bg-[#0e0f14]/95 border border-zinc-800 text-left space-y-3 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Installer CLI Flags Builder</span>
                  </div>
                  <button
                    onClick={() => {
                      setCustomEmail("");
                      setCustomPassword("");
                      setCustomPort("3000");
                      setIsNonInteractive(false);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                  >
                    Reset Defaults
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Admin Email (--email)
                    </label>
                    <input
                      type="email"
                      placeholder="admin@mycompany.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Admin Password (--password)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-generate"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Port (--port)
                    </label>
                    <input
                      type="number"
                      value={customPort}
                      onChange={(e) => setCustomPort(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-300 text-xs">
                      <input
                        type="checkbox"
                        checked={isNonInteractive}
                        onChange={(e) => setIsNonInteractive(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>Headless (--non-interactive)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Command Container */}
            <div className="relative flex items-center bg-[#0d0e12]/95 border border-zinc-800 rounded-xl p-3.5 shadow-2xl backdrop-blur font-mono text-xs text-zinc-200 group hover:border-zinc-700 transition-all">
              <span className="text-cyan-400 font-semibold select-none mr-2.5">$</span>
              <span className="flex-1 text-left select-all truncate text-zinc-200 font-mono">
                {activeCmd}
              </span>
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 flex items-center gap-1.5 transition-all border border-zinc-700 active:scale-95 shrink-0 ml-2 shadow-sm"
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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Interactive Password &amp; Email Prompt
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Auto Postgres 16 &amp; Redis 7
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Let&apos;s Encrypt Auto-SSL
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Control Plane Tour Showcase */}
      <section id="showcase" className="px-6 max-w-5xl mx-auto pb-24">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 font-medium">
            <Monitor className="w-3.5 h-3.5" />
            <span>INTERACTIVE DASHBOARD TOUR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            See the Control Plane in Action
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Experience the built-in tooling that transforms raw VPS servers into production engines.
          </p>
        </div>

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
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-zinc-800 overflow-x-auto">
              <button
                onClick={() => setActiveShowcaseTab("workloads")}
                className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  activeShowcaseTab === "workloads"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Workloads
              </button>
              <button
                onClick={() => setActiveShowcaseTab("editor")}
                className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  activeShowcaseTab === "editor"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                In-Browser IDE
              </button>
              <button
                onClick={() => setActiveShowcaseTab("telemetry")}
                className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  activeShowcaseTab === "telemetry"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Kernel Telemetry
              </button>
              <button
                onClick={() => setActiveShowcaseTab("logs")}
                className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  activeShowcaseTab === "logs"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Live Build Logs
              </button>
              <button
                onClick={() => setActiveShowcaseTab("proxy")}
                className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                  activeShowcaseTab === "proxy"
                    ? "bg-zinc-800 text-white font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Caddy SSL Routes
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supervisor Active</span>
            </div>
          </div>

          {/* Showcase View Body */}
          <div className="p-6 text-zinc-300 min-h-[340px]">
            {activeShowcaseTab === "workloads" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Total Workloads</div>
                    <div className="text-2xl font-bold text-white mt-1">12 Active</div>
                    <div className="text-xs text-emerald-400 mt-0.5">100% healthy containers</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-xs text-zinc-400">Cluster RAM Allocation</div>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">3.8 / 16 GB</div>
                    <div className="text-xs text-zinc-400 mt-0.5">23.7% kernel memory used</div>
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
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">storefront-production</div>
                        <div className="text-zinc-500 font-mono text-[11px]">https://shop.example.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>Node.js 20</span>
                      <span className="text-emerald-400 font-mono">Port :30004</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">Production</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">payments-api-svc</div>
                        <div className="text-zinc-500 font-mono text-[11px]">https://pay.example.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>Go 1.22</span>
                      <span className="text-emerald-400 font-mono">Port :30008</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">Production</span>
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">marketing-landing-page</div>
                        <div className="text-zinc-500 font-mono text-[11px]">In-Browser File Studio</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-400">
                      <span>Static HTML/CSS</span>
                      <span className="text-emerald-400 font-mono">Port :30012</span>
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
                  <span className="text-emerald-400">● Live Hot-Reload Active</span>
                </div>
                <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-1 text-zinc-300 font-mono">
                  <div className="text-zinc-500">// Edit static or server files directly with instant 250ms redeployment</div>
                  <div>&lt;<span className="text-cyan-400">h1</span> class=&quot;headline text-4xl&quot;&gt;Enterprise Shipping Platform&lt;/<span className="text-cyan-400">h1</span>&gt;</div>
                  <div>&lt;<span className="text-cyan-400">p</span> class=&quot;lead&quot;&gt;Zero-configuration reverse proxies &amp; automatic SSL.&lt;/<span className="text-cyan-400">p</span>&gt;</div>
                </div>
                <div className="flex justify-end pt-1">
                  <button className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Save &amp; Hot-Deploy (250ms)</span>
                  </button>
                </div>
              </div>
            )}

            {activeShowcaseTab === "telemetry" && (
              <div className="space-y-4 text-xs font-mono">
                <div className="text-zinc-400 flex items-center justify-between">
                  <span>Live host metrics read directly from kernel /proc/ filesystem:</span>
                  <span className="text-emerald-400 font-medium">Updated 1s ago</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Host Node: leader-master-01</span>
                      <span className="text-cyan-400">8 Cores</span>
                    </div>
                    <div className="text-zinc-400">CPU Usage: 14.2%</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[14.2%]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Physical Host RAM</span>
                      <span className="text-emerald-400">3.8 / 16 GB</span>
                    </div>
                    <div className="text-zinc-400">Allocation: 23.7% Used</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[23.7%]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">NVMe Storage</span>
                      <span className="text-zinc-400">24 / 200 GB</span>
                    </div>
                    <div className="text-zinc-400">Disk Used: 12.0%</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full w-[12%]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Network I/O</span>
                      <span className="text-cyan-400">Streaming</span>
                    </div>
                    <div className="text-zinc-400">Rx: 1.4 MB/s · Tx: 3.2 MB/s</div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[35%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === "logs" && (
              <div className="space-y-2 font-mono text-xs p-3 rounded-xl bg-black border border-zinc-800">
                <div className="text-cyan-400 font-semibold">
                  [09:20:11] GitHub Webhook: commit 8f2a1b9 (&quot;feat: modernize payments flow&quot;) received
                </div>
                <div className="text-zinc-400">
                  [09:20:12] Supervisor: decrypting environment variables from AES-256 vault
                </div>
                <div className="text-zinc-400">
                  [09:20:13] Buildpack Engine: detected Node.js 20 repository structure
                </div>
                <div className="text-zinc-400">
                  [09:20:15] Docker Engine: built isolated container layer in 3.4s
                </div>
                <div className="text-zinc-400">
                  [09:20:17] Health Probe: GET http://localhost:30004/api/health &rarr; HTTP 200 (1ms)
                </div>
                <div className="text-zinc-400">
                  [09:20:18] Dynamic Proxy: Caddy hot-reloaded upstream configuration
                </div>
                <div className="text-emerald-400 font-bold pt-2 border-t border-zinc-900">
                  ✓ Deployment #24 LIVE &rarr; Zero downtime traffic switch successful!
                </div>
              </div>
            )}

            {activeShowcaseTab === "proxy" && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-zinc-400">
                  Caddy reverse proxy routes managed dynamically in real-time without restarts:
                </div>
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-black/50">
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">api.mycompany.com</span>
                      <span className="text-zinc-500 ml-2">&rarr; container:30004</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                      SSL Active (Let&apos;s Encrypt)
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">dashboard.mycompany.com</span>
                      <span className="text-zinc-500 ml-2">&rarr; container:30008</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                      SSL Active (Let&apos;s Encrypt)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Architecture Visualizer Section */}
      <section id="architecture" className="px-6 max-w-5xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>DUAL-MODE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How Shipyard Scales Across Machines
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
            A single codebase that runs either as a public Vercel showcase or as a full bare-metal PaaS appliance on any Linux VPS with infinite remote worker nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Box 1: Vercel Edge */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">1. Edge &amp; Docs Layer</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Deploys to Vercel with zero env variables. Serves public landing page, interactive docs, and bootstrap installer scripts globally.
              </p>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 bg-black/40 p-2.5 rounded-lg border border-zinc-800/80">
              Mode: VERCEL=1
            </div>
          </div>

          {/* Box 2: VPS Leader Control Plane */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-cyan-900/50 space-y-4 shadow-lg shadow-cyan-950/20 relative">
            <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/40 text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
              Control Plane
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">2. Appliance Master Node</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Runs on your primary VPS. Coordinates Docker containers, runs PostgreSQL 16, Redis 7, Caddy 2, and the AES-256 secret vault.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-900/40">
              Mode: SHIPYARD_MODE=appliance
            </div>
          </div>

          {/* Box 3: Remote Worker Nodes */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-emerald-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">3. Remote Worker Nodes</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Connect secondary VPS servers in 10 seconds via agent script. Streams real-time CPU, RAM, and network telemetry every 3 seconds.
              </p>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 bg-black/40 p-2.5 rounded-lg border border-zinc-800/80">
              Agent: shipyard-agent.js
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="px-6 max-w-5xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BUILT FOR DEVELOPERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything You Expect From a Modern PaaS
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Self-hosted independence without sacrificing developer experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Zero-Config Docker */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
              <Boxes className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Zero-Config Docker Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Auto-detects Node.js, Python, Dockerfile, or static HTML. Allocates non-colliding container ports automatically in the 30000–39999 range.
            </p>
          </div>

          {/* Card 2: Automatic SSL */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Automatic Let&apos;s Encrypt SSL</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Integrated Caddy 2 reverse proxy provisions TLS certificates automatically on domain connection. No manual certbot or crontab required.
            </p>
          </div>

          {/* Card 3: Kernel Telemetry */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Real Kernel Telemetry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero mock statistics. Reads host metrics directly from Linux <code className="text-cyan-300">/proc/stat</code>, <code className="text-cyan-300">/proc/meminfo</code>, and <code className="text-cyan-300">/proc/net/dev</code>.
            </p>
          </div>

          {/* Card 4: In-Browser Studio */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400">
              <FileCode className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">In-Browser File Studio</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deploy without git by dragging and dropping static HTML/CSS or editing project files directly in the built-in monaco-style code editor.
            </p>
          </div>

          {/* Card 5: AES-256 Vault */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">AES-256-GCM Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All stored environment variables and secrets are cryptographically encrypted at rest with hardware-derived keys.
            </p>
          </div>

          {/* Card 6: 1-Click Rollback */}
          <div className="p-6 rounded-2xl bg-[#0c0d12] border border-zinc-800 hover:border-zinc-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-pink-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Instant Safe Rollback</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every build retains its image artifacts and commit context. Revert faulty deployments instantly with zero downtime.
            </p>
          </div>
        </div>
      </section>

      {/* VPS Sizing & Readiness Calculator */}
      <section id="sizing" className="px-6 max-w-5xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>RESOURCE SIZING CALCULATOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How Much VPS Hardware Do You Need?
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Select your VPS memory to see recommended capacity, swap configuration, and estimated monthly costs.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-[#0c0d12] border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-4 gap-2">
            {(["1gb", "2gb", "4gb", "8gb"] as const).map((ram) => (
              <button
                key={ram}
                onClick={() => setVpsRam(ram)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all uppercase tracking-wider ${
                  vpsRam === ram
                    ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {ram} RAM
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/80 space-y-1">
              <span className="text-zinc-500 text-[11px] block">CONCURRENT WORKLOADS</span>
              <span className="text-base font-bold text-white">{currentSizing.containers}</span>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/80 space-y-1">
              <span className="text-zinc-500 text-[11px] block">SWAP RECOMMENDATION</span>
              <span className="text-base font-bold text-cyan-400">{currentSizing.swap}</span>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/80 space-y-1">
              <span className="text-zinc-500 text-[11px] block">IDEAL USE CASE</span>
              <span className="text-xs font-medium text-zinc-300">{currentSizing.recommendedFor}</span>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/80 space-y-1">
              <span className="text-zinc-500 text-[11px] block">ESTIMATED HARDWARE COST</span>
              <span className="text-base font-bold text-emerald-400">{currentSizing.monthlyCost}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-900/40 text-xs text-cyan-300 flex items-center justify-between">
            <span>Tip: On 1GB VPS, adding a 2GB swap file prevents out-of-memory errors during Docker builds.</span>
            <Link href="/docs#swap-guide" className="underline font-semibold text-cyan-200 whitespace-nowrap ml-2">
              View Swap Guide &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* PaaS Comparison Table */}
      <section id="comparison" className="px-6 max-w-5xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>HOW WE COMPARE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Shipyard vs Alternatives
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Why developers choose Shipyard over complex or expensive alternatives.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0c0d12]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-300 font-semibold">
                <th className="p-4">Feature</th>
                <th className="p-4 text-cyan-400">⚓ Shipyard</th>
                <th className="p-4 text-zinc-400">Coolify</th>
                <th className="p-4 text-zinc-400">Portainer</th>
                <th className="p-4 text-zinc-400">Vercel / Railway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-mono">
              <tr>
                <td className="p-4 font-sans font-medium text-white">Installation Time</td>
                <td className="p-4 text-emerald-400 font-bold">60 Seconds</td>
                <td className="p-4 text-zinc-400">2 - 5 Minutes</td>
                <td className="p-4 text-zinc-400">Manual Setup</td>
                <td className="p-4 text-zinc-400">SaaS Account</td>
              </tr>
              <tr>
                <td className="p-4 font-sans font-medium text-white">Interactive Setup Prompt</td>
                <td className="p-4 text-emerald-400 font-bold">Yes (Email + Pass)</td>
                <td className="p-4 text-zinc-400">Web Setup Only</td>
                <td className="p-4 text-zinc-400">Web Setup Only</td>
                <td className="p-4 text-zinc-400">N/A</td>
              </tr>
              <tr>
                <td className="p-4 font-sans font-medium text-white">Built-in In-Browser Editor</td>
                <td className="p-4 text-emerald-400 font-bold">Yes (Instant Deploy)</td>
                <td className="p-4 text-zinc-500">No</td>
                <td className="p-4 text-zinc-500">No</td>
                <td className="p-4 text-zinc-500">No</td>
              </tr>
              <tr>
                <td className="p-4 font-sans font-medium text-white">Hardware Telemetry</td>
                <td className="p-4 text-emerald-400 font-bold">Real /proc Kernel Data</td>
                <td className="p-4 text-zinc-400">Container Stats</td>
                <td className="p-4 text-zinc-400">Docker API</td>
                <td className="p-4 text-zinc-400">Abstract Metrics</td>
              </tr>
              <tr>
                <td className="p-4 font-sans font-medium text-white">Monthly Cost</td>
                <td className="p-4 text-emerald-400 font-bold">100% Free &amp; Open Source</td>
                <td className="p-4 text-zinc-300">Free / Cloud $</td>
                <td className="p-4 text-zinc-300">Free / Enterprise $</td>
                <td className="p-4 text-zinc-400">$20 - $200+/mo</td>
              </tr>
              <tr>
                <td className="p-4 font-sans font-medium text-white">Automatic SSL Reverse Proxy</td>
                <td className="p-4 text-emerald-400 font-bold">Yes (Caddy 2)</td>
                <td className="p-4 text-zinc-300">Traefik</td>
                <td className="p-4 text-zinc-500">Manual Nginx</td>
                <td className="p-4 text-zinc-300">Proprietary Edge</td>
              </tr>
              <tr>
                <td className="p-4 font-sans font-medium text-white">Remote Worker Agent</td>
                <td className="p-4 text-emerald-400 font-bold">1-Line Install</td>
                <td className="p-4 text-zinc-300">SSH Key Tunnel</td>
                <td className="p-4 text-zinc-300">Agent Container</td>
                <td className="p-4 text-zinc-500">Vendor Locked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 max-w-4xl mx-auto pb-24 border-t border-zinc-800/80 pt-20">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-400">
            Everything you need to know about self-hosting Shipyard.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              q: "Can I install Shipyard on a $4/month VPS?",
              a: "Yes! Shipyard is heavily optimized to run on 1 vCPU and 512MB RAM. If you plan to build heavy Node.js or Docker images, we strongly recommend creating a 2GB swap file as documented in our Docs page.",
            },
            {
              q: "How does the interactive installer handle passwords?",
              a: "When you run curl ... | bash in your terminal, the installer opens /dev/tty directly and asks for your desired admin email and password with silent input. You can also press Enter to let Shipyard auto-generate a secure 20-character password. For automation (CI/CD), pass the --email and --password flags.",
            },
            {
              q: "What happens if I forget my admin password?",
              a: "You can easily reset your password from the host VPS terminal at any time by running: node scripts/init-appliance.js --reset-password <email> <newPassword>.",
            },
            {
              q: "How does automatic SSL work with custom domains?",
              a: "Shipyard comes bundled with Caddy 2. Simply point your domain's DNS A-record to your VPS IP address, add the domain in the Shipyard dashboard, and Caddy will automatically negotiate Let's Encrypt certificates within seconds.",
            },
            {
              q: "Can I connect multiple servers to one Shipyard panel?",
              a: "Yes! Shipyard has built-in clustering. Run the 1-line agent installer on any remote server, and it will immediately stream telemetry and accept container deployments from your primary dashboard.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-800 rounded-xl bg-[#0c0d12] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-cyan-300 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    openFaq === idx ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="px-6 max-w-5xl mx-auto pb-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 to-[#0c0d12] border border-zinc-800 text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to deploy on your own infrastructure?
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Take control of your applications, data, and monthly costs. Run the one-line installer now or read our comprehensive self-hosting guide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleCopy}
              className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-white/5 active:scale-95"
            >
              <Terminal className="w-4 h-4 text-zinc-800" />
              <span>{copied ? "Command Copied!" : "Copy Install Command"}</span>
            </button>
            <Link
              href="/docs"
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs flex items-center gap-2 transition-all border border-zinc-700"
            >
              <span>Explore Documentation</span>
              <ArrowRight className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#09090b] px-6 py-10 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-cyan-400" />
            <span className="text-zinc-300 font-semibold">Shipyard PaaS</span>
            <span>— Free, Open Source &amp; Self-Contained.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-zinc-300 transition-colors">
              Documentation
            </Link>
            <a
              href="https://github.com/RishBroProMax/Shipyard"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              GitHub Repository
            </a>
            <a href="#sizing" className="hover:text-zinc-300 transition-colors">
              VPS Sizing
            </a>
            <span className="text-zinc-600">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
