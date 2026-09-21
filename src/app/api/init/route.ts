import { NextResponse } from "next/server";
import { initializeSupervisor, isInitialized, loadSecrets } from "@/lib/init/supervisor";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const initialized = isInitialized();
    const secrets = loadSecrets();
    const servers = await db.servers.list();
    const userCount = await db.users.count();

    return NextResponse.json({
      initialized,
      adminEmail: secrets?.adminEmail || null,
      serverCount: servers.length,
      userCount,
      initializedAt: secrets?.initializedAt || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check initialization status", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await initializeSupervisor();
    return NextResponse.json({
      success: true,
      isFirstBoot: result.isFirstBoot,
      adminEmail: result.secrets.adminEmail,
      initializedAt: result.secrets.initializedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Appliance initialization failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
