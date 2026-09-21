import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { loadSecrets } from "@/lib/init/supervisor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, host, token, cpuCores, memoryTotal, diskTotal, dockerVersion } = body;

    if (!token) {
      return NextResponse.json({ error: "Agent token is required" }, { status: 401 });
    }

    const secrets = loadSecrets();
    const isMasterToken = secrets && secrets.agentToken === token;

    // Check if server with this token or host exists
    const existingServers = await db.servers.list();
    let server = existingServers.find((s) => s.token === token);

    if (!server && !isMasterToken) {
      // Check if token matches any existing server token
      return NextResponse.json({ error: "Invalid registration token" }, { status: 403 });
    }

    if (!server) {
      // Create new worker node
      server = await db.servers.create({
        name: name || `Worker Node (${host || "Remote"})`,
        host: host || "remote-node",
        token,
        status: "ONLINE",
        isLocalHost: false,
        agentVersion: "1.0.0",
        cpuCores: cpuCores || 0,
        cpuUsage: 0,
        memoryTotal: memoryTotal || 0,
        memoryUsed: 0,
        memoryUsage: 0,
        diskTotal: diskTotal || 0,
        diskUsed: 0,
        diskUsage: 0,
        networkInSec: 0,
        networkOutSec: 0,
        networkInTotal: 0,
        networkOutTotal: 0,
        dockerVersion: dockerVersion || "Docker",
        containerCount: 0,
        uptimeSeconds: 0,
        lastHeartbeatAt: new Date().toISOString(),
      });

      await db.activityLogs.create({
        action: "NODE_CONNECTED",
        entityType: "SERVER",
        entityId: server.id,
        details: {
          name: server.name,
          host: server.host,
          cpuCores: server.cpuCores,
          memoryGb: ((server.memoryTotal || 0) / (1024 * 1024 * 1024)).toFixed(1),
        },
      });

      console.log(`[Shipyard Cluster] New worker node joined: ${server.name} (${server.id})`);
    } else {
      // Update existing server status
      await db.servers.update(server.id, {
        status: "ONLINE",
        dockerVersion: dockerVersion || server.dockerVersion,
        lastHeartbeatAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      server,
      message: "Node successfully registered with Shipyard Leader",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Node registration failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
