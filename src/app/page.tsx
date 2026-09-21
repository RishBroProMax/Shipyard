"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cpu,
  FolderGit2,
  HardDrive,
  Network,
  Radio,
  Rocket,
  Server,
  XCircle,
} from "lucide-react";
import { DeploymentModel, ProjectModel, ServerModel } from "@/types";

export default function OverviewPage() {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [deployments, setDeployments] = useState<DeploymentModel[]>([]);
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [showWizard, setShowWizard] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projRes, depRes, srvRes, actRes, statRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/deployments"),
        fetch("/api/servers"),
        fetch("/api/activity"),
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
      if (actRes.ok) {
        const data = await actRes.json();
        setActivity(data.activity || []);
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
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const runningProjectsCount = projects.filter((p) => p.status === "RUNNING").length;
  const onlineServersCount = servers.filter((s) => s.status === "ONLINE").length;
  const successfulDeploys = deployments.filter((d) => d.status === "RUNNING").length;
  const successRate =
    deployments.length > 0 ? Math.round((successfulDeploys / deployments.length) * 100) : 100;

  return (
    <AppShell title="Cluster Overview">
      {/* Onboarding Wizard banner if projects <= 1 */}
      {showWizard && (
        <OnboardingWizard
          onOpenConnectNode={() => {
            const btn = document.querySelector('button:has(svg[class*="lucide-server"])') as HTMLButtonElement;
            btn?.click();
          }}
          onOpenNewProject={() => {
            const btn = document.querySelector('button:has(svg[class*="lucide-plus"])') as HTMLButtonElement;
            btn?.click();
          }}
          onDismiss={() => setShowWizard(false)}
        />
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Running Projects */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Running Workloads</span>
            <FolderGit2 className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {runningProjectsCount}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ {projects.length} total</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Zero-downtime proxy active</span>
          </div>
        </div>

        {/* Card 2: Deployment Success Rate */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Build Success Rate</span>
            <Rocket className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">{successRate}%</span>
            <span className="text-xs text-zinc-500 font-mono">
              ({deployments.length} total builds)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Health checks verified</span>
          </div>
        </div>

        {/* Card 3: Connected Nodes */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Cluster Worker Nodes</span>
            <Server className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {onlineServersCount}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ {servers.length} online</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All nodes responding</span>
          </div>
        </div>

        {/* Card 4: Network Throughput */}
        <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Network Throughput</span>
            <Network className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-zinc-100">
              ↓ {Math.round((systemStatus?.cluster?.networkInSec || 0) / 1024)} KB/s
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              ↑ {Math.round((systemStatus?.cluster?.networkOutSec || 0) / 1024)} KB/s
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 font-mono">
            Dynamic Reverse Proxy (Caddy)
          </div>
        </div>
      </div>

      {/* Cluster Resource Telemetry Bar */}
      <div className="mb-6 p-4 rounded-lg bg-zinc-950 border border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Cluster Resource Utilization
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>CPU Usage</span>
              <span className="text-zinc-200 font-medium">
                {systemStatus?.cluster?.avgCpuUsage || 0}%
              </span>
            </div>
            <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-zinc-200 transition-all duration-500"
                style={{ width: `${Math.min(100, systemStatus?.cluster?.avgCpuUsage || 0)}%` }}
              ></div>
            </div>
          </div>

          {/* RAM Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>RAM Usage</span>
              <span className="text-zinc-200 font-medium">
                {systemStatus?.cluster?.memoryUsagePercent || 0}% (
                {(
                  (systemStatus?.cluster?.memoryUsedBytes || 0) /
                  (1024 * 1024 * 1024)
                ).toFixed(1)}{" "}
                GB)
              </span>
            </div>
            <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-zinc-200 transition-all duration-500"
                style={{
                  width: `${Math.min(100, systemStatus?.cluster?.memoryUsagePercent || 0)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Storage / Active Containers */}
          <div>
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
              <span>Active Containers</span>
              <span className="text-zinc-200 font-medium">
                {runningProjectsCount} running ({servers.length} nodes)
              </span>
            </div>
            <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, projects.length > 0 ? (runningProjectsCount / projects.length) * 100 : 0)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Deployments & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Deployments */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Recent Deployments
            </h2>
            <Link
              href="/deployments"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden">
            {deployments.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No deployments recorded yet. Create a project to start building.
              </div>
            ) : (
              <div className="divide-y divide-zinc-900 text-xs">
                {deployments.slice(0, 5).map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {dep.status === "RUNNING" ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      ) : dep.status === "FAILED" ? (
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">
                            {dep.projectName || "Project"}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500">
                            {dep.commitHash?.substring(0, 7) || "HEAD"}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                            {dep.trigger}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {dep.commitMessage || "Deployment"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right font-mono text-[11px] text-zinc-400">
                      <div>
                        <div>{dep.durationMs ? `${(dep.durationMs / 1000).toFixed(1)}s` : "-"}</div>
                        <div className="text-[10px] text-zinc-600">
                          {new Date(dep.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {dep.liveUrl && (
                        <a
                          href={dep.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Activity Audit Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
              Audit Activity
            </h2>
            <Link
              href="/activity"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono"
            >
              <span>Full Audit</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 divide-y divide-zinc-900 text-xs">
            {activity.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-xs">No activity logged yet.</div>
            ) : (
              activity.slice(0, 6).map((act) => (
                <div key={act.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-300 font-medium">{act.action}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    {act.userEmail || "System"} • {act.entityType}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
