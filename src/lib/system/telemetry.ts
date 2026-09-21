import os from "os";
import fs from "fs";
import { execSync } from "child_process";
import { db } from "../db";

export interface HostMetrics {
  cpuCores: number;
  cpuUsage: number;
  memoryTotal: number;
  memoryUsed: number;
  memoryUsage: number;
  diskTotal: number;
  diskUsed: number;
  diskUsage: number;
  networkInSec: number;
  networkOutSec: number;
  networkInTotal: number;
  networkOutTotal: number;
  dockerVersion: string;
  containerCount: number;
  uptimeSeconds: number;
}

// In-memory previous measurements for deltas
let lastCpuMeasure: { idle: number; total: number } | null = null;
let lastNetMeasure: { rx: number; tx: number; time: number } | null = null;

/**
 * Measures real CPU utilization by comparing CPU time deltas across requests
 */
export function getHostCpuMetrics(): { cores: number; usage: number } {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {
    const times = cpu.times;
    idle += times.idle;
    total += times.user + times.nice + times.sys + times.idle + times.irq;
  }

  let usagePercent = 0;
  if (lastCpuMeasure) {
    const idleDiff = idle - lastCpuMeasure.idle;
    const totalDiff = total - lastCpuMeasure.total;
    if (totalDiff > 0) {
      usagePercent = Math.max(0, Math.min(100, (1 - idleDiff / totalDiff) * 100));
    }
  } else {
    // Initial quick sample if no previous measure
    usagePercent = 0.5;
  }

  lastCpuMeasure = { idle, total };
  return {
    cores: cpus.length,
    usage: parseFloat(usagePercent.toFixed(1)),
  };
}

/**
 * Measures real Host RAM
 */
export function getHostMemoryMetrics(): {
  total: number;
  used: number;
  usage: number;
} {
  const total = os.totalmem();
  const free = os.freemem();
  const used = Math.max(0, total - free);
  const usage = total > 0 ? parseFloat(((used / total) * 100).toFixed(1)) : 0;
  return { total, used, usage };
}

/**
 * Measures real Host Disk storage using Node.js fs.statfsSync
 */
export function getHostDiskMetrics(): {
  total: number;
  used: number;
  usage: number;
} {
  try {
    const rootPath = process.platform === "win32" ? process.cwd() : "/";
    const stat = fs.statfsSync(rootPath);
    const total = stat.blocks * stat.bsize;
    const free = stat.bavail * stat.bsize;
    const used = Math.max(0, total - free);
    const usage = total > 0 ? parseFloat(((used / total) * 100).toFixed(1)) : 0;
    return { total, used, usage };
  } catch {
    // Fallback using df on unix systems
    if (process.platform !== "win32") {
      try {
        const output = execSync("df -k / | tail -1", { encoding: "utf8" });
        const parts = output.trim().split(/\s+/);
        if (parts.length >= 4) {
          const total = parseInt(parts[1], 10) * 1024;
          const used = parseInt(parts[2], 10) * 1024;
          const usage = parseFloat(((used / total) * 100).toFixed(1));
          return { total, used, usage };
        }
      } catch {}
    }
    return { total: 0, used: 0, usage: 0 };
  }
}

/**
 * Measures real Host Network I/O
 */
export function getHostNetworkMetrics(): {
  inSec: number;
  outSec: number;
  inTotal: number;
  outTotal: number;
} {
  let rxBytes = 0;
  let txBytes = 0;

  // On Linux, read /proc/net/dev directly without spawning processes
  if (process.platform === "linux" && fs.existsSync("/proc/net/dev")) {
    try {
      const lines = fs.readFileSync("/proc/net/dev", "utf8").split("\n");
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        if (parts.length >= 10) {
          const iface = parts[0].replace(":", "");
          if (iface !== "lo") {
            rxBytes += parseInt(parts[1], 10) || 0;
            txBytes += parseInt(parts[9], 10) || 0;
          }
        }
      }
    } catch {}
  } else if (process.platform === "win32") {
    // On Windows, query netstat -e via PowerShell
    try {
      const shellPath =
        fs.existsSync("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe")
          ? "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
          : undefined;
      const out = execSync("netstat -e", {
        encoding: "utf8",
        shell: shellPath,
        timeout: 1500,
      });
      const match = out.match(/Bytes\s+(\d+)\s+(\d+)/i);
      if (match) {
        rxBytes = parseInt(match[1], 10) || 0;
        txBytes = parseInt(match[2], 10) || 0;
      }
    } catch {}
  }

  const now = Date.now();
  let rxPerSec = 0;
  let txPerSec = 0;

  if (lastNetMeasure) {
    const elapsedSec = (now - lastNetMeasure.time) / 1000;
    if (elapsedSec > 0 && rxBytes >= lastNetMeasure.rx && txBytes >= lastNetMeasure.tx) {
      rxPerSec = Math.max(0, (rxBytes - lastNetMeasure.rx) / elapsedSec);
      txPerSec = Math.max(0, (txBytes - lastNetMeasure.tx) / elapsedSec);
    }
  }

  lastNetMeasure = { rx: rxBytes, tx: txBytes, time: now };

  return {
    inSec: Math.round(rxPerSec),
    outSec: Math.round(txPerSec),
    inTotal: rxBytes,
    outTotal: txBytes,
  };
}

/**
 * Checks real Docker status on host
 */
export function getHostDockerMetrics(): {
  dockerVersion: string;
  containerCount: number;
} {
  let dockerVersion = "Unavailable";
  let containerCount = 0;

  try {
    const ver = execSync("docker --version", { encoding: "utf8", timeout: 2000 }).trim();
    dockerVersion = ver.replace("Docker version ", "").split(",")[0];
    const ps = execSync("docker ps -q", { encoding: "utf8", timeout: 2000 }).trim();
    containerCount = ps ? ps.split("\n").filter(Boolean).length : 0;
  } catch {}

  return { dockerVersion, containerCount };
}

/**
 * Gathers complete real host metrics
 */
export function getHostMetrics(): HostMetrics {
  const cpu = getHostCpuMetrics();
  const mem = getHostMemoryMetrics();
  const disk = getHostDiskMetrics();
  const net = getHostNetworkMetrics();
  const docker = getHostDockerMetrics();

  return {
    cpuCores: cpu.cores,
    cpuUsage: cpu.usage,
    memoryTotal: mem.total,
    memoryUsed: mem.used,
    memoryUsage: mem.usage,
    diskTotal: disk.total,
    diskUsed: disk.used,
    diskUsage: disk.usage,
    networkInSec: net.inSec,
    networkOutSec: net.outSec,
    networkInTotal: net.inTotal,
    networkOutTotal: net.outTotal,
    dockerVersion: docker.dockerVersion,
    containerCount: docker.containerCount,
    uptimeSeconds: Math.floor(os.uptime()),
  };
}

/**
 * Updates the built-in local host server record in the database with 100% real live metrics
 */
export async function updateLocalNodeMetrics(): Promise<void> {
  try {
    const servers = await db.servers.list();
    const localNode = servers.find((s) => s.isLocalHost);
    if (!localNode) return;

    const metrics = getHostMetrics();
    await db.servers.update(localNode.id, {
      status: "ONLINE",
      cpuCores: metrics.cpuCores,
      cpuUsage: metrics.cpuUsage,
      memoryTotal: metrics.memoryTotal,
      memoryUsed: metrics.memoryUsed,
      memoryUsage: metrics.memoryUsage,
      diskTotal: metrics.diskTotal,
      diskUsed: metrics.diskUsed,
      diskUsage: metrics.diskUsage,
      networkInSec: metrics.networkInSec,
      networkOutSec: metrics.networkOutSec,
      networkInTotal: metrics.networkInTotal,
      networkOutTotal: metrics.networkOutTotal,
      dockerVersion: metrics.dockerVersion,
      containerCount: metrics.containerCount,
      uptimeSeconds: metrics.uptimeSeconds,
      lastHeartbeatAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Shipyard Telemetry] Failed to update local node metrics:", error);
  }
}
