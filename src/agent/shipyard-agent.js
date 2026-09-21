#!/usr/bin/env node
/**
 * Shipyard Production Deployment Agent
 * 
 * Runs on worker nodes (VPS, remote servers, or bare metal) to execute
 * builds, manage Docker containers, and stream real-time metrics back to
 * the Shipyard Leader (Control Plane).
 * 
 * Zero external dependencies: works on any system with Node.js 18+ installed.
 */

const os = require("os");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { exec, execSync, spawn } = require("child_process");

// Configuration from CLI flags or Environment
const args = process.argv.slice(2);
function getArg(flag, envVar, fallback) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return process.env[envVar] || fallback;
}

const LEADER_URL = (getArg("--leader", "SHIPYARD_LEADER_URL", "http://localhost:3000")).replace(/\/+$/, "");
const AGENT_TOKEN = getArg("--token", "SHIPYARD_AGENT_TOKEN", "");
const NODE_NAME = getArg("--name", "SHIPYARD_NODE_NAME", os.hostname());
const HEARTBEAT_INTERVAL_MS = 3000;

if (!AGENT_TOKEN) {
  console.error("\x1b[31m[Shipyard Agent Error]\x1b[0m Missing required agent token.");
  console.error("Usage: node shipyard-agent.js --leader <LEADER_URL> --token <AGENT_TOKEN> [--name <NODE_NAME>]");
  process.exit(1);
}

let serverId = null;
let lastCpuMeasure = null;
let lastNetMeasure = null;
let isShuttingDown = false;

// HTTP helper
function apiRequest(endpoint, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${LEADER_URL}${endpoint}`);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;

    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shipyard-Agent-Token": AGENT_TOKEN,
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
      timeout: 10000,
    };

    const req = client.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error || `HTTP ${res.statusCode}: ${body}`));
          }
        } catch {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ raw: body });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

// Measure CPU Usage Delta
function getCpuMetrics() {
  const cpus = os.cpus();
  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;

  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }

  const total = user + nice + sys + idle + irq;
  const current = { idle, total };

  let usagePercent = 0;
  if (lastCpuMeasure) {
    const idleDiff = current.idle - lastCpuMeasure.idle;
    const totalDiff = current.total - lastCpuMeasure.total;
    if (totalDiff > 0) {
      usagePercent = Math.max(0, Math.min(100, (1 - idleDiff / totalDiff) * 100));
    }
  }
  lastCpuMeasure = current;
  return {
    cores: cpus.length,
    usage: parseFloat(usagePercent.toFixed(1)),
  };
}

// Measure Memory
function getMemoryMetrics() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const usage = parseFloat(((used / total) * 100).toFixed(1));
  return { total, used, usage };
}

// Measure Network In/Out counters
function getNetworkMetrics() {
  let rxBytes = 0;
  let txBytes = 0;

  // On Linux, read /proc/net/dev
  if (process.platform === "linux" && fs.existsSync("/proc/net/dev")) {
    try {
      const lines = fs.readFileSync("/proc/net/dev", "utf8").split("\n");
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        if (parts.length >= 10) {
          const iface = parts[0].replace(":", "");
          if (iface !== "lo") {
            rxBytes += parseInt(parts[1], 10) || 0;
            txBytes += parseInt(parts[9], 10) || 0;
          }
        }
      }
    } catch {}
  } else if (process.platform === "win32") {
    // On Windows, read netstat -e
    try {
      const shellPath =
        fs.existsSync("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe")
          ? "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
          : undefined;
      const out = execSync("netstat -e", {
        encoding: "utf8",
        shell: shellPath,
        timeout: 1500,
      });
      const match = out.match(/Bytes\s+(\d+)\s+(\d+)/i);
      if (match) {
        rxBytes = parseInt(match[1], 10) || 0;
        txBytes = parseInt(match[2], 10) || 0;
      }
    } catch {}
  }

  const now = Date.now();
  let rxPerSec = 0;
  let txPerSec = 0;

  if (lastNetMeasure) {
    const elapsedSec = (now - lastNetMeasure.time) / 1000;
    if (elapsedSec > 0 && rxBytes >= lastNetMeasure.rx && txBytes >= lastNetMeasure.tx) {
      rxPerSec = Math.max(0, (rxBytes - lastNetMeasure.rx) / elapsedSec);
      txPerSec = Math.max(0, (txBytes - lastNetMeasure.tx) / elapsedSec);
    }
  }

  lastNetMeasure = { rx: rxBytes, tx: txBytes, time: now };

  return {
    inSec: Math.round(rxPerSec),
    outSec: Math.round(txPerSec),
    inTotal: rxBytes,
    outTotal: txBytes,
  };
}

// Get Disk Metrics
function getDiskMetrics() {
  try {
    const rootPath = process.platform === "win32" ? process.cwd() : "/";
    const stat = fs.statfsSync(rootPath);
    const total = stat.blocks * stat.bsize;
    const free = stat.bavail * stat.bsize;
    const used = Math.max(0, total - free);
    const usage = total > 0 ? parseFloat(((used / total) * 100).toFixed(1)) : 0;
    return { total, used, usage };
  } catch {
    // Fallback on unix systems
    if (process.platform !== "win32") {
      try {
        const output = execSync("df -k / | tail -1", { encoding: "utf8" });
        const parts = output.trim().split(/\s+/);
        if (parts.length >= 4) {
          const total = parseInt(parts[1], 10) * 1024;
          const used = parseInt(parts[2], 10) * 1024;
          const usage = parseFloat(((used / total) * 100).toFixed(1));
          return { total, used, usage };
        }
      } catch {}
    }
    return { total: 0, used: 0, usage: 0 };
  }
}

// Check Docker status & running containers
function getDockerMetrics() {
  let dockerVersion = "Unavailable";
  let containerCount = 0;

  try {
    const ver = execSync("docker --version", { encoding: "utf8", timeout: 3000 }).trim();
    dockerVersion = ver.replace("Docker version ", "").split(",")[0];
    const ps = execSync("docker ps -q", { encoding: "utf8", timeout: 3000 }).trim();
    containerCount = ps ? ps.split("\n").filter(Boolean).length : 0;
  } catch {}

  return { dockerVersion, containerCount };
}

// Register this node with the Shipyard Control Plane
async function registerNode() {
  console.log(`\x1b[36m[Shipyard Agent]\x1b[0m Connecting to leader at ${LEADER_URL}...`);
  const cpu = getCpuMetrics();
  const mem = getMemoryMetrics();
  const disk = getDiskMetrics();
  const docker = getDockerMetrics();

  try {
    const res = await apiRequest("/api/servers/register", "POST", {
      name: NODE_NAME,
      host: os.hostname(),
      token: AGENT_TOKEN,
      cpuCores: cpu.cores,
      memoryTotal: mem.total,
      diskTotal: disk.total,
      dockerVersion: docker.dockerVersion,
    });

    serverId = res.server.id;
    console.log(`\x1b[32m[Shipyard Agent]\x1b[0m Successfully registered as node: '${NODE_NAME}' (ID: ${serverId})`);
  } catch (err) {
    console.error(`\x1b[31m[Shipyard Agent Registration Failed]\x1b[0m`, err.message);
    process.exit(1);
  }
}

// Send periodic heartbeat with real-time RAM, CPU, Network, Disk stats
async function sendHeartbeat() {
  if (!serverId || isShuttingDown) return;

  const cpu = getCpuMetrics();
  const mem = getMemoryMetrics();
  const net = getNetworkMetrics();
  const disk = getDiskMetrics();
  const docker = getDockerMetrics();

  try {
    await apiRequest(`/api/servers/${serverId}/heartbeat`, "POST", {
      cpuUsage: cpu.usage,
      cpuCores: cpu.cores,
      memoryTotal: mem.total,
      memoryUsed: mem.used,
      memoryUsage: mem.usage,
      diskTotal: disk.total,
      diskUsed: disk.used,
      diskUsage: disk.usage,
      networkInSec: net.inSec,
      networkOutSec: net.outSec,
      networkInTotal: net.inTotal,
      networkOutTotal: net.outTotal,
      dockerVersion: docker.dockerVersion,
      containerCount: docker.containerCount,
      uptimeSeconds: Math.floor(process.uptime()),
    });
  } catch (err) {
    // Leader temporarily unreachable; retry on next heartbeat
  }
}

// Start Agent Lifecycle
async function start() {
  console.log("==================================================");
  console.log("             SHIPYARD DEPLOYMENT AGENT            ");
  console.log("==================================================");
  console.log(`Node Name:  ${NODE_NAME}`);
  console.log(`Platform:   ${os.platform()} (${os.arch()})`);
  console.log(`Leader:     ${LEADER_URL}`);
  console.log("--------------------------------------------------");

  await registerNode();

  // Send first heartbeat immediately
  await sendHeartbeat();

  // Schedule continuous heartbeats
  setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

  console.log(`\x1b[32m[Shipyard Agent]\x1b[0m Heartbeat active (every ${HEARTBEAT_INTERVAL_MS / 1000}s). Ready for deployments.`);
}

// Graceful shutdown
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("\n[Shipyard Agent] Shutting down gracefully...");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
