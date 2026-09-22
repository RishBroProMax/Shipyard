"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { ConnectNodeModal } from "@/components/servers/connect-node-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cpu,
  FolderGit2,
  HardDrive,
  Network,
  Plus,
  Radio,
  Rocket,
  Server,
  Terminal,
  XCircle,
  ExternalLink,
  Layers,
  ShieldCheck,
  RefreshCw,
  Box,
} from "lucide-react";
import { DeploymentModel, ProjectModel, ServerModel } from "@/types";

export function OverviewView() {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [deployments, setDeployments] = useState<DeploymentModel[]>([]);
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isConnectNodeOpen, setIsConnectNodeOpen] = useState(false);
  const [preselectedTemplate, setPreselectedTemplate] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    try {
      const [projRes, depRes, srvRes, statRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/deployments"),
        fetch("/api/servers"),
        fetch("/api/system/status"),
      ]);

      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.projects || []);
      }
      if (depRes.ok) {
        const data = await depRes.json();
        setDeployments(data.deployments || []);
      }
      if (srvRes.ok) {
        const data = await srvRes.json();
        setServers(data.servers || []);
      }
      if (statRes.ok) {
        const data = await statRes.json();
        setSystemStatus(data);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, []);

  const runningProjectsCount = projects.filter((p) => p.status === "RUNNING").length;
  const onlineServersCount = servers.filter((s) => s.status === "ONLINE").length;
  const successfulDeploys = deployments.filter((d) => d.status === "RUNNING").length;
  const successRate =
    deployments.length > 0 ? Math.round((successfulDeploys / deployments.length) * 100) : 0;

  const handleOpenStarter = (templateId: string) => {
    setPreselectedTemplate(templateId);
    setIsNewProjectOpen(true);
  };

  return (
    <AppShell title="Cluster Overview">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Cluster Dashboard</h1>
            <Badge variant="cyan" className="font-mono text-[10px] tracking-wider">
              VERCEL-LITE APPLIANCE
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            Self-hosted container orchestration, real-time hardware telemetry, and dynamic reverse proxy routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConnectNodeOpen(true)}
            className="gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <span>Connect Node</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setPreselectedTemplate(undefined);
              setIsNewProjectOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Onboarding Wizard banner if user has <= 1 project */}
      {showWizard && projects.length <= 1 && (
        <OnboardingWizard
          onOpenConnectNode={() => setIsConnectNodeOpen(true)}
          onOpenNewProject={() => {
            setPreselectedTemplate(undefined);
            setIsNewProjectOpen(true);
          }}
          onDismiss={() => setShowWizard(false)}
        />
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Container Workloads */}
        <Card className="hover:border-zinc-700/80 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Running Workloads
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Box className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {runningProjectsCount}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                / {projects.length} container{projects.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                {systemStatus?.services?.dockerEngine?.status === "UP"
                  ? "Docker Engine isolated"
                  : "Native supervisor sandbox"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Build Success Rate */}
        <Card className="hover:border-zinc-700/80 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Build Health
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Rocket className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {deployments.length > 0 ? `${successRate}%` : "Ready"}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                ({deployments.length} deployment{deployments.length === 1 ? "" : "s"})
              </span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Collision-free port routing</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Connected Nodes */}
        <Card className="hover:border-zinc-700/80 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Worker Nodes
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Server className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {onlineServersCount}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                / {servers.length} node{servers.length === 1 ? "" : "s"} online
              </span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AES-256 encrypted control link</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Web Server & Network */}
        <Card className="hover:border-zinc-700/80 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Web Server & I/O
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Network className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-lg font-bold text-white">
                ↓ {Math.round((systemStatus?.cluster?.networkInSec || 0) / 1024)} KB/s
              </span>
              <span className="text-xs text-zinc-500">
                ↑ {Math.round((systemStatus?.cluster?.networkOutSec || 0) / 1024)} KB/s
              </span>
            </div>
            <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>{systemStatus?.proxy?.activeRoutes || 0} active Caddy routes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cluster Resource Telemetry Bar */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <CardTitle className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Host Kernel Telemetry & Resource Usage
            </CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] text-zinc-400">
            Real Hardware /proc Stats
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
                <span>CPU Utilization</span>
                <span className="text-white font-semibold">
                  {systemStatus?.cluster?.avgCpuUsage || 0}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, systemStatus?.cluster?.avgCpuUsage || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* RAM Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
                <span>Memory Allocation</span>
                <span className="text-white font-semibold">
                  {systemStatus?.cluster?.memoryUsagePercent || 0}% (
                  {(
                    (systemStatus?.cluster?.memoryUsedBytes || 0) /
                    (1024 * 1024 * 1024)
                  ).toFixed(1)}{" "}
                  GB)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, systemStatus?.cluster?.memoryUsagePercent || 0)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Storage / Active Containers */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2">
                <span>Active Workloads</span>
                <span className="text-white font-semibold">
                  {runningProjectsCount} active ({servers.length} node{servers.length === 1 ? "" : "s"})
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      projects.length > 0 ? (runningProjectsCount / projects.length) * 100 : 0
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vercel-Style 1-Click Starter Templates Shelf */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Deploy Ready-To-Run Starters (1-Click Real Workloads)
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Instant zero-config code</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: "static-landing",
              title: "Modern Static Web",
              desc: "Pure HTML5, CSS3, dynamic telemetry widget. Instant 2s deploy.",
              tag: "Static / Edge",
              color: "text-cyan-400",
            },
            {
              id: "express-api",
              title: "Node.js Express API",
              desc: "Production REST API with /api/health, /api/stats, and CORS.",
              tag: "Node.js 20",
              color: "text-emerald-400",
            },
            {
              id: "python-fastapi",
              title: "Python FastAPI",
              desc: "Asynchronous Python API with auto-generated Swagger /docs.",
              tag: "Python 3.11",
              color: "text-yellow-400",
            },
            {
              id: "nextjs-app",
              title: "Next.js 14 App",
              desc: "Modern React 18 App Router with standalone Docker outputs.",
              tag: "React 18 / SSR",
              color: "text-white",
            },
          ].map((starter) => (
            <Card
              key={starter.id}
              onClick={() => handleOpenStarter(starter.id)}
              className="cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/60 transition-all p-4 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {starter.tag}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {starter.title}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{starter.desc}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-900/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300">
                <span>Deploy Starter</span>
                <span>→</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Active Projects & Recent Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects Shelf */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Active Projects & Containers
            </h2>
            <Link
              href="/projects"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>View All ({projects.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <Card className="p-8 text-center">
              <FolderGit2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No projects deployed yet</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                Choose one of the 1-click starters above, connect any public or private Git repository, or drop files in the in-browser code editor.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setPreselectedTemplate("static-landing");
                    setIsNewProjectOpen(true);
                  }}
                >
                  Deploy First Project
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 6).map((project) => {
                const isRunning = project.status === "RUNNING";
                const isBuilding = project.status === "BUILDING" || project.status === "DEPLOYING";
                const isFailed = project.status === "FAILED";

                return (
                  <Card
                    key={project.id}
                    className="p-5 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isRunning
                                ? "bg-emerald-400"
                                : isBuilding
                                ? "bg-amber-400 animate-pulse"
                                : isFailed
                                ? "bg-red-400"
                                : "bg-zinc-600"
                            }`}
                          ></span>
                          <span className="text-[11px] font-mono font-medium text-zinc-300">
                            {project.status}
                          </span>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {project.appType}
                        </Badge>
                      </div>

                      <Link href={`/projects/${project.id}`}>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{project.slug}</p>
                      </Link>

                      <div className="mt-3 space-y-1 text-xs text-zinc-400 font-mono">
                        <div className="truncate text-[11px] text-zinc-500">
                          {project.repoUrl}
                        </div>
                        {project.allocatedPort && (
                          <div className="text-[11px] text-zinc-400">
                            Port: <span className="text-zinc-200">{project.allocatedPort}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between">
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono truncate max-w-[200px]"
                        >
                          <span>{project.liveUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-zinc-600 font-mono">Queued</span>
                      )}

                      <Link
                        href={`/projects/${project.id}`}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                      >
                        Details →
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Deployments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Live Deployments
            </h2>
            <Link
              href="/deployments"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="overflow-hidden">
            {deployments.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                No deployment history yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-900 text-xs">
                {deployments.slice(0, 6).map((dep) => (
                  <Link
                    key={dep.id}
                    href={`/projects/${dep.projectId}`}
                    className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors block"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          dep.status === "RUNNING"
                            ? "bg-emerald-400"
                            : dep.status === "FAILED"
                            ? "bg-red-400"
                            : "bg-amber-400 animate-pulse"
                        }`}
                      ></span>
                      <div>
                        <div className="font-semibold text-zinc-100 font-mono">
                          {dep.projectName || "App"}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono truncate max-w-[160px]">
                          {dep.commitHash?.substring(0, 7) || "HEAD"} • {dep.branch}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] text-zinc-500">
                      <div>{dep.durationMs ? `${(dep.durationMs / 1000).toFixed(1)}s` : "-"}</div>
                      <span className="text-[10px] text-zinc-400">{dep.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Overhauled Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        initialTemplate={preselectedTemplate}
        onClose={() => {
          setIsNewProjectOpen(false);
          setPreselectedTemplate(undefined);
        }}
        onCreated={() => {
          fetchData();
        }}
      />

      <ConnectNodeModal
        isOpen={isConnectNodeOpen}
        onClose={() => setIsConnectNodeOpen(false)}
        onNodeAdded={() => fetchData()}
      />
    </AppShell>
  );
}
