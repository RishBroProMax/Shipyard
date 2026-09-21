"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Radio,
  Plus,
  RefreshCw,
  Clock,
  Shield,
  Layers,
  Terminal,
} from "lucide-react";
import { ServerModel } from "@/types";

export default function ServersPage() {
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServers = async () => {
    try {
      const res = await fetch("/api/servers");
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppShell title="Cluster Nodes & Servers">
      {/* Cluster Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Registered Worker Nodes</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time telemetry of CPU, Memory, Disk, and Network bandwidth across all nodes
          </p>
        </div>
      </div>

      {/* Servers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servers.map((server) => {
          const isOnline = server.status === "ONLINE";
          const memUsedGb = ((server.memoryUsed || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const memTotalGb = ((server.memoryTotal || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const diskUsedGb = ((server.diskUsed || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const diskTotalGb = ((server.diskTotal || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const netInKb = Math.round((server.networkInSec || 0) / 1024);
          const netOutKb = Math.round((server.networkOutSec || 0) / 1024);

          return (
            <div
              key={server.id}
              className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-5"
            >
              {/* Node Header */}
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-300">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-100 font-mono">{server.name}</h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isOnline
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                            : "bg-red-950 text-red-400 border border-red-800/60"
                        }`}
                      >
                        {server.status}
                      </span>
                      {server.isLocalHost && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      {server.host} • Docker: {server.dockerVersion}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-zinc-500">
                  <span className="block">{server.cpuCores} Cores</span>
                  <span>v{server.agentVersion}</span>
                </div>
              </div>

              {/* Real-time Telemetry Progress Bars */}
              <div className="space-y-3.5">
                {/* CPU Gauge */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                      <span>CPU Utilization</span>
                    </span>
                    <span className="text-zinc-200 font-semibold">{server.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-zinc-200 transition-all duration-300"
                      style={{ width: `${Math.min(100, server.cpuUsage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* RAM Gauge */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Memory (RAM)</span>
                    </span>
                    <span className="text-zinc-200 font-semibold">
                      {server.memoryUsage}% ({memUsedGb} / {memTotalGb} GB)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-zinc-200 transition-all duration-300"
                      style={{ width: `${Math.min(100, server.memoryUsage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Disk Gauge */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Disk Storage</span>
                    </span>
                    <span className="text-zinc-200 font-semibold">
                      {server.diskUsage}% ({diskUsedGb} / {diskTotalGb} GB)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-zinc-400 transition-all duration-300"
                      style={{ width: `${Math.min(100, server.diskUsage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Network In/Out */}
                <div className="p-3 bg-zinc-900/50 rounded border border-zinc-800/80 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Network className="w-4 h-4 text-zinc-500" />
                    <span>Live Network I/O</span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-200">
                    <span>↓ {netInKb} KB/s</span>
                    <span>↑ {netOutKb} KB/s</span>
                  </div>
                </div>
              </div>

              {/* Node Details Footer */}
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Heartbeat: {new Date(server.lastHeartbeatAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Isolated Sandbox</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
