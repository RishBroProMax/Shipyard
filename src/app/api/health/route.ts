import { NextResponse } from "next/server";
import { isInitialized } from "@/lib/init/supervisor";
import { db } from "@/lib/db";
import os from "os";

export async function GET() {
  try {
    const initialized = isInitialized();
    const servers = await db.servers.list();
    const activeServers = servers.filter((s) => s.status === "ONLINE");

    const health = {
      status: "HEALTHY",
      initialized,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      cluster: {
        totalNodes: servers.length,
        onlineNodes: activeServers.length,
      },
      host: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCores: os.cpus().length,
        memoryTotal: os.totalmem(),
        memoryFree: os.freemem(),
      },
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { status: "UNHEALTHY", error: (error as Error).message },
      { status: 500 }
    );
  }
}
