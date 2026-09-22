"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ConnectNodeModal } from "@/components/servers/connect-node-modal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Plus,
  RefreshCw,
  Box,
  Layers,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { ServerModel } from "@/types";

export default function ServersPage() {
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectOpen, setIsConnectOpen] = useState(false);

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

  const totalCores = servers.reduce((acc, s) => acc + (s.cpuCores || 0), 0);
  const totalMemBytes = servers.reduce((acc, s) => acc + (s.memoryTotal || 0), 0);
  const totalMemGb = (totalMemBytes / (1024 * 1024 * 1024)).toFixed(1);

  return (
    <AppShell title="Cluster Nodes & Servers">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Cluster Worker Nodes</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Distributed execution plane with real-time CPU, RAM, Disk, and Docker container telemetry
          </p>
        </div>

        <Button
          size="sm"
          variant="default"
          onClick={() => setIsConnectOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Node</span>
        </Button>
      </div>

      {/* Cluster Capacity Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-1">
            <span>Online Worker Nodes</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {servers.filter((s) => s.status === "ONLINE").length}{" "}
            <span className="text-xs text-zinc-500 font-normal">/ {servers.length} total</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-1">
            <span>Total Compute Capacity</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalCores} <span className="text-xs text-zinc-500 font-normal">vCPU Cores</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-1">
            <span>Aggregated Memory Pool</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {totalMemGb} <span className="text-xs text-zinc-500 font-normal">GB RAM</span>
          </div>
        </Card>
      </div>

      {/* Servers Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {servers.map((server) => {
          const isOnline = server.status === "ONLINE";
          const memUsedGb = ((server.memoryUsed || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const memTotalGb = ((server.memoryTotal || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const diskUsedGb = ((server.diskUsed || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const diskTotalGb = ((server.diskTotal || 0) / (1024 * 1024 * 1024)).toFixed(1);
          const netInKb = Math.round((server.networkInSec || 0) / 1024);
          const netOutKb = Math.round((server.networkOutSec || 0) / 1024);

          return (
            <Card key={server.id} className="p-6 space-y-5 hover:border-zinc-700 transition-all">
              {/* Node Header */}
              <div className="flex items-start justify-between border-b border-zinc-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-cyan-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-mono">{server.name}</h3>
                      <Badge
                        variant={isOnline ? "cyan" : "destructive"}
                        className="text-[10px] py-0"
                      >
                        {server.status}
                      </Badge>
                      {server.isLocalHost && (
                        <Badge variant="outline" className="text-[10px] py-0">
                          Control Plane Host
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {server.host} • Docker Engine: {server.dockerVersion}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-zinc-500">
                  <span className="block text-white font-semibold">{server.cpuCores} Cores</span>
                  <span>Agent v{server.agentVersion}</span>
                </div>
              </div>

              {/* Progress Bar Gauges */}
              <div className="space-y-4">
                {/* CPU Utilization */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>CPU Utilization</span>
                    </span>
                    <span className="text-white font-bold">{server.cpuUsage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, server.cpuUsage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Memory Allocation */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Memory (RAM)</span>
                    </span>
                    <span className="text-white font-bold">
                      {server.memoryUsage}% ({memUsedGb} / {memTotalGb} GB)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, server.memoryUsage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Disk Space */}
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-purple-400" />
                      <span>Storage Volume</span>
                    </span>
                    <span className="text-white font-bold">
                      {server.diskUsage}% ({diskUsedGb} / {diskTotalGb} GB)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, server.diskUsage)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Node Metrics Footer */}
              <div className="pt-3.5 border-t border-zinc-850 flex items-center justify-between text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-zinc-500" />
                  <span>
                    ↓ {netInKb} KB/s • ↑ {netOutKb} KB/s
                  </span>
                </div>

                <div>
                  Running Workloads:{" "}
                  <span className="text-white font-bold">{server.projectCount || 0}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ConnectNodeModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onNodeAdded={() => fetchServers()}
      />
    </AppShell>
  );
}
