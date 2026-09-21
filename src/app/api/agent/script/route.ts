import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "src", "agent", "shipyard-agent.js");
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Agent script not found", { status: 404 });
  }

  const script = fs.readFileSync(filePath, "utf8");
  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache",
    },
  });
}
