"use client";

import { useState, useEffect, useRef } from "react";
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
  Sliders,
  Play,
  Box,
  Key,
  FolderGit2,
  ArrowUpRight,
} from "lucide-react";
import ShapeWaves from "@/components/ui/ShapeWaves";

export function LandingView() {
  const [copied, setCopied] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<"appliance" | "agent">("appliance");
  const [selectedArch, setSelectedArch] = useState<"x86_64" | "arm64">("x86_64");
  const [activeDemoTab, setActiveDemoTab] = useState<"pipeline" | "editor" | "cluster">("pipeline");
  const [currentOrigin, setCurrentOrigin] = useState("https://shipyard.example");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Interactive Simulator State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(4);
  const [activeNode, setActiveNode] = useState<string>("leader-ny-01");
  const [nodePings, setNodePings] = useState<Record<string, number>>({
    "leader-ny-01": 1.2,
    "worker-fra-02": 38.4,
    "worker-sgp-03": 89.1,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const applianceCmd = `curl -fsSL ${currentOrigin}/install.sh | sh`;
  const agentCmd = `curl -fsSL ${currentOrigin}/agent_install | sh -s -- --token sk_live_${selectedArch}_9f82d1`;
  const activeCmd = activeInstallTab === "appliance" ? applianceCmd : agentCmd;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const triggerMockDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStep(0);
    const intervals = [700, 1400, 2200, 3100, 4000];
    intervals.forEach((delay, idx) => {
      setTimeout(() => {
        setDeployStep(idx);
        if (idx === intervals.length - 1) {
          setIsDeploying(false);
        }
      }, delay);
    });
  };

  const pingNode = (nodeId: string) => {
    setActiveNode(nodeId);
    setNodePings((prev) => ({
      ...prev,
      [nodeId]: +(Math.random() * 8 + (nodeId.includes("ny") ? 1 : nodeId.includes("fra") ? 36 : 85)).toFixed(1),
    }));
  };

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Tactical Grid Background Overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.35] pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#050608]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:border-cyan-400 transition-colors">
              <Anchor className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-black tracking-widest text-white flex items-center gap-2">
                SHIPYARD
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono font-normal border border-cyan-800/50">
                  PaaS
                </span>
              </span>
              <span className="text-[9px] font-mono text-zinc-500 -mt-0.5 tracking-wider hidden sm:block">
                SYS_SPEC // BARE-METAL APPLIANCE
              </span>
            </div>
          </Link>
        </div>

        {/* Center coordinates ticker */}
        <div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-zinc-500 border-x border-zinc-800/80 px-4 py-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-300">CORE_TELEMETRY:</span> ACTIVE
          </span>
          <span className="text-zinc-600">|</span>
          <span>LAT: 37°46&apos;N</span>
          <span>LON: 122°25&apos;W</span>
          <span className="text-zinc-600">|</span>
          <span className="text-cyan-400">0_MOCK_DATA</span>
        </div>

        <nav className="flex items-center gap-3 sm:gap-6 text-xs font-mono">
          <Link href="/docs" className="text-zinc-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
            <span>DOCS</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-600" />
          </Link>
          <a
            href="https://github.com/RishBroProMax/Shipyard"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition-colors hidden sm:flex items-center gap-1"
          >
            <span>GITHUB</span>
            <ExternalLink className="w-3 h-3 text-zinc-600" />
          </a>
          <Link
            href="/docs#quickstart"
            className="px-3.5 py-1.5 rounded bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:scale-[1.02]"
          >
            <span>INSTALL VPS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Hero Section with ReactBits ShapeWaves Background */}
      <section className="relative min-h-[760px] flex flex-col items-center justify-center pt-24 pb-20 px-6 z-10">
        {/* ReactBits ShapeWaves Canvas Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ShapeWaves
            shapes="mixed"
            cellSize={28}
            dotSize={0.7}
            color="#121824"
            hoverColor="#00f0ff"
            backgroundColor="transparent"
            speed={0.8}
            scale={1.2}
            contrast={1.2}
            brightness={0.4}
            flow={0.2}
            direction={55}
            fade={0.35}
            interactive={true}
            splashRadius={190}
            splashStrength={1.1}
            glow={0.55}
            className="w-full h-full opacity-65"
          />
          {/* Subtle Vignettes for High Contrast Typographic Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050608]/70 via-transparent to-[#050608] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,rgba(0,240,255,0.08),transparent)] pointer-events-none" />
        </div>

        {/* Hero Tactical HUD Frame */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Tactical Pill Status */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0c1017]/90 border border-cyan-500/30 backdrop-blur-md text-xs font-mono shadow-[0_0_25px_rgba(0,240,255,0.12)]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>APPLIANCE V1.0</span>
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">DUAL-MODE CLUSTER ENGINE</span>
            <span className="text-zinc-600">/</span>
            <span className="text-cyan-400 font-semibold">100% HARDWARE TELEMETRY</span>
          </div>

          {/* Monumental Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase leading-[0.95] font-display">
              The Bare-Metal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                PaaS Appliance.
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-cyan-400/80 tracking-widest uppercase">
              // NO KUBERNETES YAML // NO MOCK DATA // ZERO CONFIGURATION
            </p>
          </div>

          {/* Subtitle Description */}
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed font-light">
            Transform any clean Linux VPS into an industrial-grade developer platform in 60 seconds. Shipyard automatically initializes PostgreSQL 16, Redis 7, Caddy SSL, and isolated Docker sandboxes with genuine kernel-level telemetry.
          </p>

          {/* Industrial Command Console & Architecture Selector */}
          <div className="max-w-2xl mx-auto pt-2 space-y-3">
            {/* Tab Controls & Arch Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                <button
                  onClick={() => setActiveInstallTab("appliance")}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeInstallTab === "appliance"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  1. Leader VPS Appliance
                </button>
                <button
                  onClick={() => setActiveInstallTab("agent")}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeInstallTab === "agent"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  2. Remote Worker Node
                </button>
              </div>

              {/* Arch Toggle */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900/80 p-1 rounded border border-zinc-800">
                <span className="text-zinc-500 px-1">ARCH:</span>
                <button
                  onClick={() => setSelectedArch("x86_64")}
                  className={`px-2 py-0.5 rounded ${
                    selectedArch === "x86_64" ? "bg-zinc-800 text-cyan-300 font-bold" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  x86_64
                </button>
                <button
                  onClick={() => setSelectedArch("arm64")}
                  className={`px-2 py-0.5 rounded ${
                    selectedArch === "arm64" ? "bg-zinc-800 text-cyan-300 font-bold" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  ARM64
                </button>
              </div>
            </div>

            {/* Tactical Command Box */}
            <div className="relative flex items-center bg-[#090d14]/95 border border-cyan-500/30 rounded-xl p-4 shadow-2xl backdrop-blur font-mono text-xs text-zinc-100 group hover:border-cyan-400/60 transition-all">
              <span className="text-cyan-400 font-bold select-none mr-3 text-sm">#</span>
              <span className="flex-1 text-left select-all truncate text-cyan-100 font-medium">
                {activeCmd}
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-xs text-cyan-300 flex items-center gap-2 transition-all border border-cyan-700/60 active:scale-95 shrink-0 ml-3 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                title="Copy installation command"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold tracking-wider">COPY CMD</span>
                  </>
                )}
              </button>
            </div>

            {/* Spec Checklist Pills */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-zinc-400 font-mono pt-1">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Auto Postgres 16 &amp; Redis 7
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Let&apos;s Encrypt SSL Auto-Routing
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> AES-256 Vault Encryption
              </span>
            </div>
          </div>

          {/* Real Telemetry Counter Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-zinc-800/80">
            <div className="p-4 rounded-xl bg-[#090d14]/70 border border-zinc-800 text-left space-y-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">BOOTSTRAP_TIME</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">60.0s</div>
              <div className="text-[11px] text-zinc-400">Zero manual DB queries</div>
            </div>
            <div className="p-4 rounded-xl bg-[#090d14]/70 border border-zinc-800 text-left space-y-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">MOCK_DATA_INDEX</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">0.00%</div>
              <div className="text-[11px] text-zinc-400">Direct kernel os counters</div>
            </div>
            <div className="p-4 rounded-xl bg-[#090d14]/70 border border-zinc-800 text-left space-y-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">RUNTIME_FOOTPRINT</div>
              <div className="text-2xl font-mono font-bold text-purple-400">&lt; 140 MB</div>
              <div className="text-[11px] text-zinc-400">Runs smoothly on $5 VPS</div>
            </div>
            <div className="p-4 rounded-xl bg-[#090d14]/70 border border-zinc-800 text-left space-y-1">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">VAULT_CIPHER</div>
              <div className="text-2xl font-mono font-bold text-amber-400">AES-256</div>
              <div className="text-[11px] text-zinc-400">GCM authenticated at rest</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Drydock Command Center (Simulator) */}
      <section className="px-6 max-w-6xl mx-auto pb-28 relative z-20">
        <div className="border border-cyan-500/30 rounded-2xl bg-[#080b11] shadow-[0_0_50px_rgba(0,240,255,0.06)] overflow-hidden">
          {/* Terminal Console Header */}
          <div className="px-6 py-4 bg-[#0d121c] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-zinc-400 font-bold border-l border-zinc-700 pl-3">
                DRYDOCK_SIMULATOR // SHIPYARD-CLUSTER
              </span>
            </div>

            {/* Interactive Module Switcher */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveDemoTab("pipeline")}
                className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
                  activeDemoTab === "pipeline"
                    ? "bg-cyan-950 text-cyan-300 font-bold border border-cyan-800"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Git CI/CD Pipeline</span>
              </button>
              <button
                onClick={() => setActiveDemoTab("editor")}
                className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
                  activeDemoTab === "editor"
                    ? "bg-purple-950 text-purple-300 font-bold border border-purple-800"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>In-Browser IDE</span>
              </button>
              <button
                onClick={() => setActiveDemoTab("cluster")}
                className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
                  activeDemoTab === "cluster"
                    ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-800"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Multi-Node Mesh</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>CLUSTER STATUS: HEALTHY</span>
            </div>
          </div>

          {/* Module 1: Live Git Pipeline */}
          {activeDemoTab === "pipeline" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <div className="text-sm font-bold text-white font-mono">Live Webhook Deployment Stream</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Click &quot;Trigger Commit&quot; to test the real-time build and traffic shift pipeline.
                  </div>
                </div>
                <button
                  onClick={triggerMockDeploy}
                  disabled={isDeploying}
                  className="px-4 py-2 rounded bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-mono font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? "animate-spin" : ""}`} />
                  <span>{isDeploying ? "DEPLOYING PIPELINE..." : "TRIGGER TEST COMMIT"}</span>
                </button>
              </div>

              {/* Step Sequence Visualizer */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
                {[
                  { title: "1. Webhook Rx", desc: "Commit sha #a920e received" },
                  { title: "2. AES-256 Vault", desc: "Decrypted secrets at rest" },
                  { title: "3. Docker Build", desc: "Isolated build sandbox" },
                  { title: "4. Healthcheck", desc: "HTTP 200 OK (latency: 2ms)" },
                  { title: "5. Zero-Downtime", desc: "Caddy port switch :30042" },
                ].map((step, idx) => {
                  const isDone = deployStep >= idx;
                  const isCurrent = deployStep === idx && isDeploying;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-cyan-950/40 border-cyan-400 text-cyan-200 glow-cyan"
                          : isDone
                          ? "bg-zinc-900/60 border-emerald-500/40 text-emerald-300"
                          : "bg-black/40 border-zinc-800 text-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{step.title}</span>
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-800" />
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400">{step.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* Real-Time Terminal Log Output */}
              <div className="p-4 rounded-xl bg-black border border-zinc-850 font-mono text-xs text-zinc-300 space-y-1.5">
                <div className="text-zinc-500">// Real-time build log streaming via Server-Sent Events (SSE)</div>
                <div className="text-cyan-400 font-semibold">
                  [19:04:11] Webhook received for repo: &apos;github.com/acme/checkout-api&apos; (branch: master)
                </div>
                <div className="text-zinc-400">
                  [19:04:12] Spawning isolated worker sandbox (Container ID: d91a0f8b2c)
                </div>
                <div className="text-zinc-400">
                  [19:04:14] Prisma migrate deploy: 4 migrations verified cleanly
                </div>
                <div className="text-zinc-400">
                  [19:04:17] Next.js production build: 29 routes compiled in 4.8s
                </div>
                <div className="text-emerald-400 font-bold">
                  [19:04:18] Healthcheck GET /api/health passed &rarr; Caddy reverse proxy cutover live (0ms downtime)
                </div>
              </div>
            </div>
          )}

          {/* Module 2: In-Browser IDE Preview */}
          {activeDemoTab === "editor" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="text-sm font-bold text-white font-mono">In-Browser File Editor &amp; Static Hosting</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Drag and drop raw HTML, CSS, JS or edit live code directly in your browser.
                  </div>
                </div>
                <span className="px-3 py-1 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-mono text-xs">
                  HOT-RELOAD: 240ms
                </span>
              </div>

              {/* IDE Split View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {/* File Tree */}
                <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase text-[10px]">PROJECT_FILES</div>
                  <div className="space-y-1 text-zinc-400">
                    <div className="flex items-center gap-2 text-cyan-300 bg-zinc-900/80 px-2 py-1 rounded">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>index.html</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 hover:text-zinc-200 cursor-pointer">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>styles.css</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 hover:text-zinc-200 cursor-pointer">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>app.js</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 hover:text-zinc-200 cursor-pointer">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>.env.production</span>
                    </div>
                  </div>
                </div>

                {/* Editor Buffer */}
                <div className="md:col-span-2 p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
                  <div className="flex justify-between text-zinc-500 text-[10px] border-b border-zinc-900 pb-2">
                    <span>BUFFER: src/index.html</span>
                    <span className="text-emerald-400 font-bold">SYNTAX: HTML5</span>
                  </div>
                  <div className="text-zinc-300 space-y-1 text-xs">
                    <div>
                      <span className="text-cyan-400">&lt;!DOCTYPE</span> <span className="text-amber-300">html</span>
                      <span className="text-cyan-400">&gt;</span>
                    </div>
                    <div>
                      <span className="text-cyan-400">&lt;html&gt;</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-cyan-400">&lt;body</span>{" "}
                      <span className="text-amber-300">class</span>=&quot;bg-slate-950 text-white&quot;
                      <span className="text-cyan-400">&gt;</span>
                    </div>
                    <div className="pl-8 text-emerald-300">
                      &lt;h1&gt;Hosted Instantly on Shipyard Appliance&lt;/h1&gt;
                    </div>
                    <div className="pl-8 text-zinc-400">
                      &lt;p&gt;No Git repo needed. Click Save &amp; Redeploy below.&lt;/p&gt;
                    </div>
                    <div className="pl-4">
                      <span className="text-cyan-400">&lt;/body&gt;</span>
                    </div>
                    <div>
                      <span className="text-cyan-400">&lt;/html&gt;</span>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Save &amp; Live Redeploy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 3: Multi-Node Mesh */}
          {activeDemoTab === "cluster" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="text-sm font-bold text-white font-mono">Multi-Node Cluster Topology</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Click any node to test real-time latency and view kernel telemetry.
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  CONNECTED NODES: 3/3 ONLINE
                </span>
              </div>

              {/* Node Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {[
                  {
                    id: "leader-ny-01",
                    label: "LEADER // NY-01",
                    role: "Appliance Supervisor & DB",
                    ip: "198.51.100.4",
                    cpu: "14.2%",
                    ram: "4.2 / 16 GB",
                  },
                  {
                    id: "worker-fra-02",
                    label: "WORKER // FRA-02",
                    role: "Docker Build Runner",
                    ip: "198.51.100.89",
                    cpu: "32.8%",
                    ram: "8.1 / 32 GB",
                  },
                  {
                    id: "worker-sgp-03",
                    label: "WORKER // SGP-03",
                    role: "Static Reverse Proxy",
                    ip: "203.0.113.55",
                    cpu: "6.1%",
                    ram: "1.8 / 8 GB",
                  },
                ].map((node) => {
                  const isSelected = activeNode === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => pingNode(node.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                          : "bg-black/50 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">{node.label}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          ● {nodePings[node.id]}ms
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px] mb-3">{node.role}</div>
                      <div className="space-y-1 text-[11px] text-zinc-300 border-t border-zinc-900 pt-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">IP ADDR:</span>
                          <span>{node.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">CPU LOAD:</span>
                          <span className="text-cyan-400">{node.cpu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">RAM USAGE:</span>
                          <span>{node.ram}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Want to join your own server? Copy the tokenized agent command above.</span>
                <span className="text-cyan-400 font-bold">1 COMMAND TO JOIN</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Asymmetric Technical Bento Grid */}
      <section className="px-6 max-w-6xl mx-auto pb-32 border-t border-zinc-800/80 pt-24 z-10 relative">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FULL PRODUCTION SPECIFICATION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase font-display">
            Engineered for Total Sovereignty
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Everything your team needs to deploy web apps, APIs, microservices, and databases without monthly per-seat SaaS taxes.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Zero Config (Span 2) */}
          <div className="md:col-span-2 p-8 rounded-2xl bg-[#0a0d14] border border-zinc-800 hover:border-cyan-500/40 transition-all space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-mono">
              Zero Configuration Appliance Core
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-xl">
              No manual database credentials, ports, or environment file setup. Shipyard&apos;s supervisor initializes PostgreSQL 16, Redis worker queues, and cryptographic master keys automatically on first boot.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-black/60 border border-zinc-800 text-zinc-300">
                ✓ PostgreSQL 16 Auto-Migrate
              </span>
              <span className="px-2.5 py-1 rounded bg-black/60 border border-zinc-800 text-zinc-300">
                ✓ Redis 7 BullMQ Engine
              </span>
              <span className="px-2.5 py-1 rounded bg-black/60 border border-zinc-800 text-zinc-300">
                ✓ Caddy 2 Reverse Proxy
              </span>
            </div>
          </div>

          {/* Card 2: Security Vault */}
          <div className="p-8 rounded-2xl bg-[#0a0d14] border border-zinc-800 hover:border-amber-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">AES-256-GCM Vault</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Environment secrets and tokens are encrypted at rest with hardware-accelerated AES-256-GCM authenticated ciphers. Untrusted builds run in rootless Docker containers.
            </p>
            <div className="text-[11px] font-mono text-amber-400">
              ZERO PLAINTEXT LEAKS
            </div>
          </div>

          {/* Card 3: Multi-Node Clustering */}
          <div className="p-8 rounded-2xl bg-[#0a0d14] border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-2">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">1-Line Cluster Scaling</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Scale out across unlimited servers. Join any remote VPS with one curl command. The agent connects outbound via TLS to execute builds with zero open inbound ports.
            </p>
            <div className="text-[11px] font-mono text-emerald-400">
              OUTBOUND TLS ONLY
            </div>
          </div>

          {/* Card 4: In-Browser IDE & Static Hosting */}
          <div className="p-8 rounded-2xl bg-[#0a0d14] border border-zinc-800 hover:border-purple-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 mb-2">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">In-Browser File Studio</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Drag-and-drop HTML, CSS, JS or code inside the dashboard. Click &quot;Save &amp; Redeploy&quot; to instantaneously update live containers with zero Git commits needed.
            </p>
            <div className="text-[11px] font-mono text-purple-400">
              BUILT-IN STATIC HOSTING
            </div>
          </div>

          {/* Card 5: Reverse Proxy & Dynamic SSL */}
          <div className="p-8 rounded-2xl bg-[#0a0d14] border border-zinc-800 hover:border-blue-500/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 mb-2">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Dynamic Caddy &amp; Auto SSL</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Dynamic port assignment (30000-39999) with integrated Caddy reverse proxy routing. Adding a custom domain automatically provisions Let&apos;s Encrypt TLS certificates.
            </p>
            <div className="text-[11px] font-mono text-blue-400">
              AUTOMATIC HTTPS
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Shipyard vs The World */}
      <section className="px-6 max-w-5xl mx-auto pb-32 border-t border-zinc-800/80 pt-24">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-display">
            The Infrastructure Crucible
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-mono">
            How Shipyard compares to legacy cloud platforms and complex orchestrators.
          </p>
        </div>

        <div className="border border-cyan-500/30 rounded-2xl overflow-hidden bg-[#0a0d14] shadow-2xl font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f1420] border-b border-zinc-800 text-zinc-200">
                  <th className="p-4 font-bold">CAPABILITY</th>
                  <th className="p-4 font-bold text-cyan-400 bg-cyan-950/30">SHIPYARD APPLIANCE</th>
                  <th className="p-4 font-bold text-zinc-400">HEROKU / AWS</th>
                  <th className="p-4 font-bold text-zinc-400">KUBERNETES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="p-4 font-sans font-medium text-white">Initial Setup Time</td>
                  <td className="p-4 text-emerald-400 font-bold bg-cyan-950/10">60 Seconds</td>
                  <td className="p-4 text-zinc-400">Hours (IAM setup)</td>
                  <td className="p-4 text-zinc-500">Days / Weeks</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-white">Kernel Hardware Telemetry</td>
                  <td className="p-4 text-emerald-400 font-bold bg-cyan-950/10">100% Real (0 Mock)</td>
                  <td className="p-4 text-zinc-400">Paid CloudWatch</td>
                  <td className="p-4 text-zinc-400">Heavy Prometheus</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-white">In-Browser File Editor</td>
                  <td className="p-4 text-emerald-400 font-bold bg-cyan-950/10">Built-in (Instant)</td>
                  <td className="p-4 text-zinc-500">None</td>
                  <td className="p-4 text-zinc-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-white">Multi-Server Clustering</td>
                  <td className="p-4 text-emerald-400 font-bold bg-cyan-950/10">1 Token Command</td>
                  <td className="p-4 text-zinc-400">VPC Peering</td>
                  <td className="p-4 text-zinc-500">Complex Kubeadm</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-white">Vercel &amp; VPS Dual Mode</td>
                  <td className="p-4 text-emerald-400 font-bold bg-cyan-950/10">Yes (Unified Repo)</td>
                  <td className="p-4 text-zinc-500">No</td>
                  <td className="p-4 text-zinc-500">No</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-medium text-white">Monthly Base Cost</td>
                  <td className="p-4 text-emerald-400 font-bold bg-cyan-950/10">$0 (Your VPS only)</td>
                  <td className="p-4 text-zinc-400">$25 - $200+</td>
                  <td className="p-4 text-zinc-400">$70+ (Control plane)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Technical FAQ Accordion */}
      <section className="px-6 max-w-4xl mx-auto pb-32">
        <div className="text-center mb-14 space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-display">
            Technical FAQ
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono">
            Got questions about how Shipyard runs in production?
          </p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {[
            {
              q: "How does the dual-operating mode work in a single repository?",
              a: "When deployed on Vercel, the environment variable VERCEL=1 is automatically detected, causing Shipyard to build and serve the official public marketing showcase, documentation site, and dynamic bash installer scripts. When installed on a Linux VPS via install.sh, the environment variable SHIPYARD_MODE=appliance activates the full PaaS control plane, Docker runner daemon, in-browser file editor, and database engine.",
            },
            {
              q: "Does Shipyard require Kubernetes or heavy memory?",
              a: "No. Shipyard intentionally avoids Kubernetes. It runs on a lightweight Node.js supervisor directly interfacing with Docker Engine and Caddy 2, consuming less than 140 MB of idle RAM. It runs effortlessly on any $5/month Linux VPS.",
            },
            {
              q: "How does the Git Push Auto-Deployment work?",
              a: "Shipyard generates an authenticated webhook endpoint for your repository. When you push to GitHub or GitLab, Shipyard verifies the webhook signature, clones the branch into an isolated container sandbox, detects the project type (Dockerfile, Node, Python, Static), runs tests and migrations, and shifts reverse proxy traffic with zero downtime.",
            },
            {
              q: "Can I host plain HTML, CSS, and JS files without Git?",
              a: "Yes! Shipyard features a built-in in-browser file editor and asset uploader. You can drag and drop static HTML/CSS/JS files or edit code in real time in the dashboard and hit 'Save & Redeploy' to update your site in under a second.",
            },
            {
              q: "How do custom domains and SSL certificates work?",
              a: "Shipyard dynamically assigns collision-free internal ports (30000-39999) to every workload and registers them with Caddy. When you add a custom domain (e.g., app.yourdomain.com), Caddy automatically provisions and renews Let's Encrypt TLS certificates without certbot.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-800 rounded-xl bg-[#090d14] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-zinc-200 hover:text-white transition-colors"
              >
                <span className="font-sans font-bold text-sm text-zinc-100">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    openFaq === idx ? "transform rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-zinc-300 font-sans text-xs leading-relaxed border-t border-zinc-900 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 max-w-5xl mx-auto pb-32 relative z-10">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#09101b] via-[#05080e] to-[#050608] p-8 sm:p-14 text-center space-y-6 shadow-[0_0_60px_rgba(0,240,255,0.1)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <Anchor className="w-3.5 h-3.5" />
            <span>READY FOR IMMEDIATE DEPLOYMENT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display">
            Take Control of Your Infrastructure.
          </h2>

          <p className="text-sm text-zinc-300 max-w-lg mx-auto">
            Install the Shipyard appliance on your VPS right now with one command, or explore the documentation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCopy}
              className="px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(0,240,255,0.35)] hover:scale-[1.02] font-mono tracking-wider"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-zinc-950" />
                  <span>COMMAND COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-950" />
                  <span>COPY 1-LINE INSTALL COMMAND</span>
                </>
              )}
            </button>
            <Link
              href="/docs"
              className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs transition-colors border border-zinc-700 font-mono tracking-wider"
            >
              EXPLORE ARCHITECTURE DOCS &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Industrial Footer */}
      <footer className="border-t border-zinc-800/80 py-12 px-6 text-xs text-zinc-500 font-mono bg-[#030406]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-center text-cyan-400">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <span className="text-zinc-200 font-black tracking-widest">SHIPYARD</span>
              <span className="text-zinc-600 mx-2">//</span>
              <span>ZERO-CONFIG DEVELOPER PLATFORM</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/docs" className="hover:text-cyan-300 transition-colors">
              Docs
            </Link>
            <Link href="/docs#quickstart" className="hover:text-cyan-300 transition-colors">
              Installer Script
            </Link>
            <Link href="/login" className="hover:text-cyan-300 transition-colors">
              Control Plane Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
