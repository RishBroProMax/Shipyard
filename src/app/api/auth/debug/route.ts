import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/security/auth-constants";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

// Diagnostic endpoint for debugging auth issues on VPS.
// Only accessible in non-production OR with a ?secret= query param.
// REMOVE or restrict this in hardened production environments.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  // Restrict in production unless secret matches
  const debugSecret = process.env.SHIPYARD_DEBUG_SECRET;
  if (process.env.NODE_ENV === "production" && debugSecret && secret !== debugSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Check data directory state
  const DATA_DIR = process.env.SHIPYARD_DATA_DIR || path.join(process.cwd(), "data");
  const DB_FILE = path.join(DATA_DIR, "shipyard-store.json");
  const SECRETS_FILE = path.join(DATA_DIR, "secrets", "shipyard.secret.json");
  const INIT_FLAG = path.join(DATA_DIR, ".initialized");

  let storeStats = { users: 0, sessions: 0 };
  let storeReadable = false;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      const store = JSON.parse(raw);
      storeStats = { users: store.users?.length ?? 0, sessions: store.sessions?.length ?? 0 };
      storeReadable = true;
    }
  } catch (e) {}

  let sessionValid = false;
  let sessionUser = null;
  if (sessionToken) {
    try {
      const session = await db.sessions.findByToken(sessionToken);
      if (session) {
        sessionValid = true;
        sessionUser = session.user?.email;
      }
    } catch (e) {}
  }

  // Proto detection
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "unknown";

  return NextResponse.json({
    auth: {
      cookiePresent: !!sessionToken,
      cookieLength: sessionToken?.length ?? 0,
      sessionValid,
      sessionUser,
    },
    config: {
      dataDir: DATA_DIR,
      dbFileExists: fs.existsSync(DB_FILE),
      dbFileReadable: storeReadable,
      secretsFileExists: fs.existsSync(SECRETS_FILE),
      initFlagExists: fs.existsSync(INIT_FLAG),
      storeStats,
    },
    request: {
      proto,
      host,
      nodeEnv: process.env.NODE_ENV,
      cookieName: SESSION_COOKIE_NAME,
    },
    fix_hints: [
      !storeReadable && "DB file not readable — check SHIPYARD_DATA_DIR volume mount permissions",
      storeStats.users === 0 && "No users in database — init-appliance.js may have failed",
      sessionToken && !sessionValid && "Cookie present but session invalid — may be expired or from wrong data dir",
      proto === "http" && "Running over plain HTTP — Secure=false cookies are correct, browser should accept them",
    ].filter(Boolean),
  });
}
