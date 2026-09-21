/**
 * Shipyard Safe Build Pipeline
 *
 * Guarantees that:
 * 1. Prisma generate never breaks Vercel deployments (no live DB needed at build time)
 * 2. Next.js builds in standalone mode when not on Vercel (for lean Docker images)
 * 3. The build always exits with a useful error code on failure
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const isVercel = !!process.env.VERCEL;

console.log(`\n[Shipyard Build] Mode: ${isVercel ? "Vercel (Cloud)" : "Appliance (Standalone)"}`);

// 1. Set dummy DATABASE_URL so Prisma generate never fails on missing env
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://shipyard:secret@localhost:5432/shipyard?schema=public";
  console.log("[Shipyard Build] Using dummy DATABASE_URL for Prisma generate.");
}

// 2. Patch next.config.js for Vercel: remove 'standalone' output mode
//    (Vercel manages its own output format and doesn't need standalone)
const nextConfigPath = path.join(__dirname, "..", "next.config.js");
if (isVercel && fs.existsSync(nextConfigPath)) {
  let config = fs.readFileSync(nextConfigPath, "utf8");
  if (config.includes("standalone")) {
    // On Vercel, the output should be undefined (let Vercel handle it)
    config = config.replace(
      /output:\s*process\.env\.VERCEL\s*\?\s*undefined\s*:\s*["']standalone["']/,
      'output: undefined'
    );
    fs.writeFileSync(nextConfigPath, config, "utf8");
    console.log("[Shipyard Build] ✓ Standalone output disabled for Vercel build.");
  }
}

// 3. Safely run Prisma generate (non-fatal on failure)
console.log("\n[Shipyard Build] Attempting Prisma client generation...");
const prismaBin = path.join(__dirname, "..", "node_modules", "prisma", "build", "index.js");

if (fs.existsSync(prismaBin)) {
  const prismaResult = spawnSync("node", [prismaBin, "generate"], {
    stdio: "inherit",
    env: process.env,
  });

  if (prismaResult.status === 0) {
    console.log("[Shipyard Build] ✓ Prisma Client generated successfully.");
  } else {
    console.warn(
      `[Shipyard Build] ⚠ Prisma generate exited with code ${prismaResult.status}. Continuing...`
    );
  }
} else {
  console.warn("[Shipyard Build] ⚠ Prisma binary not found. Skipping generate.");
}

// 4. Run Next.js build
console.log("\n[Shipyard Build] Compiling Next.js production build...\n");
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const buildResult = spawnSync("node", [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
});

if (buildResult.status !== 0) {
  console.error("\n[Shipyard Build] ✗ Next.js build FAILED with code:", buildResult.status);
  process.exit(buildResult.status || 1);
}

console.log("\n[Shipyard Build] ✓ Production build completed successfully!\n");
