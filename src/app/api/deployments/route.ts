import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const deployments = await db.deployments.list(100);
    const projects = await db.projects.list();
    const servers = await db.servers.list();

    const projectMap = new Map(projects.map((p) => [p.id, p.name]));
    const serverMap = new Map(servers.map((s) => [s.id, s.name]));

    const enriched = deployments.map((d) => ({
      ...d,
      projectName: projectMap.get(d.projectId) || "Unknown Project",
      serverName: d.serverId ? serverMap.get(d.serverId) || "Unknown Node" : "Local Node",
      // Exclude heavy log strings from list view for performance
      buildLogs: undefined,
    }));

    return NextResponse.json({ deployments: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list deployments", message: (error as Error).message },
      { status: 500 }
    );
  }
}
