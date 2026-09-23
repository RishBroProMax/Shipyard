"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { ConnectNodeModal } from "@/components/servers/connect-node-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  FolderGit2,
  HardDrive,
  Network,
  Plus,
  Rocket,
  Server,
  ExternalLink,
  Box,
  Zap,
  RefreshCw,
  TrendingUp,
  Globe,
  MemoryStick,
  ArrowDown,
  ArrowUp,
  Circle,
} from "lucide-react";
import { DeploymentModel, ProjectModel, ServerModel } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LiveMetrics {
  ts: number;
  cpu: { cores: number; usage: number };
  memory: { total: number; used: number; free: number; usage: number; totalGb: number; usedGb: number };
  disk: { total: number; used: number; free: number; usage: number; totalGb: number; usedGb: number };
  network: { inSec: number; outSec: number; inTotal: number; outTotal: number; inKbSec: number; outKbSec: number };
  system: { platform: string; uptime: number; nodeUptime: number; loadAvg: number[]; hostname: string };
  docker: { version: string; containers: number; available: boolean };
}

// ── Mini Sparkline Component ───────────────────────────────────────────────────
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...data, 1);
    const step = w / (data.length - 1);
    const points = data.map((v, i) => ({ x: i * step, y: h - (v / max) * (h - 4) }));
    // Fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "40");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(0, h);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
  }, [data, color]);
  return <canvas ref={canvasRef} width={180} height={height} className="w-full" style={{ height }} />;
}

// ── Radial Ring ────────────────────────────────────────────────────────────────
function RadialRing({
  value,
  max = 100,
  size = 80,
  stroke = 6,
  color,
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color: string;
  label: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const dash = circ * pct;
  const center = size / 2;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="text-center" style={{ marginTop: -size / 2 - 6 }}>
        <div
          className="text-xs font-bold font-mono"
          style={{ color, lineHeight: 1 }}
        >
          {label}
        </div>
        {sublabel && (
          <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--ink-300)" }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}
function fmtBytes(b: number) {
  if (b > 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB/s`;
  if (b > 1024) return `${(b / 1024).toFixed(1)} KB/s`;
  return `${b} B/s`;
}

const STATUS_COLOR: Record<string, string> = {
  RUNNING: "#10b981",
  BUILDING: "#f59e0b",
  DEPLOYING: "#f59e0b",
  FAILED: "#ef4444",
  IDLE: "#6366f1",
  STOPPED: "#52525b",
  QUEUED: "#8b5cf6",
};

// ═══════════════════════════════════════════════════════════════════════════════
export function OverviewView() {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [deployments, setDeployments] = useState<DeploymentModel[]>([]);
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isConnectNodeOpen, setIsConnectNodeOpen] = useState(false);
  const [preselectedTemplate, setPreselectedTemplate] = useState<string | undefined>(undefined);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Sparkline history buffers
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(Array(30).fill(0));
  const [netInHistory, setNetInHistory] = useState<number[]>(Array(30).fill(0));
  const [netOutHistory, setNetOutHistory] = useState<number[]>(Array(30).fill(0));

  // ── Fast metrics poll (2s) ────────────────────────────────────────────────
  const pollMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/system/metrics", { cache: "no-store" });
      if (!res.ok) return;
      const data: LiveMetrics = await res.json();
      setMetrics(data);
      setCpuHistory((h) => [...h.slice(-29), data.cpu.usage]);
      setMemHistory((h) => [...h.slice(-29), data.memory.usage]);
      setNetInHistory((h) => [...h.slice(-29), data.network.inSec / 1024]);
      setNetOutHistory((h) => [...h.slice(-29), data.network.outSec / 1024]);
      setLastRefresh(new Date());
    } catch {}
  }, []);

  // ── Data poll (5s) ───────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [projRes, depRes, srvRes, statRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/deployments"),
        fetch("/api/servers"),
        fetch("/api/system/status"),
      ]);
      if (projRes.ok) setProjects((await projRes.json()).projects || []);
      if (depRes.ok) setDeployments((await depRes.json()).deployments || []);
      if (srvRes.ok) setServers((await srvRes.json()).servers || []);
      if (statRes.ok) setSystemStatus(await statRes.json());
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    pollMetrics();
    const metricsInterval = setInterval(pollMetrics, 2000);
    const dataInterval = setInterval(fetchData, 8000);
    return () => {
      clearInterval(metricsInterval);
      clearInterval(dataInterval);
    };
  }, [fetchData, pollMetrics]);

  const runningProjectsCount = projects.filter((p) => p.status === "RUNNING").length;
  const onlineServersCount = servers.filter((s) => s.status === "ONLINE").length;
  const successfulDeploys = deployments.filter((d) => d.status === "RUNNING").length;

  const handleOpenStarter = (templateId: string) => {
    setPreselectedTemplate(templateId);
    setIsNewProjectOpen(true);
  };

  return (
    <AppShell title="Cluster Overview">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", color: "var(--ink-50)" }}
            >
              Cluster Dashboard
            </h1>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded border"
              style={{
                background: "rgba(0,212,255,0.08)",
                borderColor: "var(--signal-border)",
                color: "var(--signal)",
                letterSpacing: "0.12em",
              }}
            >
              LIVE
            </span>
            {metrics && (
              <span className="text-[11px] font-mono" style={{ color: "var(--ink-300)" }}>
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
          <p className="text-xs font-mono" style={{ color: "var(--ink-300)" }}>
            {metrics?.system.hostname || "shipyard-node"} ·{" "}
            {metrics ? fmtUptime(metrics.system.uptime) : "–"} uptime ·{" "}
            {metrics?.cpu.cores || "–"} cores · {metrics?.system.platform || "linux"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { fetchData(); pollMetrics(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all"
            style={{
              background: "var(--ink-700)",
              border: "1px solid var(--ink-600)",
              color: "var(--ink-200)",
            }}
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConnectNodeOpen(true)}
            className="gap-1.5 font-mono text-xs"
          >
            <Server className="w-3.5 h-3.5" />
            Add Node
          </Button>
          <Button
            size="sm"
            onClick={() => { setPreselectedTemplate(undefined); setIsNewProjectOpen(true); }}
            className="gap-1.5 font-mono text-xs"
            style={{ background: "var(--signal)", color: "var(--ink-900)" }}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* ── Onboarding ──────────────────────────────────────────────────── */}
      {showWizard && projects.length <= 1 && (
        <OnboardingWizard
          onOpenConnectNode={() => setIsConnectNodeOpen(true)}
          onOpenNewProject={() => { setPreselectedTemplate(undefined); setIsNewProjectOpen(true); }}
          onDismiss={() => setShowWizard(false)}
        />
      )}

      {/* ── Live Hardware Monitoring Panel ──────────────────────────────── */}
      <div
        className="rounded-lg p-4 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--ink-800) 0%, var(--ink-850) 100%)",
          border: "1px solid var(--ink-700)",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--ink-700) 1px, transparent 1px), linear-gradient(90deg, var(--ink-700) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.2,
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" style={{ color: "var(--signal)" }} />
            <span
              className="text-xs font-semibold font-mono uppercase tracking-widest"
              style={{ color: "var(--ink-100)" }}
            >
              Live Host Telemetry
            </span>
            {!metrics && (
              <span className="text-[10px] font-mono animate-pulse" style={{ color: "var(--ink-400)" }}>
                Collecting…
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* CPU */}
            <div
              className="rounded-md p-3"
              style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" style={{ color: "var(--signal)" }} />
                  <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--ink-300)" }}>
                    CPU
                  </span>
                </div>
                <span
                  className="text-lg font-bold font-mono tabular-nums"
                  style={{
                    color:
                      (metrics?.cpu.usage || 0) > 80
                        ? "#ef4444"
                        : (metrics?.cpu.usage || 0) > 50
                        ? "#f59e0b"
                        : "var(--signal)",
                  }}
                >
                  {metrics ? `${metrics.cpu.usage.toFixed(1)}%` : "–"}
                </span>
              </div>
              <Sparkline data={cpuHistory} color="#00d4ff" height={36} />
              <div className="flex justify-between mt-1.5 text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                <span>{metrics?.cpu.cores || "–"} cores</span>
                <span>load: {metrics?.system.loadAvg?.[0]?.toFixed(2) || "–"}</span>
              </div>
            </div>

            {/* RAM */}
            <div
              className="rounded-md p-3"
              style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <MemoryStick className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                  <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--ink-300)" }}>
                    RAM
                  </span>
                </div>
                <span
                  className="text-lg font-bold font-mono tabular-nums"
                  style={{
                    color:
                      (metrics?.memory.usage || 0) > 85
                        ? "#ef4444"
                        : (metrics?.memory.usage || 0) > 65
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                >
                  {metrics ? `${metrics.memory.usage.toFixed(1)}%` : "–"}
                </span>
              </div>
              <Sparkline data={memHistory} color="#10b981" height={36} />
              <div className="flex justify-between mt-1.5 text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                <span>{metrics ? `${metrics.memory.usedGb.toFixed(1)}GB` : "–"} used</span>
                <span>{metrics ? `${metrics.memory.totalGb.toFixed(1)}GB` : "–"} total</span>
              </div>
            </div>

            {/* Network IN */}
            <div
              className="rounded-md p-3"
              style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ArrowDown className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                  <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--ink-300)" }}>
                    NET IN
                  </span>
                </div>
                <span className="text-lg font-bold font-mono tabular-nums" style={{ color: "#6366f1" }}>
                  {metrics ? `${metrics.network.inKbSec.toFixed(1)}` : "–"}
                  <span className="text-[11px] ml-0.5">KB/s</span>
                </span>
              </div>
              <Sparkline data={netInHistory} color="#6366f1" height={36} />
              <div className="flex justify-between mt-1.5 text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                <span>↓ inbound</span>
                <span>{metrics ? fmtBytes(metrics.network.inSec) : "–"}</span>
              </div>
            </div>

            {/* Network OUT */}
            <div
              className="rounded-md p-3"
              style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.12)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ArrowUp className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                  <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--ink-300)" }}>
                    NET OUT
                  </span>
                </div>
                <span className="text-lg font-bold font-mono tabular-nums" style={{ color: "#f59e0b" }}>
                  {metrics ? `${metrics.network.outKbSec.toFixed(1)}` : "–"}
                  <span className="text-[11px] ml-0.5">KB/s</span>
                </span>
              </div>
              <Sparkline data={netOutHistory} color="#f59e0b" height={36} />
              <div className="flex justify-between mt-1.5 text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                <span>↑ outbound</span>
                <span>{metrics ? fmtBytes(metrics.network.outSec) : "–"}</span>
              </div>
            </div>
          </div>

          {/* Disk bar */}
          {metrics && (
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--ink-700)" }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" style={{ color: "var(--ink-300)" }} />
                  <span className="text-[11px] font-mono" style={{ color: "var(--ink-300)" }}>
                    Disk — {metrics.disk.usedGb.toFixed(1)}GB used / {metrics.disk.totalGb.toFixed(1)}GB total
                  </span>
                </div>
                <span
                  className="text-[11px] font-mono font-semibold"
                  style={{
                    color:
                      metrics.disk.usage > 85
                        ? "#ef4444"
                        : metrics.disk.usage > 70
                        ? "#f59e0b"
                        : "var(--ink-200)",
                  }}
                >
                  {metrics.disk.usage.toFixed(1)}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--ink-700)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, metrics.disk.usage)}%`,
                    background:
                      metrics.disk.usage > 85
                        ? "linear-gradient(90deg, #ef4444, #dc2626)"
                        : metrics.disk.usage > 70
                        ? "linear-gradient(90deg, #f59e0b, #d97706)"
                        : "linear-gradient(90deg, var(--ink-400), var(--ink-300))",
                  }}
                />
              </div>
            </div>
          )}

          {/* Docker info pill */}
          {metrics?.docker.available && (
            <div className="mt-3 flex items-center gap-3">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded"
                style={{ background: "rgba(0,212,255,0.08)", color: "var(--signal)", border: "1px solid var(--signal-border)" }}
              >
                Docker {metrics.docker.version}
              </span>
              <span className="text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                {metrics.docker.containers} container{metrics.docker.containers !== 1 ? "s" : ""} running
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Stats Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Running Apps",
            value: runningProjectsCount,
            sub: `${projects.length} total`,
            icon: Box,
            accent: "var(--signal)",
          },
          {
            label: "Online Nodes",
            value: onlineServersCount,
            sub: `${servers.length} connected`,
            icon: Server,
            accent: "#10b981",
          },
          {
            label: "Deployments",
            value: deployments.length,
            sub: `${successfulDeploys} live`,
            icon: Rocket,
            accent: "#6366f1",
          },
          {
            label: "Proxy Routes",
            value: systemStatus?.proxy?.activeRoutes || 0,
            sub: "active caddy",
            icon: Globe,
            accent: "#f59e0b",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-4 flex items-center gap-3"
            style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${stat.accent}18`, border: `1px solid ${stat.accent}30` }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.accent }} />
            </div>
            <div>
              <div className="text-xl font-bold font-mono tabular-nums" style={{ color: stat.accent, lineHeight: 1 }}>
                {isLoading ? "–" : stat.value}
              </div>
              <div className="text-[11px] font-mono" style={{ color: "var(--ink-300)" }}>
                {stat.label}
              </div>
              <div className="text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                {stat.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 1-Click Starters ─────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "#f59e0b" }} />
            <span
              className="text-xs font-semibold font-mono uppercase tracking-widest"
              style={{ color: "var(--ink-200)" }}
            >
              1-Click Deploy
            </span>
          </div>
          <span className="text-[11px] font-mono" style={{ color: "var(--ink-400)" }}>
            instant zero-config
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { id: "static-landing", title: "Static Web", tag: "HTML/CSS", color: "#00d4ff", icon: Globe },
            { id: "express-api", title: "Express API", tag: "Node 20", color: "#10b981", icon: Zap },
            { id: "python-fastapi", title: "FastAPI", tag: "Python 3.11", color: "#f59e0b", icon: Activity },
            { id: "nextjs-app", title: "Next.js 14", tag: "React SSR", color: "#a78bfa", icon: TrendingUp },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => handleOpenStarter(s.id)}
              className="p-3 rounded-lg text-left transition-all group"
              style={{
                background: "var(--ink-800)",
                border: "1px solid var(--ink-700)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = s.color + "50";
                (e.currentTarget as HTMLElement).style.background = s.color + "08";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-700)";
                (e.currentTarget as HTMLElement).style.background = "var(--ink-800)";
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: s.color }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: "var(--ink-50)" }}>
                {s.title}
              </div>
              <div
                className="text-[10px] font-mono mt-0.5 px-1.5 py-0.5 rounded inline-block"
                style={{ background: s.color + "18", color: s.color }}
              >
                {s.tag}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects + Deployments ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projects — 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-semibold font-mono uppercase tracking-widest"
              style={{ color: "var(--ink-200)" }}
            >
              Projects
            </span>
            <Link
              href="/projects"
              className="text-xs font-mono flex items-center gap-1 transition-colors"
              style={{ color: "var(--ink-400)" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ink-50)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--ink-400)")}
            >
              View all ({projects.length}) <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div
              className="rounded-lg p-8 text-center"
              style={{ background: "var(--ink-800)", border: "1px dashed var(--ink-600)" }}
            >
              <FolderGit2 className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ink-500)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--ink-200)" }}>
                No projects yet
              </p>
              <p className="text-xs font-mono mt-1" style={{ color: "var(--ink-400)" }}>
                Deploy from a Git URL or pick a starter above
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => { setPreselectedTemplate("static-landing"); setIsNewProjectOpen(true); }}
                style={{ background: "var(--signal)", color: "var(--ink-900)" }}
              >
                Deploy First App
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.slice(0, 6).map((project) => {
                const statusColor = STATUS_COLOR[project.status] || "#52525b";
                const isBuilding = project.status === "BUILDING" || project.status === "DEPLOYING";
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block rounded-lg p-4 transition-all group"
                    style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-600)";
                      (e.currentTarget as HTMLElement).style.background = "var(--ink-750)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-700)";
                      (e.currentTarget as HTMLElement).style.background = "var(--ink-800)";
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${isBuilding ? "animate-pulse" : ""}`}
                          style={{ background: statusColor }}
                        />
                        <span className="text-sm font-semibold" style={{ color: "var(--ink-50)", fontFamily: "'Syne', sans-serif" }}>
                          {project.name}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: statusColor + "20", color: statusColor, border: `1px solid ${statusColor}40` }}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono truncate mb-2" style={{ color: "var(--ink-400)" }}>
                      {project.repoUrl || project.slug}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span style={{ color: "var(--ink-400)" }}>
                        {project.appType} · port {project.allocatedPort || "–"}
                      </span>
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1"
                          style={{ color: "#10b981" }}
                        >
                          Live <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span style={{ color: "var(--ink-500)" }}>not live</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Deployments — 1 col */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-semibold font-mono uppercase tracking-widest"
              style={{ color: "var(--ink-200)" }}
            >
              Deployments
            </span>
            <Link
              href="/deployments"
              className="text-xs font-mono flex items-center gap-1"
              style={{ color: "var(--ink-400)" }}
            >
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div
            className="rounded-lg overflow-hidden"
            style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)" }}
          >
            {deployments.length === 0 ? (
              <div className="p-6 text-center">
                <Rocket className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--ink-500)" }} />
                <p className="text-xs font-mono" style={{ color: "var(--ink-400)" }}>
                  No deployments yet
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--ink-700)" }}>
                {deployments.slice(0, 7).map((dep) => {
                  const sc = STATUS_COLOR[dep.status] || "#52525b";
                  return (
                    <Link
                      key={dep.id}
                      href={`/projects/${dep.projectId}`}
                      className="flex items-center justify-between px-3 py-2.5 transition-colors"
                      style={{ borderColor: "var(--ink-700)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ink-750)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Circle
                          className="w-1.5 h-1.5 shrink-0 fill-current"
                          style={{ color: sc }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate" style={{ color: "var(--ink-100)" }}>
                            {(dep as any).projectName || "app"}
                          </div>
                          <div className="text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                            {dep.commitHash?.slice(0, 7) || "HEAD"} · {dep.branch}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-[10px] font-mono" style={{ color: "var(--ink-400)" }}>
                          {dep.durationMs ? `${(dep.durationMs / 1000).toFixed(0)}s` : "–"}
                        </div>
                        <div
                          className="text-[10px] font-mono"
                          style={{ color: sc }}
                        >
                          {dep.status}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Service Health Bar ───────────────────────────────────────────── */}
      {systemStatus && (
        <div
          className="mt-4 rounded-lg px-4 py-3 flex items-center gap-4 flex-wrap"
          style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)" }}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--ink-400)" }}>
            Services
          </span>
          {Object.entries(systemStatus.services || {}).map(([key, svc]: [string, any]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: svc.status === "UP" ? "#10b981" : svc.status === "STANDALONE" ? "#f59e0b" : "#ef4444" }}
              />
              <span className="text-[10px] font-mono" style={{ color: "var(--ink-300)" }}>
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        initialTemplate={preselectedTemplate}
        onClose={() => { setIsNewProjectOpen(false); setPreselectedTemplate(undefined); }}
        onCreated={() => { fetchData(); }}
      />
      <ConnectNodeModal
        isOpen={isConnectNodeOpen}
        onClose={() => setIsConnectNodeOpen(false)}
        onNodeAdded={() => fetchData()}
      />
    </AppShell>
  );
}
