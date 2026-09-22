import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./lib/security/auth-constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Immediate redirect for deprecated public landing and docs routes
  if (
    pathname === "/landing" ||
    pathname.startsWith("/landing/") ||
    pathname === "/docs" ||
    pathname.startsWith("/docs/")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Paths exempt from session check
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
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
