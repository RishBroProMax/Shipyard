"use client";

import { useEffect, useState } from "react";
import { Cpu, HardDrive, Network, Plus, Server, Menu } from "lucide-react";

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
    <header className="h-14 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Hamburger & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-sm font-semibold text-zinc-100 tracking-tight truncate">
          {title || "Dashboard"}
        </h1>
      </div>

      {/* Real-time Telemetry Bar & Action Buttons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Telemetry Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>CPU</span>
            <span className="text-zinc-200 font-medium">{telemetry.cpu}%</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
            <span>RAM</span>
            <span className="text-zinc-200 font-medium">
              {telemetry.ramUsedGb}/{telemetry.ramTotalGb} GB
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-zinc-400" />
            <span>NET</span>
            <span className="text-zinc-200 font-medium">
              ↓ {telemetry.netInKb} KB/s ↑ {telemetry.netOutKb} KB/s
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenConnectNode && (
            <button
              onClick={onOpenConnectNode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Connect Node</span>
            </button>
          )}

          {onOpenNewProject && (
            <button
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
