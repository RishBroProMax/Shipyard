import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { db, StoredUser } from "@/lib/db";

const SESSION_COOKIE_NAME = "shipyard_session";
const SESSION_DURATION_DAYS = 14;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.sessions.create({
    userId,
    token,
    expiresAt: expiresAt.toISOString(),
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });

  return token;
}

export async function validateSession(token: string): Promise<StoredUser | null> {
  if (!token) return null;
  const session = await db.sessions.findByToken(token);
  return session?.user || null;
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return validateSession(token);
  } catch {
    return null;
  }
}

export async function destroySession(token: string): Promise<void> {
  await db.sessions.delete(token);
}

export { SESSION_COOKIE_NAME };
