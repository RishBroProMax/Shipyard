import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.SHIPYARD_DATA_DIR || path.join(process.cwd(), "data");

function getSafeFilePath(projectId: string, filePathSegments: string[]): string {
  const relPath = filePathSegments.join("/");
  const safeRelPath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, "");
  return path.join(DATA_DIR, "apps", projectId, "files", safeRelPath);
}

// GET: Read file content
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; filePath: string[] } }
) {
  try {
    const project = await db.projects.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const fullPath = getSafeFilePath(params.id, params.filePath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const content = fs.readFileSync(fullPath, "utf8");
    return NextResponse.json({
      path: params.filePath.join("/"),
      content,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read file", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Save file content
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; filePath: string[] } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await db.projects.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { content } = body;

    const fullPath = getSafeFilePath(params.id, params.filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content ?? "", "utf8");

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "FILE_UPDATED",
      entityType: "PROJECT",
      entityId: project.id,
      details: { file: params.filePath.join("/") },
    });

    return NextResponse.json({
      success: true,
      path: params.filePath.join("/"),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save file", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete file
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; filePath: string[] } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await db.projects.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const fullPath = getSafeFilePath(params.id, params.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "FILE_DELETED",
      entityType: "PROJECT",
      entityId: project.id,
      details: { file: params.filePath.join("/") },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete file", message: (error as Error).message },
      { status: 500 }
    );
  }
}
