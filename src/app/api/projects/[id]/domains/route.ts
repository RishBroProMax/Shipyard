import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import { syncProxyRoutes } from "@/lib/proxy/router";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const domains = await db.domains.listByProjectId(params.id);
    return NextResponse.json({ domains });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list domains", message: (error as Error).message },
      { status: 500 }
    );
  }
}

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
    const { domain, isPrimary = false } = body;

    if (!domain || !domain.trim()) {
      return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
    }

    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");

    // Check if domain already registered
    const existingDomains = await db.domains.listByProjectId(params.id);
    if (existingDomains.some((d) => d.domain === cleanDomain)) {
      return NextResponse.json({ error: "Domain is already added to this project" }, { status: 400 });
    }

    const newDomain = await db.domains.create({
      projectId: project.id,
      domain: cleanDomain,
      sslStatus: "ACTIVE",
      isPrimary: Boolean(isPrimary),
    });

    // Update reverse proxy routes
    await syncProxyRoutes();

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "DOMAIN_ADDED",
      entityType: "PROJECT",
      entityId: project.id,
      details: { domain: cleanDomain, projectId: project.id, projectName: project.name },
    });

    return NextResponse.json({ success: true, domain: newDomain });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add domain", message: (error as Error).message },
      { status: 500 }
    );
  }
}
