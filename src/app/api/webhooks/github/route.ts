import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyGitHubSignature } from "@/lib/security/crypto";
import { loadSecrets } from "@/lib/init/supervisor";
import { executeDeployment } from "@/lib/agent/executor";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const event = req.headers.get("x-github-event");

    if (event === "ping") {
      return NextResponse.json({ message: "Shipyard webhook ping received successfully" });
    }

    if (event !== "push") {
      return NextResponse.json({ message: `Ignored event: ${event}` });
    }

    const payload = JSON.parse(rawBody);
    const repoUrl = payload.repository?.clone_url || payload.repository?.html_url;
    const ref = payload.ref; // e.g. refs/heads/main
    const branch = ref ? ref.replace("refs/heads/", "") : "main";

    const commitHash = payload.after || payload.head_commit?.id || "HEAD";
    const commitMessage = payload.head_commit?.message || "Webhook push event";
    const commitAuthor = payload.head_commit?.author?.name || payload.pusher?.name || "GitHub";

    // Optional webhook signature verification if secret is configured
    const secrets = loadSecrets();
    const webhookSecret = process.env.SHIPYARD_WEBHOOK_SECRET || secrets?.encryptionKey;
    if (signature && webhookSecret) {
      const isValid = verifyGitHubSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    // Match projects
    const allProjects = await db.projects.list();
    const matched = allProjects.filter((p) => {
      const urlMatches =
        p.repoUrl.toLowerCase().includes(payload.repository?.name?.toLowerCase() || "") ||
        p.repoUrl.toLowerCase() === repoUrl?.toLowerCase();
      const branchMatches = p.branch === branch;
      return urlMatches && branchMatches && p.autoDeploy;
    });

    if (matched.length === 0) {
      return NextResponse.json({
        message: "No matching auto-deploy projects found for repository and branch",
        repo: repoUrl,
        branch,
      });
    }

    const triggeredDeployments = [];

    for (const project of matched) {
      const deployment = await db.deployments.create({
        projectId: project.id,
        serverId: project.serverId,
        status: "QUEUED",
        trigger: "WEBHOOK",
        branch,
        commitHash,
        commitMessage,
        commitAuthor,
      });

      await db.activityLogs.create({
        action: "WEBHOOK_DEPLOY_TRIGGERED",
        entityType: "DEPLOYMENT",
        entityId: deployment.id,
        details: {
          projectId: project.id,
          projectName: project.name,
          commitHash,
          branch,
        },
      });

      // Execute asynchronously in background
      executeDeployment(deployment, project).catch((err) => {
        console.error(`[Shipyard Webhook] Deployment execution error:`, err);
      });

      triggeredDeployments.push({
        projectId: project.id,
        deploymentId: deployment.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Triggered ${triggeredDeployments.length} deployments`,
      deployments: triggeredDeployments,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
