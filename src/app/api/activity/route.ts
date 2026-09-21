import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const logs = await db.activityLogs.list(100);
    return NextResponse.json({ activity: logs });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch activity logs", message: (error as Error).message },
      { status: 500 }
    );
  }
}
