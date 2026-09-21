import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSecureToken } from "@/lib/security/crypto";
import { getCurrentUser } from "@/lib/security/auth";
import { updateLocalNodeMetrics } from "@/lib/system/telemetry";

export async function GET() {
  try {
    // Refresh local host node telemetry
    await updateLocalNodeMetrics();

    const servers = await db.servers.list();
    const now = Date.now();

    // Mark nodes offline if no heartbeat for > 20 seconds
    const enriched = servers.map((s) => {
      const lastHeartbeat = new Date(s.lastHeartbeatAt).getTime();
      const isOnline = now - lastHeartbeat < 20000;
      return {
        ...s,
        status: isOnline ? "ONLINE" : "OFFLINE",
      };
    });

    return NextResponse.json({ servers: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list servers", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = body.name || `Worker Node ${Date.now().toString().slice(-4)}`;
    const token = `agt_${generateSecureToken(24)}`;

    const server = await db.servers.create({
      name,
      host: "pending-connection",
      token,
      status: "PROVISIONING",
      isLocalHost: false,
      agentVersion: "1.0.0",
      cpuCores: 0,
      cpuUsage: 0,
      memoryTotal: 0,
      memoryUsed: 0,
      memoryUsage: 0,
      diskTotal: 0,
      diskUsed: 0,
      diskUsage: 0,
      networkInSec: 0,
      networkOutSec: 0,
      networkInTotal: 0,
      networkOutTotal: 0,
      dockerVersion: "Pending",
      containerCount: 0,
      uptimeSeconds: 0,
      lastHeartbeatAt: new Date().toISOString(),
    });

    await db.activityLogs.create({
      userId: user.id,
      action: "NODE_TOKEN_GENERATED",
      entityType: "SERVER",
      entityId: server.id,
      details: { name: server.name, token: `${token.substring(0, 8)}...` },
    });

    return NextResponse.json({ success: true, server, token });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create server registration token", message: (error as Error).message },
      { status: 500 }
    );
  }
}
