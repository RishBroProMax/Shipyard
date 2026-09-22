import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Read the canonical install.sh from the project root.
  // The GitHub repo URL inside the script is already correct and must NOT
  // be replaced with the Vercel host — Vercel is not a git repository.
  const scriptPath = path.join(process.cwd(), "install.sh");

  let scriptContent: string;

  try {
    scriptContent = fs.readFileSync(scriptPath, "utf8");
  } catch {
    // Fallback: minimal bootstrap that fetches directly from GitHub
    // This executes when the file isn't on the filesystem (e.g. Vercel edge)
    scriptContent = `#!/usr/bin/env bash
# Shipyard PaaS — Installer Bootstrap
# Fetches the full installer directly from the Shipyard GitHub repository.
set -euo pipefail

TMPFILE="$(mktemp /tmp/shipyard-install-XXXXXX.sh)"
trap 'rm -f "$TMPFILE"' EXIT

echo "Downloading Shipyard installer from GitHub..."
curl -fsSL "https://raw.githubusercontent.com/RishBroProMax/Shipyard/master/install.sh" -o "$TMPFILE"
chmod +x "$TMPFILE"
bash "$TMPFILE" "$@"
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
