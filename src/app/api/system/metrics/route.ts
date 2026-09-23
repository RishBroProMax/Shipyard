import { NextResponse } from "next/server";
import {
  getHostCpuMetrics,
  getHostMemoryMetrics,
  getHostDiskMetrics,
  getHostNetworkMetrics,
  getHostDockerMetrics,
} from "@/lib/system/telemetry";
import os from "os";

// Fast live metrics endpoint — no DB reads, no proxy sync.
// Reads directly from /proc and os module. Responds in <50ms.
// Used by the dashboard for real-time CPU/RAM/NET polling.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const cpu = getHostCpuMetrics();
    const mem = getHostMemoryMetrics();
    const disk = getHostDiskMetrics();
    const net = getHostNetworkMetrics();
    const docker = getHostDockerMetrics();

    return NextResponse.json({
      ts: Date.now(),
      cpu: {
        cores: cpu.cores,
        usage: cpu.usage,
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.total - mem.used,
        usage: mem.usage,
        totalGb: parseFloat((mem.total / (1024 ** 3)).toFixed(2)),
        usedGb: parseFloat((mem.used / (1024 ** 3)).toFixed(2)),
      },
      disk: {
        total: disk.total,
        used: disk.used,
        free: disk.total - disk.used,
        usage: disk.usage,
        totalGb: parseFloat((disk.total / (1024 ** 3)).toFixed(1)),
        usedGb: parseFloat((disk.used / (1024 ** 3)).toFixed(1)),
      },
      network: {
        inSec: net.inSec,
        outSec: net.outSec,
        inTotal: net.inTotal,
        outTotal: net.outTotal,
        inKbSec: parseFloat((net.inSec / 1024).toFixed(1)),
        outKbSec: parseFloat((net.outSec / 1024).toFixed(1)),
      },
      system: {
        platform: process.platform,
        uptime: Math.floor(os.uptime()),
        nodeUptime: Math.floor(process.uptime()),
        loadAvg: os.loadavg().map((v) => parseFloat(v.toFixed(2))),
        hostname: os.hostname(),
      },
      docker: {
        version: docker.dockerVersion,
        containers: docker.containerCount,
        available: docker.dockerVersion !== "Unavailable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Metrics collection failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
