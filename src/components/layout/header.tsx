"use client";

import { useEffect, useState } from "react";
import { Cpu, HardDrive, Network, Plus, Server, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  onOpenNewProject?: () => void;
  onOpenConnectNode?: () => void;
  onOpenMobileMenu?: () => void;
}

interface TelemetryData {
  cpu: number;
  ramUsedGb: number;
  ramTotalGb: number;
  netInKb: number;
  netOutKb: number;
}

export function Header({
  title,
  onOpenNewProject,
  onOpenConnectNode,
  onOpenMobileMenu,
}: HeaderProps) {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cpu: 0,
    ramUsedGb: 0,
    ramTotalGb: 0,
    netInKb: 0,
    netOutKb: 0,
  });

  // Poll real-time system metrics every 4 seconds
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          if (data.cluster) {
            setTelemetry({
              cpu: data.cluster.avgCpuUsage || 0,
              ramUsedGb: parseFloat(
                ((data.cluster.memoryUsedBytes || 0) / (1024 * 1024 * 1024)).toFixed(1)
              ),
              ramTotalGb: parseFloat(
                ((data.cluster.memoryTotalBytes || 0) / (1024 * 1024 * 1024)).toFixed(1)
              ),
              netInKb: Math.round((data.cluster.networkInSec || 0) / 1024),
              netOutKb: Math.round((data.cluster.networkOutSec || 0) / 1024),
            });
          }
        }
      } catch {}
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      {/* Mobile Hamburger & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-base font-bold text-white tracking-tight truncate">
          {title || "Cluster Overview"}
        </h1>
      </div>

      {/* Real-time Telemetry Bar & Action Buttons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Telemetry Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-full bg-[#0c0d12] border border-zinc-800 text-[11px] font-mono text-zinc-400 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPU</span>
            <span className="text-zinc-200 font-semibold">{telemetry.cpu}%</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>RAM</span>
            <span className="text-zinc-200 font-semibold">
              {telemetry.ramUsedGb}/{telemetry.ramTotalGb} GB
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>NET</span>
            <span className="text-zinc-200 font-semibold">
              ↓{telemetry.netInKb}k ↑{telemetry.netOutKb}k/s
            </span>
          </div>
        </div>

        {/* Connect Worker Node Button */}
        {onOpenConnectNode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenConnectNode}
            className="rounded-xl border-zinc-750 hover:border-zinc-700 text-zinc-200 flex items-center gap-1.5 shadow-sm"
          >
            <Server className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Connect Node</span>
          </Button>
        )}

        {/* New Project Button */}
        {onOpenNewProject && (
          <Button
            variant="cyan"
            size="sm"
            onClick={onOpenNewProject}
            className="rounded-xl flex items-center gap-1.5 shadow-sm shadow-cyan-500/10"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Project</span>
          </Button>
        )}
      </div>
    </header>
  );
}
