import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/security/auth-constants";

export function middleware(request: NextRequest) {
  const isPublicMode =
    process.env.VERCEL === "1" ||
    process.env.SHIPYARD_MODE === "public" ||
    process.env.NEXT_PUBLIC_SHIPYARD_MODE === "public";

  // Public mode allows public showcase and documentation
  if (isPublicMode) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Paths exempt from session check
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/install.sh") ||
    pathname.startsWith("/agent_install") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // static assets
  ) {
    return NextResponse.next();
  }

  // Verify session cookie presence
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
