import { NextResponse } from "next/server";
import { STARTER_TEMPLATES } from "@/lib/templates";

export async function GET() {
  const templates = Object.values(STARTER_TEMPLATES).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    appType: t.appType,
    targetPort: t.targetPort,
    icon: t.icon,
    tags: t.tags,
  }));

  return NextResponse.json({ templates });
}
