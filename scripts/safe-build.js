/**
 * Shipyard Safe Build Pipeline
 *
 * Handles two build targets from the same repository:
 *
 *   1. VERCEL BUILD  (VERCEL=1 set automatically by Vercel)
 *      → next.config.js uses output: undefined (Vercel manages output format)
 *      → Prisma generate is attempted but non-fatal
 *      → Serves: landing page, docs, install.sh, agent_install endpoints
 *
 *   2. DOCKER BUILD  (SHIPYARD_STANDALONE=1)
 *      → next.config.js uses output: 'standalone' (lean self-contained bundle)
 *      → Full build for appliance mode
 *
 * Usage:
 *   Vercel:  npm run build  (VERCEL=1 is auto-set)
 *   Docker:  SHIPYARD_STANDALONE=1 npm run build
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const isVercel = !!process.env.VERCEL;
const isDocker = process.env.SHIPYARD_STANDALONE === "1";

console.log(`\n╔══════════════════════════════════════════╗`);
console.log(`║        SHIPYARD SAFE BUILD PIPELINE      ║`);
console.log(`╚══════════════════════════════════════════╝`);
console.log(`  Target:  ${isVercel ? "Vercel Cloud" : isDocker ? "Docker Standalone" : "Development"}`);
console.log(`  Node:    ${process.version}`);
console.log(`  Cwd:     ${process.cwd()}\n`);

// 1. Provide dummy DATABASE_URL so Prisma generate never errors on build machines
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://shipyard:secret@localhost:5432/shipyard?schema=public";
  console.log("[Build] Using dummy DATABASE_URL for Prisma schema generation.");
}

// 2. Safely run Prisma generate (schema introspection only — no DB connection)
console.log("[Build] Generating Prisma client types...");
const prismaBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "prisma",
  "build",
  "index.js"
);

if (fs.existsSync(prismaBin)) {
  const prismaResult = spawnSync("node", [prismaBin, "generate"], {
    stdio: "inherit",
    env: process.env,
  });
  if (prismaResult.status === 0) {
    console.log("[Build] ✓ Prisma Client generated.");
  } else {
    console.warn(
      `[Build] ⚠ Prisma generate exited with code ${prismaResult.status ?? "unknown"}. Continuing...`
    );
  }
} else {
  console.warn("[Build] ⚠ Prisma binary not found — skipping generate.");
}

// 3. Run Next.js build
console.log(`\n[Build] Running Next.js production build...\n`);
const nextBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

const buildResult = spawnSync("node", [nextBin, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

if (buildResult.status !== 0) {
  console.error(
    `\n[Build] ✗ Next.js build FAILED with exit code: ${buildResult.status ?? 1}`
  );
  process.exit(buildResult.status || 1);
}

console.log(`\n[Build] ✓ Production build completed successfully!\n`);
