import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serverId = params.id;
    const token = req.headers.get("x-shipyard-agent-token");

    const server = await db.servers.findById(serverId);
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    if (token && server.token !== token) {
      return NextResponse.json({ error: "Unauthorized token" }, { status: 403 });
    }

    const body = await req.json();
    const {
      cpuUsage,
      cpuCores,
      memoryTotal,
      memoryUsed,
      memoryUsage,
      diskTotal,
      diskUsed,
      diskUsage,
      networkInSec,
      networkOutSec,
      networkInTotal,
      networkOutTotal,
      dockerVersion,
      containerCount,
      uptimeSeconds,
    } = body;

    const updated = await db.servers.update(serverId, {
      status: "ONLINE",
      cpuUsage: typeof cpuUsage === "number" ? cpuUsage : server.cpuUsage,
      cpuCores: typeof cpuCores === "number" ? cpuCores : server.cpuCores,
      memoryTotal: typeof memoryTotal === "number" ? memoryTotal : server.memoryTotal,
      memoryUsed: typeof memoryUsed === "number" ? memoryUsed : server.memoryUsed,
      memoryUsage: typeof memoryUsage === "number" ? memoryUsage : server.memoryUsage,
      diskTotal: typeof diskTotal === "number" ? diskTotal : server.diskTotal,
      diskUsed: typeof diskUsed === "number" ? diskUsed : server.diskUsed,
      diskUsage: typeof diskUsage === "number" ? diskUsage : server.diskUsage,
      networkInSec: typeof networkInSec === "number" ? networkInSec : server.networkInSec,
      networkOutSec: typeof networkOutSec === "number" ? networkOutSec : server.networkOutSec,
      networkInTotal: typeof networkInTotal === "number" ? networkInTotal : server.networkInTotal,
      networkOutTotal: typeof networkOutTotal === "number" ? networkOutTotal : server.networkOutTotal,
      dockerVersion: dockerVersion || server.dockerVersion,
      containerCount: typeof containerCount === "number" ? containerCount : server.containerCount,
      uptimeSeconds: typeof uptimeSeconds === "number" ? uptimeSeconds : server.uptimeSeconds,
      lastHeartbeatAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, server: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record heartbeat", message: (error as Error).message },
      { status: 500 }
    );
  }
}
