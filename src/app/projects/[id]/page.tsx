"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { LogViewer } from "@/components/deployments/log-viewer";
import { FileEditor } from "@/components/projects/file-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Globe,
  Key,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  RotateCcw,
  Server,
  Settings,
  Shield,
  Square,
  Terminal,
  Trash2,
  XCircle,
  Eye,
  EyeOff,
  FileCode,
  Box,
  Cpu,
  HardDrive,
  Network,
  Power,
} from "lucide-react";
import { ProjectModel, DeploymentModel, DomainModel } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectModel | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "editor" | "deployments" | "logs" | "environment" | "domains" | "settings"
  >("overview");
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);

  // Live Container Monitoring State
  const [containerInfo, setContainerInfo] = useState<any>(null);
  const [isOperatingContainer, setIsOperatingContainer] = useState(false);

  // Environment variables state
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSavingEnv, setIsSavingEnv] = useState(false);
  const [envSaveSuccess, setEnvSaveSuccess] = useState(false);

  // Domain state
  const [newDomain, setNewDomain] = useState("");
  const [isAddingDomain, setIsAddingDomain] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    branch: "main",
    appType: "AUTO",
    rootDir: "/",
    dockerfilePath: "",
    buildCommand: "",
    runCommand: "",
    targetPort: 3000,
    autoDeploy: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        const p: ProjectModel = data.project;
        setProject(p);

        // Populate env vars
        if (p.envVars) {
          const pairs = Object.entries(p.envVars).map(([key, value]) => ({ key, value }));
          setEnvVars(pairs);
        }

        // Populate settings
        setSettingsForm({
          name: p.name,
          branch: p.branch,
          appType: p.appType,
          rootDir: p.rootDir || "/",
          dockerfilePath: p.dockerfilePath || "",
          buildCommand: p.buildCommand || "",
          runCommand: p.runCommand || "",
          targetPort: p.targetPort || 3000,
          autoDeploy: p.autoDeploy,
        });

        // Set active deployment for logs if none selected
        if (p.deployments && p.deployments.length > 0 && !activeDeploymentId) {
          setActiveDeploymentId(p.deployments[0].id);
        }
      }
    } catch {}
  };

  const fetchContainerMetrics = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/container`);
      if (res.ok) {
        const data = await res.json();
        setContainerInfo(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchProject();
    fetchContainerMetrics();
    const interval = setInterval(() => {
      fetchProject();
      fetchContainerMetrics();
    }, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (!project) {
    return (
      <AppShell title="Loading Project...">
        <div className="p-12 text-center text-zinc-500 font-mono text-xs">
          Loading project telemetry...
        </div>
      </AppShell>
    );
  }

  // Trigger Deployment
  const handleDeploy = async (rollbackId?: string) => {
    setIsDeploying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollbackDeploymentId: rollbackId }),
      });
      const data = await res.json();
      if (data.deploymentId) {
        setActiveDeploymentId(data.deploymentId);
        setActiveTab("logs");
      }
      fetchProject();
    } catch {
    } finally {
      setIsDeploying(false);
    }
  };

  // Container Lifecycle Action (restart, stop, start)
  const handleContainerAction = async (action: "start" | "stop" | "restart") => {
    setIsOperatingContainer(true);
    try {
      await fetch(`/api/projects/${projectId}/container`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await fetchContainerMetrics();
      await fetchProject();
    } catch {
    } finally {
      setIsOperatingContainer(false);
    }
  };

  // Environment variable handlers
  const handleAddEnv = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const handleRemoveEnv = (idx: number) => {
    setEnvVars(envVars.filter((_, i) => i !== idx));
  };

  const handleEnvChange = (idx: number, field: "key" | "value", val: string) => {
    const updated = [...envVars];
    updated[idx][field] = val;
    setEnvVars(updated);
  };

  const handleSaveEnv = async () => {
    setIsSavingEnv(true);
    try {
      const formatted: Record<string, string> = {};
      for (const pair of envVars) {
        if (pair.key.trim()) {
          formatted[pair.key.trim()] = pair.value;
        }
      }

      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envVars: formatted }),
      });

      setEnvSaveSuccess(true);
      setTimeout(() => setEnvSaveSuccess(false), 2500);
      fetchProject();
    } catch {
    } finally {
      setIsSavingEnv(false);
    }
  };

  // Custom Domain Handlers
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setIsAddingDomain(true);
    try {
      await fetch(`/api/projects/${projectId}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });
      setNewDomain("");
      fetchProject();
    } catch {
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/domains?domainId=${domainId}`, {
        method: "DELETE",
      });
      fetchProject();
    } catch {}
  };

  // Settings Handlers
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      fetchProject();
    } catch {
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteProject = async () => {
    if (confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`)) {
      try {
        await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
        router.push("/projects");
      } catch {}
    }
  };

  const isRunning = project.status === "RUNNING";
  const isBuilding = project.status === "BUILDING" || project.status === "DEPLOYING";
  const isFailed = project.status === "FAILED";
  const isStopped = project.status === "STOPPED";

  const stats = containerInfo?.stats;
  const memoryUsedMb = stats ? Math.round(stats.memoryUsageBytes / (1024 * 1024)) : 0;
  const memoryLimitMb = stats ? Math.round(stats.memoryLimitBytes / (1024 * 1024)) : 0;

  return (
    <AppShell title={project.name}>
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/projects"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-300">{project.slug}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">{project.name}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRunning
                    ? "bg-emerald-400"
                    : isBuilding
                    ? "bg-amber-400 animate-pulse"
                    : isFailed
                    ? "bg-red-400"
                    : isStopped
                    ? "bg-zinc-500"
                    : "bg-zinc-600"
                }`}
              ></span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {project.status}
              </Badge>
              <Badge variant="cyan" className="font-mono text-[10px]">
                {project.appType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons: Container Controls & Deploy */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isRunning ? (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={isOperatingContainer}
                onClick={() => handleContainerAction("restart")}
                className="gap-1.5"
                title="Restart container without rebuild"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isOperatingContainer ? "animate-spin" : ""}`} />
                <span>Restart</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isOperatingContainer}
                onClick={() => handleContainerAction("stop")}
                className="gap-1.5 text-red-400 hover:text-red-300"
                title="Stop container workload"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Stop</span>
              </Button>
            </>
          ) : isStopped ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isOperatingContainer}
              onClick={() => handleContainerAction("start")}
              className="gap-1.5 text-emerald-400 hover:text-emerald-300"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Container</span>
            </Button>
          ) : null}

          <Button
            variant="default"
            size="sm"
            disabled={isDeploying}
            onClick={() => handleDeploy()}
            className="gap-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{isDeploying ? "Deploying..." : "Redeploy Build"}</span>
          </Button>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <span>Visit</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          )}
        </div>
      </div>

      {/* Tabs Navigation (Pill style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-zinc-800/80">
        {[
          { id: "overview", label: "Overview", icon: Box },
          { id: "editor", label: "Web Files & Code", icon: FileCode },
          { id: "deployments", label: "Deployments", icon: Rocket },
          { id: "logs", label: "Console Stream", icon: Terminal },
          { id: "environment", label: "Environment Variables", icon: Key },
          { id: "domains", label: "Custom Domains", icon: Globe },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Live Container Telemetry Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <CardTitle className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                  Container Runtime Telemetry ({containerInfo?.containerName || `shipyard-${project.slug}`})
                </CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-emerald-400">
                Live Stats (3s)
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Metric 1: CPU */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-1">
                    <span>CPU Usage</span>
                    <span className="text-white font-bold">{stats?.cpuPercent || 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mt-2">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, stats?.cpuPercent || 0)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metric 2: RAM */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-1">
                    <span>Memory</span>
                    <span className="text-white font-bold">
                      {memoryUsedMb} MB {memoryLimitMb > 0 ? `/ ${memoryLimitMb} MB` : ""}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mt-2">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, stats?.memoryPercent || 0)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metric 3: Network I/O */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-mono mb-1">Network I/O</div>
                  <div className="text-xs font-mono text-zinc-200 mt-2">
                    ↓ {Math.round((stats?.networkInBytes || 0) / 1024)} KB / ↑{" "}
                    {Math.round((stats?.networkOutBytes || 0) / 1024)} KB
                  </div>
                </div>

                {/* Metric 4: PIDs & Port */}
                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className="text-xs text-zinc-400 font-mono mb-1">Port & Processes</div>
                  <div className="text-xs font-mono text-zinc-200 mt-2">
                    Host: <span className="text-cyan-400">{project.allocatedPort || "-"}</span> | PIDs:{" "}
                    {stats?.pids || 1}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white">Application Configuration</CardTitle>
                <CardDescription>Source repository, buildpack, and execution parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 font-mono text-xs text-zinc-300">
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Repository</span>
                  <span className="truncate max-w-[240px] text-zinc-200">{project.repoUrl}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Branch</span>
                  <span className="text-zinc-200">{project.branch}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Buildpack</span>
                  <span className="text-cyan-400">{project.appType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Target Container Port</span>
                  <span className="text-zinc-200">{project.targetPort}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Host Port Mapping</span>
                  <span className="text-zinc-200">{project.allocatedPort || "None allocated"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Cluster Node</span>
                  <span className="text-zinc-200">{project.serverName || "Local Node (Built-in)"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white">Live Web Routing</CardTitle>
                <CardDescription>Dynamic Caddy reverse proxy endpoint and SSL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 mb-1">Default Service URL</div>
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1.5"
                    >
                      <span>{project.liveUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-500 font-mono">Not live yet</span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400">
                  <div className="font-semibold text-zinc-200 mb-1">Zero-Downtime Hot Reload</div>
                  <p className="leading-relaxed text-[11px]">
                    Whenever a new deployment finishes health checks, Caddy updates the active route instantaneously with zero dropped requests.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: File Editor */}
      {activeTab === "editor" && (
        <Card className="h-[650px] overflow-hidden p-0">
          <FileEditor
            projectId={project.id}
            onFileSaved={() => {
              // Trigger auto redeploy on code edit
            }}
          />
        </Card>
      )}

      {/* Tab 3: Deployments */}
      {activeTab === "deployments" && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-zinc-900 text-xs font-mono">
            {project.deployments && project.deployments.length > 0 ? (
              project.deployments.map((dep) => (
                <div
                  key={dep.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 ${
                        dep.status === "RUNNING"
                          ? "bg-emerald-400"
                          : dep.status === "FAILED"
                          ? "bg-red-400"
                          : "bg-amber-400 animate-pulse"
                      }`}
                    ></span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {dep.commitHash?.substring(0, 8) || "HEAD"}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {dep.trigger}
                        </Badge>
                        <span className="text-zinc-400">{dep.branch}</span>
                      </div>
                      <p className="text-zinc-300 mt-1 font-sans text-xs">{dep.commitMessage}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(dep.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right text-[11px] text-zinc-400">
                      <div>{dep.durationMs ? `${(dep.durationMs / 1000).toFixed(1)}s` : "-"}</div>
                      <span className="text-zinc-500">{dep.status}</span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveDeploymentId(dep.id);
                        setActiveTab("logs");
                      }}
                      className="gap-1 text-xs h-7"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Logs</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500">No deployments recorded yet.</div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Logs */}
      {activeTab === "logs" && (
        <Card className="h-[650px] p-0 overflow-hidden">
          {activeDeploymentId ? (
            <LogViewer
              deploymentId={activeDeploymentId}
              isLive={isBuilding || project.status === "BUILDING"}
            />
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs">
              Select a deployment to view terminal console logs.
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Environment Variables */}
      {activeTab === "environment" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">AES-256-GCM Environment Variables</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Encrypted at rest with your appliance key and injected into Docker containers at runtime.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
                className="gap-1.5"
              >
                {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSecrets ? "Hide" : "Show"} Values</span>
              </Button>
              <Button variant="default" size="sm" onClick={handleAddEnv} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pair</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-w-2xl">
            {envVars.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs font-mono border border-dashed border-zinc-800 rounded-xl">
                No environment variables configured.
              </div>
            ) : (
              envVars.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Input
                    type="text"
                    placeholder="VARIABLE_NAME"
                    value={pair.key}
                    onChange={(e) => handleEnvChange(idx, "key", e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <Input
                    type={showSecrets ? "text" : "password"}
                    placeholder="VALUE"
                    value={pair.value}
                    onChange={(e) => handleEnvChange(idx, "value", e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEnv(idx)}
                    className="p-2 text-zinc-500 hover:text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            <div className="pt-4 flex items-center justify-between">
              <Button
                variant="cyan"
                size="sm"
                disabled={isSavingEnv}
                onClick={handleSaveEnv}
              >
                {isSavingEnv ? "Encrypting & Saving..." : "Save Environment"}
              </Button>
              {envSaveSuccess && (
                <span className="text-xs text-emerald-400 font-mono">
                  ✓ Encrypted variables synchronized! Redeploy to apply.
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tab 6: Domains */}
      {activeTab === "domains" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-1">Add Custom Domain</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Point an A record or CNAME to this server and Shipyard will issue an automatic SSL certificate.
            </p>

            <form onSubmit={handleAddDomain} className="flex items-center gap-3 max-w-md">
              <Input
                type="text"
                placeholder="app.example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="font-mono text-xs"
              />
              <Button type="submit" variant="default" size="sm" disabled={isAddingDomain}>
                {isAddingDomain ? "Adding..." : "Add Domain"}
              </Button>
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="divide-y divide-zinc-900 text-xs font-mono">
              {project.domains && project.domains.length > 0 ? (
                project.domains.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-900/30"
                  >
                    <div>
                      <div className="font-bold text-white">{d.domain}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Added {new Date(d.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="cyan" className="text-[10px]">
                        {d.sslStatus || "ACTIVE"}
                      </Badge>
                      <button
                        onClick={() => handleDeleteDomain(d.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-zinc-500 text-xs font-mono">
                  No custom domains configured. The application is reachable via its assigned port and subdomain.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <Card className="p-6 max-w-2xl">
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">Build & Execution Parameters</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Project Name
                  </label>
                  <Input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Branch
                  </label>
                  <Input
                    type="text"
                    value={settingsForm.branch}
                    onChange={(e) => setSettingsForm({ ...settingsForm, branch: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Root Directory
                  </label>
                  <Input
                    type="text"
                    value={settingsForm.rootDir}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rootDir: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Container Port
                  </label>
                  <Input
                    type="number"
                    value={settingsForm.targetPort}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        targetPort: parseInt(e.target.value, 10) || 3000,
                      })
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoDeploySetting"
                  checked={settingsForm.autoDeploy}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, autoDeploy: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="autoDeploySetting" className="text-xs text-zinc-300 cursor-pointer">
                  Auto-deploy whenever Git commits are pushed
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="default" size="sm" disabled={isSavingSettings}>
                  {isSavingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 max-w-2xl border-red-950/80 bg-red-950/10">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono mb-1">
              Danger Zone
            </h4>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Permanently stop and delete this container, remove all build logs, and wipe associated volumes.
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteProject}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Project</span>
            </Button>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
