import fs from "fs";
import path from "path";
import { generateSecureToken, generateSecurePassword } from "../security/crypto";
import { db } from "../db";
import { hashPassword } from "../security/auth";

export interface ShipyardSecrets {
  postgresPassword: string;
  redisPassword: string;
  encryptionKey: string;
  jwtSecret: string;
  agentToken: string;
  adminEmail: string;
  adminInitialPassword?: string;
  initializedAt: string;
}

const DATA_DIR = process.env.SHIPYARD_DATA_DIR || path.join(process.cwd(), "data");
const SECRETS_DIR = path.join(DATA_DIR, "secrets");
const SECRETS_FILE = path.join(SECRETS_DIR, "shipyard.secret.json");
const INITIALIZED_FLAG = path.join(DATA_DIR, ".initialized");

/**
 * Ensures all required data directories exist
 */
export function ensureDataDirectories(): void {
  const dirs = [
    DATA_DIR,
    SECRETS_DIR,
    path.join(DATA_DIR, "deployments"),
    path.join(DATA_DIR, "apps"),
    path.join(DATA_DIR, "caddy"),
    path.join(DATA_DIR, "logs"),
    path.join(DATA_DIR, "backups"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Checks if Shipyard has already been initialized
 */
export function isInitialized(): boolean {
  return fs.existsSync(INITIALIZED_FLAG) && fs.existsSync(SECRETS_FILE);
}

/**
 * Loads existing secrets
 */
export function loadSecrets(): ShipyardSecrets | null {
  if (!fs.existsSync(SECRETS_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(SECRETS_FILE, "utf8");
    return JSON.parse(raw) as ShipyardSecrets;
  } catch (error) {
    console.error("[Shipyard Supervisor] Failed to parse secrets file:", error);
    return null;
  }
}

/**
 * Initializes or loads Shipyard secrets, users, and default local node
 */
export async function initializeSupervisor(): Promise<{
  secrets: ShipyardSecrets;
  isFirstBoot: boolean;
}> {
  ensureDataDirectories();

  if (isInitialized()) {
    const existing = loadSecrets();
    if (existing) {
      if (!process.env.SHIPYARD_JWT_SECRET) process.env.SHIPYARD_JWT_SECRET = existing.jwtSecret;
      if (!process.env.SHIPYARD_ENCRYPTION_KEY) process.env.SHIPYARD_ENCRYPTION_KEY = existing.encryptionKey;
      return { secrets: existing, isFirstBoot: false };
    }
  }

  console.log("[Shipyard Supervisor] First boot detected! Initializing appliance...");

  // Generate cryptographically secure secrets
  const adminEmail = process.env.SHIPYARD_ADMIN_EMAIL || "admin@shipyard.local";
  const adminPassword = process.env.SHIPYARD_ADMIN_PASSWORD || generateSecurePassword(18);

  const secrets: ShipyardSecrets = {
    postgresPassword: generateSecureToken(24),
    redisPassword: generateSecureToken(24),
    encryptionKey: generateSecureToken(32),
    jwtSecret: generateSecureToken(32),
    agentToken: `agt_${generateSecureToken(24)}`,
    adminEmail,
    adminInitialPassword: adminPassword,
    initializedAt: new Date().toISOString(),
  };

  // Write secrets to protected file
  try {
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
  } catch {
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(secrets, null, 2), "utf8");
  }

  // Set active runtime environment variables
  process.env.SHIPYARD_JWT_SECRET = secrets.jwtSecret;
  process.env.SHIPYARD_ENCRYPTION_KEY = secrets.encryptionKey;

  // Create initial administrator account in database
  const existingAdmin = await db.users.findByEmail(adminEmail);
  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await db.users.create({
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      name: "Administrator",
    });
    console.log(`[Shipyard Supervisor] Initial admin user created: ${adminEmail}`);
  }

  // Register default built-in local server node
  const existingServers = await db.servers.list();
  if (existingServers.length === 0) {
    const { getHostMetrics } = await import("../system/telemetry");
    const hostMetrics = getHostMetrics();
    await db.servers.create({
      name: "Local Host (Built-in)",
      host: "localhost",
      token: secrets.agentToken,
      status: "ONLINE",
      isLocalHost: true,
      agentVersion: "1.0.0",
      cpuCores: hostMetrics.cpuCores,
      cpuUsage: hostMetrics.cpuUsage,
      memoryTotal: hostMetrics.memoryTotal,
      memoryUsed: hostMetrics.memoryUsed,
      memoryUsage: hostMetrics.memoryUsage,
      diskTotal: hostMetrics.diskTotal,
      diskUsed: hostMetrics.diskUsed,
      diskUsage: hostMetrics.diskUsage,
      networkInSec: hostMetrics.networkInSec,
      networkOutSec: hostMetrics.networkOutSec,
      networkInTotal: hostMetrics.networkInTotal,
      networkOutTotal: hostMetrics.networkOutTotal,
      dockerVersion: hostMetrics.dockerVersion,
      containerCount: hostMetrics.containerCount,
      uptimeSeconds: hostMetrics.uptimeSeconds,
      lastHeartbeatAt: new Date().toISOString(),
    });
    console.log("[Shipyard Supervisor] Built-in local server registered with real host metrics.");
  }

  // Record initial audit activity
  await db.activityLogs.create({
    action: "APPLIANCE_INITIALIZED",
    entityType: "SYSTEM",
    entityId: "appliance",
    details: {
      adminEmail,
      initializedAt: secrets.initializedAt,
      version: "1.0.0",
    },
    ipAddress: "127.0.0.1",
  });

  // Create initialized flag
  fs.writeFileSync(
    INITIALIZED_FLAG,
    `Shipyard initialized on ${secrets.initializedAt}\nAdmin: ${secrets.adminEmail}\n`
  );

  console.log("[Shipyard Supervisor] Appliance initialization complete.");
  return { secrets, isFirstBoot: true };
}
