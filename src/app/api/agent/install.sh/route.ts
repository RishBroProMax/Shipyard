import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "scripts", "agent-install.sh");
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Installer script not found", { status: 404 });
  }

  const script = fs.readFileSync(filePath, "utf8");
  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript",
      "Cache-Control": "no-cache",
    },
  });
}
