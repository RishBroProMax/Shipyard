import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLogs } from "@/lib/agent/executor";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deployment = await db.deployments.findById(params.id);
    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    }

    const project = await db.projects.findById(deployment.projectId);
    const server = deployment.serverId ? await db.servers.findById(deployment.serverId) : null;
    const currentLogs = getLogs(deployment.id) || deployment.buildLogs || "";

    return NextResponse.json({
      deployment: {
        ...deployment,
        projectName: project?.name || "Unknown Project",
        projectSlug: project?.slug || "",
        serverName: server?.name || "Local Node",
        buildLogs: currentLogs,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get deployment", message: (error as Error).message },
      { status: 500 }
    );
  }
}
