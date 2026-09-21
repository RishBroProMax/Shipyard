import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const proto =
    req.headers.get("x-forwarded-proto") ||
    req.nextUrl.protocol.replace(":", "") ||
    "http";
  const serverUrl = `${proto}://${host}`;

  // Read the canonical install.sh from the project root.
  // On Vercel, this comes from the deployed static files.
  // On VPS/Docker, it comes from the filesystem.
  let scriptContent: string;
  const scriptPath = path.join(process.cwd(), "install.sh");

  try {
    scriptContent = fs.readFileSync(scriptPath, "utf8");
    // Replace the placeholder repo URL so users can self-host the installer
    scriptContent = scriptContent.replace(
      /SHIPYARD_REPO="\${SHIPYARD_REPO:-[^}]+}"/,
      `SHIPYARD_REPO="\${SHIPYARD_REPO:-${serverUrl}}"` 
    );
  } catch {
    // Fallback: serve a minimal bootstrap script that downloads from GitHub
    scriptContent = `#!/usr/bin/env bash
# Shipyard PaaS — Installer Bootstrap
# Fetches the full installer from the Shipyard GitHub repository.
set -euo pipefail

echo "Downloading Shipyard installer from ${serverUrl}..."
TMPFILE="$(mktemp /tmp/shipyard-install-XXXXXX.sh)"
curl -fsSL "https://raw.githubusercontent.com/RishBroProMax/Shipyard/main/install.sh" -o "$TMPFILE"
chmod +x "$TMPFILE"
bash "$TMPFILE" "$@"
rm -f "$TMPFILE"
`;
  }

  return new NextResponse(scriptContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Disposition": "inline; filename=install.sh",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
