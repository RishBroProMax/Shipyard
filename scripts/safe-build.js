/**
 * Shipyard Safe Build Pipeline
 * Guarantees that Prisma never breaks or damages Vercel deployments.
 * On Vercel, Shipyard functions as the public landing page, documentation, and installer hub.
 */

const { spawnSync } = require("child_process");
const path = require("path");

// 1. Fallback DATABASE_URL so Prisma never errors on missing env vars during Vercel builds
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://shipyard:secret@localhost:5432/shipyard?schema=public";
}

// 2. Safely attempt prisma generate without failing the build if Prisma engine is unavailable
console.log("\n[Shipyard Build] Attempting safe Prisma client generation...");
try {
  const prismaBin = path.join(__dirname, "..", "node_modules", "prisma", "build", "index.js");
  const result = spawnSync("node", [prismaBin, "generate"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status === 0) {
    console.log("[Shipyard Build] ✓ Prisma Client generated successfully.");
  } else {
    console.warn(
      "[Shipyard Build] ⚠ Prisma generate exited with code " +
        result.status +
        ". Continuing to Next.js build..."
    );
  }
} catch (err) {
  console.warn(
    "[Shipyard Build] ⚠ Prisma generate skipped (" + err.message + "). Continuing..."
  );
}

// 3. Execute Next.js build
console.log("[Shipyard Build] Compiling Next.js production build...\n");
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const buildResult = spawnSync("node", [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
});

if (buildResult.status !== 0) {
  console.error("[Shipyard Build] ✗ Next.js build failed with code:", buildResult.status);
  process.exit(buildResult.status || 1);
}

console.log("\n[Shipyard Build] ✓ Production build completed successfully!");
