import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadSecrets, isInitialized } from "@/lib/init/supervisor";
import { syncProxyRoutes } from "@/lib/proxy/router";
import { updateLocalNodeMetrics } from "@/lib/system/telemetry";
import { docker } from "@/lib/agent/docker";
import os from "os";

export async function GET() {
  try {
    const initialized = isInitialized();
    const secrets = loadSecrets();
    
    // Refresh local host node's live hardware telemetry
    await updateLocalNodeMetrics();

    const [servers, projects, deployments, routes, hasDocker, dockerVersion] = await Promise.all([
      db.servers.list(),
      db.projects.list(),
      db.deployments.list(500),
      syncProxyRoutes(),
      docker.isAvailable(),
      docker.getVersion(),
    ]);

    // Aggregate cluster metrics
    let clusterCpuSum = 0;
    let clusterMemoryUsed = 0;
    let clusterMemoryTotal = 0;
    let clusterNetworkIn = 0;
    let clusterNetworkOut = 0;
    let onlineNodes = 0;

    for (const server of servers) {
      if (server.status === "ONLINE") {
        onlineNodes++;
        clusterCpuSum += server.cpuUsage;
        clusterMemoryUsed += server.memoryUsed;
        clusterMemoryTotal += server.memoryTotal;
        clusterNetworkIn += server.networkInSec || 0;
        clusterNetworkOut += server.networkOutSec || 0;
      }
    }

    const avgClusterCpu = onlineNodes > 0 ? parseFloat((clusterCpuSum / onlineNodes).toFixed(1)) : 0;
    const clusterMemoryUsagePercent =
      clusterMemoryTotal > 0
        ? parseFloat(((clusterMemoryUsed / clusterMemoryTotal) * 100).toFixed(1))
        : 0;

    const runningProjects = projects.filter((p) => p.status === "RUNNING").length;
    const successfulDeployments = deployments.filter((d) => d.status === "RUNNING").length;
    const failedDeployments = deployments.filter((d) => d.status === "FAILED").length;

    return NextResponse.json({
      initialized,
      adminEmail: secrets?.adminEmail || "admin@shipyard.local",
      initializedAt: secrets?.initializedAt || null,
      uptimeSeconds: Math.floor(process.uptime()),
      cluster: {
        totalNodes: servers.length,
        onlineNodes,
        avgCpuUsage: avgClusterCpu,
        memoryUsedBytes: clusterMemoryUsed,
        memoryTotalBytes: clusterMemoryTotal,
        memoryUsagePercent: clusterMemoryUsagePercent,
        networkInSec: clusterNetworkIn,
        networkOutSec: clusterNetworkOut,
      },
      workloads: {
        totalProjects: projects.length,
        runningProjects,
        totalDeployments: deployments.length,
        successfulDeployments,
        failedDeployments,
        successRate:
          deployments.length > 0
            ? Math.round((successfulDeployments / deployments.length) * 100)
            : 0,
      },
      proxy: {
        activeRoutes: routes.length,
        routes,
      },
      services: {
        database: { status: "UP", engine: "PostgreSQL 16 / Shipyard Engine" },
        redisQueue: { status: "UP", engine: "Redis 7 / Shipyard Worker Queue" },
        reverseProxy: { status: "UP", engine: "Dynamic Reverse Proxy / Caddy" },
        dockerEngine: {
          status: hasDocker ? "UP" : "STANDALONE",
          version: dockerVersion,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load system status", message: (error as Error).message },
      { status: 500 }
    );
  }
}
