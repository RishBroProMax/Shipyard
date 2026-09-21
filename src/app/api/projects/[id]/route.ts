import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import { encryptSecret, decryptSecret } from "@/lib/security/crypto";
import { loadSecrets } from "@/lib/init/supervisor";
import { releasePort } from "@/lib/agent/port-allocator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.projects.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const secrets = loadSecrets();
    const encryptionKey = process.env.SHIPYARD_ENCRYPTION_KEY || secrets?.encryptionKey || "default-key-32-chars-long-hex-str";

    // Decrypt envVars
    let decryptedEnv: Record<string, string> = {};
    if (project.envVars) {
      try {
        const raw = typeof project.envVars === "string" ? project.envVars : JSON.stringify(project.envVars);
        const jsonStr = decryptSecret(raw, encryptionKey);
        decryptedEnv = JSON.parse(jsonStr);
      } catch {
        decryptedEnv = typeof project.envVars === "object" ? (project.envVars as Record<string, string>) : {};
      }
    }

    const server = project.serverId ? await db.servers.findById(project.serverId) : null;
    const deployments = await db.deployments.findByProjectId(project.id);
    const domains = await db.domains.listByProjectId(project.id);

    return NextResponse.json({
      project: {
        ...project,
        envVars: decryptedEnv,
        serverName: server?.name || "Local Node",
        deployments,
        domains,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get project", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const updates: Record<string, unknown> = {};

    if (body.name) updates.name = body.name;
    if (body.branch) updates.branch = body.branch;
    if (body.repoUrl) updates.repoUrl = body.repoUrl;
    if (body.appType) updates.appType = body.appType;
    if (body.rootDir !== undefined) updates.rootDir = body.rootDir;
    if (body.dockerfilePath !== undefined) updates.dockerfilePath = body.dockerfilePath;
    if (body.buildCommand !== undefined) updates.buildCommand = body.buildCommand;
    if (body.runCommand !== undefined) updates.runCommand = body.runCommand;
    if (body.targetPort) updates.targetPort = Number(body.targetPort);
    if (body.serverId) updates.serverId = body.serverId;
    if (body.autoDeploy !== undefined) updates.autoDeploy = Boolean(body.autoDeploy);

    if (body.envVars !== undefined) {
      const secrets = loadSecrets();
      const encryptionKey = process.env.SHIPYARD_ENCRYPTION_KEY || secrets?.encryptionKey || "default-key-32-chars-long-hex-str";
      updates.envVars = Object.keys(body.envVars).length > 0
        ? encryptSecret(JSON.stringify(body.envVars), encryptionKey)
        : null;
    }

    const updated = await db.projects.update(params.id, updates);

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: project.id,
      details: { name: project.name, updatedFields: Object.keys(updates) },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update project", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (project.allocatedPort) {
      releasePort(project.allocatedPort);
    }

    await db.projects.delete(params.id);

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "PROJECT_DELETED",
      entityType: "PROJECT",
      entityId: project.id,
      details: { name: project.name, slug: project.slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project", message: (error as Error).message },
      { status: 500 }
    );
  }
}
