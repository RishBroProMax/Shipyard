import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/security/auth";
import { initializeSupervisor, isInitialized } from "@/lib/init/supervisor";

export async function POST(req: NextRequest) {
  try {
    // Ensure appliance is initialized on first request
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
      // Use a timing-safe delay to prevent email enumeration
      await new Promise((r) => setTimeout(r, 200));
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;
    const sessionToken = await createSession(user.id, ip, userAgent);

    // Record login in activity log (non-fatal)
    db.activityLogs.create({
      userId: user.id,
      action: "USER_LOGIN",
      entityType: "AUTH",
      entityId: user.id,
      details: { email: user.email },
      ipAddress: ip,
    }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // ── Cookie Security: detect real protocol ────────────────────────────────
    // On a fresh VPS accessed over plain HTTP (before SSL is provisioned),
    // setting secure:true causes browsers to SILENTLY DROP the cookie —
    // the user appears to be logged in but is immediately redirected back to /login.
    // We detect the actual protocol from forwarded headers set by Caddy/Nginx.
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const isHttps = proto === "https" || process.env.FORCE_HTTPS === "true";

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      // Only mark Secure when the connection is actually HTTPS.
      // On plain HTTP (initial VPS setup before SSL), leave Secure=false so
      // the browser accepts the cookie.
      secure: isHttps,
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60, // 14 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Auth Login] Error:", error);
    return NextResponse.json(
      { error: "Authentication failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
