import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import { syncProxyRoutes } from "@/lib/proxy/router";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; domainId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domain = (await db.domains.listByProjectId(params.id)).find((d) => d.id === params.domainId);
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    await db.domains.delete(params.domainId);
    await syncProxyRoutes();

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "DOMAIN_REMOVED",
      entityType: "PROJECT",
      entityId: params.id,
      details: { domain: domain.domain, domainId: params.domainId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete domain", message: (error as Error).message },
      { status: 500 }
    );
  }
}
