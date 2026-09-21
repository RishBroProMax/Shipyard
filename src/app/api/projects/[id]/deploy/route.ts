import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import { executeDeployment } from "@/lib/agent/executor";

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

    const body = await req.json().catch(() => ({}));
    const trigger = body.trigger || "MANUAL";
    const rollbackId = body.rollbackDeploymentId;

    let commitHash = "HEAD";
    let commitMessage = "Manual deployment triggered from dashboard";
    let commitAuthor = user.name || user.email;

    if (rollbackId) {
      const targetDeployment = await db.deployments.findById(rollbackId);
      if (targetDeployment) {
        commitHash = targetDeployment.commitHash || "ROLLBACK";
        commitMessage = `Rollback to deployment ${targetDeployment.id.substring(0, 8)} (${targetDeployment.commitMessage || "earlier commit"})`;
        commitAuthor = targetDeployment.commitAuthor || user.email;
      }
    }

    const deployment = await db.deployments.create({
      projectId: project.id,
      serverId: project.serverId,
      status: "QUEUED",
      trigger: rollbackId ? "ROLLBACK" : trigger,
      branch: project.branch,
      commitHash,
      commitMessage,
      commitAuthor,
    });

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: rollbackId ? "DEPLOYMENT_ROLLBACK" : "DEPLOYMENT_TRIGGERED",
      entityType: "DEPLOYMENT",
      entityId: deployment.id,
      details: {
        projectId: project.id,
        projectName: project.name,
        trigger,
        rollbackId,
      },
    });

    // Run execution asynchronously in background
    executeDeployment(deployment, project).catch((err) => {
      console.error("[Shipyard Deployment Engine] Execution error:", err);
    });

    return NextResponse.json({
      success: true,
      deploymentId: deployment.id,
      status: "QUEUED",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to trigger deployment", message: (error as Error).message },
      { status: 500 }
    );
  }
}
