import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import { encryptSecret, decryptSecret } from "@/lib/security/crypto";
import { loadSecrets } from "@/lib/init/supervisor";
import { executeDeployment } from "@/lib/agent/executor";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const projects = await db.projects.list();
    const servers = await db.servers.list();
    const serverMap = new Map(servers.map((s) => [s.id, s.name]));

    const enriched = projects.map((p) => ({
      ...p,
      serverName: p.serverId ? serverMap.get(p.serverId) || "Unknown Node" : "Local Node",
      // Do not return raw encrypted string
      envVars: undefined,
    }));

    return NextResponse.json({ projects: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list projects", message: (error as Error).message },
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

    const body = await req.json();
    let {
      name,
      repoUrl,
      template,
      branch = "main",
      appType = "AUTO",
      rootDir = "/",
      targetPort = 3000,
      serverId,
      autoDeploy = true,
      envVars = {},
    } = body;

    if (template && !repoUrl) {
      repoUrl = `template://${template}`;
      const { STARTER_TEMPLATES } = await import("@/lib/templates");
      const tmpl = STARTER_TEMPLATES[template];
      if (tmpl) {
        if (appType === "AUTO") appType = tmpl.appType;
        if (!body.targetPort) targetPort = tmpl.targetPort;
      }
    }

    if (!name || !repoUrl) {
      return NextResponse.json(
        { error: "Project name and Git repository URL (or starter template) are required" },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    const existing = await db.projects.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Encrypt environment variables with AES-256-GCM
    const secrets = loadSecrets();
    const encryptionKey = process.env.SHIPYARD_ENCRYPTION_KEY || secrets?.encryptionKey || "default-key-32-chars-long-hex-str";
    const encryptedEnv = Object.keys(envVars).length > 0
      ? encryptSecret(JSON.stringify(envVars), encryptionKey)
      : null;

    // Default to first online server if not specified
    let targetServerId = serverId;
    if (!targetServerId) {
      const servers = await db.servers.list();
      const onlineServer = servers.find((s) => s.status === "ONLINE") || servers[0];
      targetServerId = onlineServer?.id || null;
    }

    const project = await db.projects.create({
      name,
      slug,
      repoUrl,
      branch,
      appType,
      rootDir,
      targetPort: Number(targetPort) || 3000,
      status: "IDLE",
      autoDeploy,
      envVars: encryptedEnv,
      serverId: targetServerId,
    });

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project.id,
      details: { name: project.name, slug: project.slug, repoUrl: project.repoUrl },
    });

    // If auto-deploy is enabled, trigger the initial deployment
    let initialDeployment = null;
    if (autoDeploy) {
      initialDeployment = await db.deployments.create({
        projectId: project.id,
        serverId: targetServerId,
        status: "QUEUED",
        trigger: "AUTO",
        branch,
        commitHash: "HEAD",
        commitMessage: "Initial deployment from repository",
        commitAuthor: user.name || user.email,
      });

      // Execute asynchronously in background
      executeDeployment(initialDeployment, project).catch((err) => {
        console.error(`[Shipyard Auto-Deploy] Error:`, err);
      });
    }

    return NextResponse.json({
      success: true,
      project,
      deployment: initialDeployment,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create project", message: (error as Error).message },
      { status: 500 }
    );
  }
}
