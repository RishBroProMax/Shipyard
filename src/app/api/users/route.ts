import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/security/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db.users.list();
    const sanitized = allUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: sanitized });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list users", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Only administrators can create new users" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, role = "OPERATOR" } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await db.users.findByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await db.users.create({
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role || "OPERATOR",
      name: name?.trim() || null,
    });

    await db.activityLogs.create({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: "USER_CREATED",
      entityType: "AUTH",
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role, name: newUser.name },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user", message: (error as Error).message },
      { status: 500 }
    );
  }
}
