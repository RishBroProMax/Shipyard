"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { LogViewer } from "@/components/deployments/log-viewer";
import { FileEditor } from "@/components/projects/file-editor";
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

        // Set active deployment for logs
        if (p.deployments && p.deployments.length > 0) {
          setActiveDeploymentId(p.deployments[0].id);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchProject();
    const interval = setInterval(fetchProject, 3500);
    return () => clearInterval(interval);
  }, [projectId]);

  if (!project) {
    return (
      <AppShell title="Loading Project...">
        <div className="p-12 text-center text-zinc-500 font-mono text-xs">
          Loading project data...
        </div>
      </AppShell>
    );
  }

  // Quick Action: Trigger Deploy
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

  // Add Env Pair
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

  // Add Domain
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

  // Delete Domain
  const handleDeleteDomain = async (domainId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/domains/${domainId}`, {
        method: "DELETE",
      });
      fetchProject();
    } catch {}
  };

  // Save Settings
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

  // Delete Project
  const handleDeleteProject = async () => {
    if (confirm(`Are you sure you want to delete project '${project.name}'? This action cannot be undone.`)) {
      await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      router.push("/projects");
    }
  };

  const latestDeployment = project.deployments?.[0];
  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/github` : "/api/webhooks/github";

  return (
    <AppShell title={project.name}>
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-100">{project.name}</h1>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  project.status === "RUNNING"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80"
                    : project.status === "FAILED"
                    ? "bg-red-950 text-red-400 border border-red-800/80"
                    : "bg-amber-950 text-amber-300 border border-amber-800/80"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{project.slug}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/60 rounded transition-colors"
            >
              <span>Visit Application</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => handleDeploy()}
            disabled={isDeploying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded transition-colors shadow-sm disabled:opacity-50"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{isDeploying ? "Building..." : "Deploy Now"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-800 gap-6 mb-6 text-xs font-medium overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: FolderGit2 },
          { id: "editor", label: "Files & Editor", icon: FileCode },
          { id: "deployments", label: "Deployments", icon: Rocket },
          { id: "logs", label: "Live Logs", icon: Terminal },
          { id: "environment", label: "Environment", icon: Key },
          { id: "domains", label: "Domains", icon: Globe },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-1.5 transition-colors border-b-2 -mb-px shrink-0 ${
                isActive
                  ? "border-zinc-100 text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: File Editor */}
      {activeTab === "editor" && (
        <FileEditor projectId={project.id} onDeployRequested={() => handleDeploy()} />
      )}

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Latest Deployment Summary Card */}
          <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Current Active Deployment
              </h3>
              {latestDeployment && (
                <span className="text-[11px] text-zinc-500 font-mono">
                  {new Date(latestDeployment.createdAt).toLocaleString()}
                </span>
              )}
            </div>

            {latestDeployment ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] block mb-1">COMMIT</span>
                  <span className="text-zinc-200 font-semibold">
                    {latestDeployment.commitHash?.substring(0, 8) || "HEAD"}
                  </span>
                  <p className="text-zinc-400 text-[11px] mt-0.5 truncate">
                    {latestDeployment.commitMessage || "Manual deployment"}
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] block mb-1">INTERNAL PORT</span>
                  <span className="text-emerald-400 font-semibold">
                    {project.allocatedPort ? `:${project.allocatedPort}` : "Auto"}
                  </span>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Proxy: *.shipyard.local</p>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] block mb-1">BUILD DURATION</span>
                  <span className="text-zinc-200 font-semibold">
                    {latestDeployment.durationMs
                      ? `${(latestDeployment.durationMs / 1000).toFixed(1)}s`
                      : "Running"}
                  </span>
                  <p className="text-zinc-500 text-[10px] mt-0.5">
                    Trigger: {latestDeployment.trigger}
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800/80">
                  <span className="text-zinc-500 text-[10px] block mb-1">TARGET NODE</span>
                  <span className="text-zinc-200 font-semibold">
                    {project.serverName || "Local Node"}
                  </span>
                  <p className="text-emerald-400 text-[10px] mt-0.5">Isolated Sandbox</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500 text-xs font-mono">
                No deployments have been executed for this project yet.
              </div>
            )}
          </div>

          {/* Quick Details & Webhook Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Git Configuration */}
            <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Repository & Branch
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-zinc-900">
                  <span className="text-zinc-500">Repository</span>
                  <span className="text-zinc-300 truncate max-w-xs">{project.repoUrl}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-900">
                  <span className="text-zinc-500">Branch</span>
                  <span className="text-zinc-300">{project.branch}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-900">
                  <span className="text-zinc-500">Buildpack</span>
                  <span className="text-zinc-300">{project.appType}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Auto-Deploy on Push</span>
                  <span className={project.autoDeploy ? "text-emerald-400" : "text-zinc-500"}>
                    {project.autoDeploy ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub Webhook for Auto Deploy */}
            <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                GitHub Webhook (Auto-Deploy)
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Add this URL to your GitHub Repository Settings &rarr; Webhooks. When you push to branch &lsquo;{project.branch}&rsquo;, Shipyard will automatically trigger a zero-downtime deployment.
              </p>
              <div className="relative mt-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full pl-3 pr-20 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 2000);
                  }}
                  className="absolute right-1.5 top-1.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedWebhook ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Deployments History */}
      {activeTab === "deployments" && (
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Deployment History
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              {project.deployments?.length || 0} builds recorded
            </span>
          </div>

          <div className="divide-y divide-zinc-900 text-xs">
            {project.deployments?.map((dep) => (
              <div
                key={dep.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 ${
                      dep.status === "RUNNING"
                        ? "bg-emerald-500"
                        : dep.status === "FAILED"
                        ? "bg-red-500"
                        : "bg-amber-400 animate-pulse"
                    }`}
                  ></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-zinc-200">
                        {dep.commitHash?.substring(0, 8) || "HEAD"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                        {dep.trigger}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {dep.branch}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{dep.commitMessage}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      by {dep.commitAuthor || "Unknown"} • {new Date(dep.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right font-mono text-xs text-zinc-400">
                    <div>{dep.durationMs ? `${(dep.durationMs / 1000).toFixed(1)}s` : "-"}</div>
                    <div className="text-[10px] text-zinc-500">{dep.status}</div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveDeploymentId(dep.id);
                      setActiveTab("logs");
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 transition-colors"
                  >
                    View Logs
                  </button>

                  <button
                    onClick={() => handleDeploy(dep.id)}
                    title="Rollback to this revision"
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rollback</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Logs */}
      {activeTab === "logs" && (
        <div className="h-[600px]">
          {activeDeploymentId ? (
            <LogViewer deploymentId={activeDeploymentId} isLive={project.status === "BUILDING" || project.status === "DEPLOYING"} />
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs">
              Select a deployment to inspect logs.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Environment Variables */}
      {activeTab === "environment" && (
        <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Encrypted Environment Variables</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono">
                  AES-256-GCM Vault
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Variables are injected securely into application containers at runtime and never exposed in build logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5"
              >
                {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSecrets ? "Hide Values" : "Reveal Values"}</span>
              </button>
              <button
                type="button"
                onClick={handleAddEnv}
                className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 hover:bg-zinc-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {envVars.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs font-mono">
                No environment variables defined yet.
              </div>
            ) : (
              envVars.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="KEY"
                    value={pair.key}
                    onChange={(e) => handleEnvChange(idx, "key", e.target.value)}
                    className="w-1/3 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
                  />
                  <input
                    type={showSecrets ? "text" : "password"}
                    placeholder="VALUE"
                    value={pair.value}
                    onChange={(e) => handleEnvChange(idx, "value", e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEnv(idx)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            {envSaveSuccess ? (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Environment variables saved & encrypted</span>
              </span>
            ) : (
              <span></span>
            )}

            <button
              onClick={handleSaveEnv}
              disabled={isSavingEnv}
              className="px-4 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded transition-colors disabled:opacity-50"
            >
              {isSavingEnv ? "Encrypting & Saving..." : "Save Variables"}
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Domains */}
      {activeTab === "domains" && (
        <div className="space-y-6">
          <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono mb-2">
              Add Custom Domain
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Map a custom domain or subdomain to your application container. Automatic SSL certificates are provisioned via reverse proxy.
            </p>

            <form onSubmit={handleAddDomain} className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="e.g. api.yourdomain.com or myapp.org"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
              />
              <button
                type="submit"
                disabled={isAddingDomain}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded transition-colors disabled:opacity-50"
              >
                {isAddingDomain ? "Adding..." : "Add Domain"}
              </button>
            </form>
          </div>

          {/* Configured Domains List */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Configured Domains
            </div>

            <div className="divide-y divide-zinc-900 text-xs font-mono">
              {/* Default internal route */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-zinc-300 font-semibold">{project.slug}.shipyard.local</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500">
                    Internal Default
                  </span>
                </div>
                <span className="text-emerald-400 text-[11px]">ACTIVE</span>
              </div>

              {/* Custom domains */}
              {project.domains?.map((d) => (
                <div key={d.id} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-200 font-semibold">{d.domain}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                      Custom
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{d.sslStatus}</span>
                    </span>
                    <button
                      onClick={() => handleDeleteDomain(d.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Settings */}
      {activeTab === "settings" && (
        <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono border-b border-zinc-800 pb-2">
              Project Build & Runtime Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Branch</label>
                <input
                  type="text"
                  value={settingsForm.branch}
                  onChange={(e) => setSettingsForm({ ...settingsForm, branch: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Root Directory</label>
                <input
                  type="text"
                  value={settingsForm.rootDir}
                  onChange={(e) => setSettingsForm({ ...settingsForm, rootDir: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Container Target Port</label>
                <input
                  type="number"
                  value={settingsForm.targetPort}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, targetPort: parseInt(e.target.value, 10) || 3000 })
                  }
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Custom Dockerfile Path (Optional)
              </label>
              <input
                type="text"
                placeholder="Dockerfile"
                value={settingsForm.dockerfilePath}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, dockerfilePath: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoDeployPush"
                checked={settingsForm.autoDeploy}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, autoDeploy: e.target.checked })
                }
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-0"
              />
              <label htmlFor="autoDeployPush" className="text-xs text-zinc-300 cursor-pointer">
                Automatically deploy whenever new commits are pushed to {settingsForm.branch}
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-4 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded transition-colors disabled:opacity-50"
            >
              {isSavingSettings ? "Saving..." : "Save Settings"}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-red-950/60 max-w-2xl">
            <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider font-mono mb-1">
              Danger Zone
            </h4>
            <p className="text-xs text-zinc-500 mb-3">
              Permanently delete this project, its active containers, and all deployment history.
            </p>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="px-3 py-1.5 rounded bg-red-950/50 hover:bg-red-900/60 border border-red-800/80 text-xs font-semibold text-red-300 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Project</span>
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
