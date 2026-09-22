import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import { docker } from "@/lib/agent/docker";

// GET: Fetch live container metrics & usage
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.projects.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const containerName = `shipyard-${project.slug}`;
    const stats = await docker.getStats(containerName);
    const hasDocker = await docker.isAvailable();

    return NextResponse.json({
      containerName,
      hasDocker,
      stats: stats || {
        containerId: containerName,
        name: containerName,
        cpuPercent: 0,
        memoryUsageBytes: 0,
        memoryLimitBytes: 0,
        memoryPercent: 0,
        networkInBytes: 0,
        networkOutBytes: 0,
        pids: 0,
      },
      status: project.status,
      port: project.allocatedPort,
      liveUrl: project.liveUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch container metrics", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Container actions (start | stop | restart)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await db.projects.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action } = body;
    const containerName = `shipyard-${project.slug}`;

    let success = false;
    let newStatus = project.status;

    switch (action) {
      case "stop":
        success = await docker.stop(containerName);
        if (success) newStatus = "STOPPED" as any;
        break;
      case "start":
        success = await docker.start(containerName);
        if (success) newStatus = "RUNNING";
        break;
      case "restart":
        success = await docker.restart(containerName);
        if (success) newStatus = "RUNNING";
        break;
      default:
        return NextResponse.json({ error: "Invalid action. Supported: start, stop, restart" }, { status: 400 });
    }

    if (success) {
      await db.projects.update(project.id, { status: newStatus });
      await db.activityLogs.create({
        userId: user.id,
        userEmail: user.email,
        action: `CONTAINER_${action.toUpperCase()}`,
        entityType: "PROJECT",
        entityId: project.id,
        details: { containerName, action },
      });
    }

    return NextResponse.json({ success, status: newStatus, containerName });
  } catch (error) {
    return NextResponse.json(
      { error: "Container operation failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
