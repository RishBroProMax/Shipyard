"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { LogViewer } from "@/components/deployments/log-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Rocket,
  ArrowUpRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  X,
  ExternalLink,
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Deployments History</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Immutable build artifacts, container builds, duration telemetry, and real-time logs
          </p>
        </div>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by project, commit, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="BUILDING">Building</option>
            <option value="FAILED">Failed</option>
            <option value="QUEUED">Queued</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          Showing {filtered.length} of {deployments.length} total deployment{deployments.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Deployments Table */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            No deployments recorded matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900 text-xs font-mono">
            {filtered.map((dep) => {
              const isRunning = dep.status === "RUNNING";
              const isBuilding = dep.status === "BUILDING" || dep.status === "DEPLOYING";
              const isFailed = dep.status === "FAILED";

              return (
                <div
                  key={dep.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        isRunning
                          ? "bg-emerald-400"
                          : isBuilding
                          ? "bg-amber-400 animate-pulse"
                          : isFailed
                          ? "bg-red-400"
                          : "bg-zinc-600"
                      }`}
                    ></span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/projects/${dep.projectId}`}
                          className="font-bold text-white hover:text-cyan-300 transition-colors"
                        >
                          {dep.projectName || "Project"}
                        </Link>
                        <span className="text-zinc-500 text-[11px]">
                          {dep.commitHash?.substring(0, 8) || "HEAD"}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {dep.trigger}
                        </Badge>
                        <span className="text-[11px] text-zinc-400">{dep.branch}</span>
                      </div>

                      <p className="text-xs text-zinc-300 font-sans mt-1">
                        {dep.commitMessage || "Deployment build"}
                      </p>

                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        by {dep.commitAuthor || "System"} on {dep.serverName || "Local Node"} •{" "}
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
                      onClick={() => setSelectedDeploymentId(dep.id)}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Logs</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Log Viewer Modal */}
      {selectedDeploymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0b0c10] border border-zinc-800 rounded-2xl max-w-4xl w-full h-[650px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">Deployment Console Output</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">{selectedDeploymentId}</span>
              </div>
              <button
                onClick={() => setSelectedDeploymentId(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-0 overflow-hidden">
              <LogViewer deploymentId={selectedDeploymentId} isLive={false} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
