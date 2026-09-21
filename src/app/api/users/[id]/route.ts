import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can delete users" }, { status: 403 });
    }

    if (currentUser.id === params.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    const dataFile = path.join(process.cwd(), "data", "shipyard-store.json");
    if (fs.existsSync(dataFile)) {
      const state = JSON.parse(fs.readFileSync(dataFile, "utf8"));
      const userToDelete = state.users.find((u: any) => u.id === params.id);
      if (!userToDelete) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      state.users = state.users.filter((u: any) => u.id !== params.id);
      state.sessions = state.sessions.filter((s: any) => s.userId !== params.id);
      fs.writeFileSync(dataFile, JSON.stringify(state, null, 2), "utf8");

      await db.activityLogs.create({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: "USER_DELETED",
        entityType: "AUTH",
        entityId: params.id,
        details: { email: userToDelete.email },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user", message: (error as Error).message },
      { status: 500 }
    );
  }
}
