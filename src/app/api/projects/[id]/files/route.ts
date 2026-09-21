import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/security/auth";
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.SHIPYARD_DATA_DIR || path.join(process.cwd(), "data");

function getProjectFilesDir(projectId: string): string {
  const dir = path.join(DATA_DIR, "apps", projectId, "files");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Recursively list files
function listFilesRecursively(dir: string, baseDir: string): { name: string; path: string; size: number; updatedAt: string }[] {
  let results: { name: string; path: string; size: number; updatedAt: string }[] = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

    if (item.isDirectory()) {
      results = results.concat(listFilesRecursively(fullPath, baseDir));
    } else {
      const stats = fs.statSync(fullPath);
      results.push({
        name: item.name,
        path: relPath,
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
      });
    }
  }
  return results;
}

// GET: List files in project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.projects.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const filesDir = getProjectFilesDir(project.id);
    const files = listFilesRecursively(filesDir, filesDir);

    // If no files yet, create starter files for static or web project
    if (files.length === 0) {
      const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="badge">HOSTED ON SHIPYARD</div>
    <h1>${project.name}</h1>
    <p>Your web application is deployed and running successfully.</p>
    <button id="actionBtn">Interact</button>
    <div id="output"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

      const defaultCss = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #09090b;
  color: #fafafa;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 600px;
  padding: 2.5rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #27272a;
  color: #a1a1aa;
  font-size: 0.75rem;
  font-family: monospace;
  border-radius: 9999px;
  margin-bottom: 1.25rem;
  letter-spacing: 0.05em;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #ffffff;
}

p {
  color: #a1a1aa;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

button {
  padding: 0.75rem 1.5rem;
  background: #fafafa;
  color: #09090b;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #e4e4e7;
}

#output {
  margin-top: 1.25rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: #34d399;
}`;

      const defaultJs = `document.getElementById('actionBtn').addEventListener('click', () => {
  const out = document.getElementById('output');
  out.textContent = 'Server timestamp: ' + new Date().toLocaleTimeString() + ' | Zero Config Appliance';
});`;

      fs.writeFileSync(path.join(filesDir, "index.html"), defaultHtml, "utf8");
      fs.writeFileSync(path.join(filesDir, "style.css"), defaultCss, "utf8");
      fs.writeFileSync(path.join(filesDir, "script.js"), defaultJs, "utf8");

      return NextResponse.json({
        files: listFilesRecursively(filesDir, filesDir),
      });
    }

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list files", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Upload or create new file
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const filesDir = getProjectFilesDir(project.id);
    const contentType = req.headers.get("content-type") || "";

    // If multipart form data (file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files") as File[];

      const uploaded = [];
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const targetPath = path.join(filesDir, file.name);
        fs.writeFileSync(targetPath, buffer);
        uploaded.push(file.name);
      }

      await db.activityLogs.create({
        userId: user.id,
        userEmail: user.email,
        action: "FILES_UPLOADED",
        entityType: "PROJECT",
        entityId: project.id,
        details: { files: uploaded, count: uploaded.length },
      });

      return NextResponse.json({
        success: true,
        uploaded,
        files: listFilesRecursively(filesDir, filesDir),
      });
    }

    // JSON body { fileName, content }
    const body = await req.json();
    const { fileName, content } = body;

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    // Security: sanitize path to prevent traversal
    const safeName = path.normalize(fileName).replace(/^(\.\.[\/\\])+/, "");
    const targetFile = path.join(filesDir, safeName);
    const targetDir = path.dirname(targetFile);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetFile, content || "", "utf8");

    await db.activityLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: "FILE_CREATED",
      entityType: "PROJECT",
      entityId: project.id,
      details: { fileName: safeName },
    });

    return NextResponse.json({
      success: true,
      file: safeName,
      files: listFilesRecursively(filesDir, filesDir),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create/upload file", message: (error as Error).message },
      { status: 500 }
    );
  }
}
