import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { initializeSupervisor, isInitialized } from "@/lib/init/supervisor";

export async function POST(req: NextRequest) {
  try {
    // Ensure appliance is initialized if not already
    if (!isInitialized()) {
      await initializeSupervisor();
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.users.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;
    const sessionToken = await createSession(user.id, ip, userAgent);

    // Record login in activity log
    await db.activityLogs.create({
      userId: user.id,
      action: "USER_LOGIN",
      entityType: "AUTH",
      entityId: user.id,
      details: { email: user.email },
      ipAddress: ip,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60, // 14 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
