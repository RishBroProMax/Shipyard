#!/usr/bin/env node
/**
 * Shipyard Appliance Initializer & Maintenance Tool
 *
 * Commands:
 *   node scripts/init-appliance.js
 *   node scripts/init-appliance.js --reset-password <email> <newPassword>
 *   node scripts/init-appliance.js --status
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const DATA_DIR = process.env.SHIPYARD_DATA_DIR || path.join(process.cwd(), "data");
const SECRETS_DIR = path.join(DATA_DIR, "secrets");
const SECRETS_FILE = path.join(SECRETS_DIR, "shipyard.secret.json");
const DB_FILE = path.join(DATA_DIR, "shipyard-store.json");
const INITIALIZED_FLAG = path.join(DATA_DIR, ".initialized");

function ensureDirectories() {
  const dirs = [
    DATA_DIR,
    SECRETS_DIR,
    path.join(DATA_DIR, "deployments"),
    path.join(DATA_DIR, "apps"),
    path.join(DATA_DIR, "caddy"),
    path.join(DATA_DIR, "logs"),
    path.join(DATA_DIR, "backups"),
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }
}

function readStore() {
  ensureDirectories();
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [],
      sessions: [],
      projects: [],
      deployments: [],
      servers: [],
      domains: [],
      activityLogs: [],
      settings: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (err) {
    console.error("[Init Appliance] Failed to read store:", err.message);
    return {
      users: [],
      sessions: [],
      projects: [],
      deployments: [],
      servers: [],
      domains: [],
      activityLogs: [],
      settings: {},
    };
  }
}

function writeStore(store) {
  ensureDirectories();
  const tmp = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
}

// ── Reset Password Action ──────────────────────────────────────────────────
async function handleResetPassword(email, newPassword) {
  if (!email || !newPassword) {
    console.error("Error: --reset-password requires <email> and <newPassword> arguments.");
    process.exit(1);
  }

  const store = readStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error(`Error: User with email '${email}' not found in database.`);
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(newPassword, salt);

  user.passwordHash = hash;
  user.updatedAt = new Date().toISOString();

  // Invalidate existing sessions for security
  store.sessions = store.sessions.filter((s) => s.userId !== user.id);
  writeStore(store);

  // Update secrets file if it matches admin email
  if (fs.existsSync(SECRETS_FILE)) {
    try {
      const secrets = JSON.parse(fs.readFileSync(SECRETS_FILE, "utf8"));
      if (secrets.adminEmail && secrets.adminEmail.toLowerCase() === email.toLowerCase()) {
        secrets.adminInitialPassword = newPassword;
        fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2), "utf8");
      }
    } catch {}
  }

  console.log(`\n✓ Password for user '${email}' has been successfully reset!`);
  console.log(`  All active sessions for this account were invalidated for security.\n`);
  process.exit(0);
}

// ── Status Action ──────────────────────────────────────────────────────────
function handleStatus() {
  const isInit = fs.existsSync(INITIALIZED_FLAG);
  let secrets = null;
  if (fs.existsSync(SECRETS_FILE)) {
    try {
      secrets = JSON.parse(fs.readFileSync(SECRETS_FILE, "utf8"));
    } catch {}
  }
  const store = readStore();

  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║         SHIPYARD APPLIANCE SYSTEM STATUS              ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`  Initialized:     ${isInit ? "YES" : "NO"}`);
  console.log(`  Data Directory:  ${DATA_DIR}`);
  console.log(`  Admin Email:     ${secrets?.adminEmail || "Not configured"}`);
  console.log(`  Total Users:     ${store.users.length}`);
  console.log(`  Total Projects:  ${store.projects.length}`);
  console.log(`  Connected Nodes: ${store.servers.length}`);
  console.log(`  Active Domains:  ${store.domains.length}\n`);
  process.exit(0);
}

// ── Initialize Appliance Action ─────────────────────────────────────────────
async function handleInitialize() {
  console.log("[Shipyard Appliance] Bootstrapping appliance state...");
  ensureDirectories();

  const adminEmail = process.env.SHIPYARD_ADMIN_EMAIL || "admin@shipyard.local";
  const adminPassword =
    process.env.SHIPYARD_ADMIN_PASSWORD ||
    crypto.randomBytes(12).toString("base64").replace(/[+/=]/g, "a") + "!9A";

  let secrets = null;
  if (fs.existsSync(SECRETS_FILE)) {
    try {
      secrets = JSON.parse(fs.readFileSync(SECRETS_FILE, "utf8"));
    } catch {}
  }

  if (!secrets) {
    secrets = {
      postgresPassword: crypto.randomBytes(24).toString("hex"),
      redisPassword: crypto.randomBytes(24).toString("hex"),
      encryptionKey: crypto.randomBytes(32).toString("hex"),
      jwtSecret: crypto.randomBytes(32).toString("hex"),
      agentToken: `agt_${crypto.randomBytes(24).toString("hex")}`,
      adminEmail,
      adminInitialPassword: adminPassword,
      initializedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    console.log(`[Shipyard Appliance] Generated master secrets -> ${SECRETS_FILE}`);
  }

  const store = readStore();
  const existingAdmin = store.users.find(
    (u) => u.email.toLowerCase() === adminEmail.toLowerCase()
  );

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(adminPassword, salt);

    const adminUser = {
      id: crypto.randomUUID(),
      email: adminEmail,
      passwordHash: hash,
      role: "ADMIN",
      name: "Administrator",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.users.push(adminUser);
    writeStore(store);
    console.log(`[Shipyard Appliance] Admin account created: ${adminEmail}`);
  }

  // Ensure default server entry
  if (store.servers.length === 0) {
    const localServer = {
      id: crypto.randomUUID(),
      name: "Local Host (Built-in)",
      host: "localhost",
      token: secrets.agentToken,
      status: "ONLINE",
      isLocalHost: true,
      agentVersion: "1.0.0",
      cpuCores: 4,
      cpuUsage: 0,
      memoryTotal: 8589934592,
      memoryUsed: 2147483648,
      memoryUsage: 25.0,
      diskTotal: 107374182400,
      diskUsed: 21474836480,
      diskUsage: 20.0,
      networkInSec: 0,
      networkOutSec: 0,
      networkInTotal: 0,
      networkOutTotal: 0,
      dockerVersion: "27.0.0",
      containerCount: 0,
      uptimeSeconds: Math.floor(process.uptime()),
      lastHeartbeatAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.servers.push(localServer);
    writeStore(store);
    console.log("[Shipyard Appliance] Default local server registered.");
  }

  // Write initialized flag
  fs.writeFileSync(
    INITIALIZED_FLAG,
    `Shipyard Appliance Initialized at ${new Date().toISOString()}\nAdmin: ${adminEmail}\n`
  );

  console.log("✓ Shipyard appliance is fully initialized and operational.");
}

// ── CLI Dispatcher ─────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--reset-password")) {
    const idx = args.indexOf("--reset-password");
    const email = args[idx + 1];
    const newPassword = args[idx + 2];
    await handleResetPassword(email, newPassword);
    return;
  }

  if (args.includes("--status")) {
    handleStatus();
    return;
  }

  await handleInitialize();
}

main().catch((err) => {
  console.error("[Init Appliance Error]", err);
  process.exit(1);
});
