"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { LogViewer } from "@/components/deployments/log-viewer";
import {
  Rocket,
  ArrowUpRight,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  X,
} from "lucide-react";
import { DeploymentModel } from "@/types";

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<DeploymentModel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

  const fetchDeployments = async () => {
    try {
      const res = await fetch("/api/deployments");
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 3500);
    return () => clearInterval(interval);
  }, []);

  const filtered = deployments.filter((d) => {
    const matchesSearch =
      (d.projectName && d.projectName.toLowerCase().includes(search.toLowerCase())) ||
      (d.commitMessage && d.commitMessage.toLowerCase().includes(search.toLowerCase())) ||
      (d.commitHash && d.commitHash.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell title="Deployments">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project, commit, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="BUILDING">Building</option>
            <option value="FAILED">Failed</option>
            <option value="QUEUED">Queued</option>
          </select>
        </div>
      </div>

      {/* Deployments Table */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            No deployments found matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900 text-xs">
            {filtered.map((dep) => (
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
                      <Link
                        href={`/projects/${dep.projectId}`}
                        className="font-semibold text-zinc-100 hover:underline"
                      >
                        {dep.projectName || "Project"}
                      </Link>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {dep.commitHash?.substring(0, 8) || "HEAD"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                        {dep.trigger}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{dep.branch}</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{dep.commitMessage}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      by {dep.commitAuthor || "Unknown"} on {dep.serverName || "Local Node"} •{" "}
                      {new Date(dep.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right font-mono text-xs text-zinc-400">
                    <div>{dep.durationMs ? `${(dep.durationMs / 1000).toFixed(1)}s` : "-"}</div>
                    <div className="text-[10px] text-zinc-500">{dep.status}</div>
                  </div>

                  <button
                    onClick={() => setSelectedDeploymentId(dep.id)}
                    className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 transition-colors flex items-center gap-1.5"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Logs</span>
                  </button>

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

      {/* Log Inspector Drawer / Modal */}
      {selectedDeploymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0e0e11] border border-zinc-800 rounded-lg max-w-4xl w-full h-[75vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-200">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span>Deployment Logs: {selectedDeploymentId}</span>
              </div>
              <button
                onClick={() => setSelectedDeploymentId(null)}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <LogViewer deploymentId={selectedDeploymentId} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
