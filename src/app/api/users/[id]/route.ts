import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";

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

    const userToDelete = await db.users.findById(params.id);
    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.users.delete(params.id);

    await db.activityLogs.create({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "USER_DELETED",
      entityType: "AUTH",
      entityId: params.id,
      details: { email: userToDelete.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user", message: (error as Error).message },
      { status: 500 }
    );
  }
}
