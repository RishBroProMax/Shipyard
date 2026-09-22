import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export interface ContainerInfo {
  id: string;
  names: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  created: string;
  labels?: Record<string, string>;
}

export interface ContainerStats {
  containerId: string;
  name: string;
  cpuPercent: number;
  memoryUsageBytes: number;
  memoryLimitBytes: number;
  memoryPercent: number;
  networkInBytes: number;
  networkOutBytes: number;
  pids: number;
}

/**
 * Docker Engine Orchestration & Telemetry Service
 */
export const docker = {
  /**
   * Checks if Docker daemon is responsive
   */
  async isAvailable(): Promise<boolean> {
    try {
      const { stdout } = await execAsync("docker --version", { timeout: 3000 });
      return stdout.includes("Docker version");
    } catch {
      return false;
    }
  },

  /**
   * Retrieves Docker Engine version string
   */
  async getVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync("docker version --format '{{.Server.Version}}'", {
        timeout: 4000,
      });
      return stdout.trim().replace(/'/g, "") || "Available";
    } catch {
      try {
        const { stdout } = await execAsync("docker --version", { timeout: 3000 });
        return stdout.trim();
      } catch {
        return "Unavailable";
      }
    }
  },

  /**
   * Lists active Shipyard-managed containers or all containers
   */
  async listContainers(all = true): Promise<ContainerInfo[]> {
    try {
      const flag = all ? "-a" : "";
      const format = '{{json .}}';
      const { stdout } = await execAsync(`docker ps ${flag} --format "${format}"`, {
        timeout: 6000,
      });

      if (!stdout.trim()) return [];

      const lines = stdout.trim().split("\n");
      const containers: ContainerInfo[] = [];

      for (const line of lines) {
        try {
          const raw = JSON.parse(line);
          containers.push({
            id: raw.ID || raw.Id,
            names: raw.Names || raw.Name || "",
            image: raw.Image || "",
            status: raw.Status || "",
            state: raw.State || "",
            ports: raw.Ports || "",
            created: raw.CreatedAt || "",
          });
        } catch {}
      }

      return containers;
    } catch {
      return [];
    }
  },

  /**
   * Inspects live CPU, RAM, and Network usage for a single container
   */
  async getStats(containerIdOrName: string): Promise<ContainerStats | null> {
    try {
      const { stdout } = await execAsync(
        `docker stats ${containerIdOrName} --no-stream --format "{{json .}}"`,
        { timeout: 5000 }
      );

      if (!stdout.trim()) return null;

      const raw = JSON.parse(stdout.trim().split("\n")[0]);

      // Parse CPU %: "0.25%" -> 0.25
      const cpuPercent = parseFloat((raw.CPUPerc || "0%").replace("%", "")) || 0;

      // Parse Memory: "45.2MiB / 1.952GiB"
      let memoryUsageBytes = 0;
      let memoryLimitBytes = 0;
      const memParts = (raw.MemUsage || "").split("/");
      if (memParts.length === 2) {
        memoryUsageBytes = parseByteString(memParts[0].trim());
        memoryLimitBytes = parseByteString(memParts[1].trim());
      }

      const memoryPercent = parseFloat((raw.MemPerc || "0%").replace("%", "")) || 0;

      // Parse Net I/O: "1.2MB / 500KB"
      let networkInBytes = 0;
      let networkOutBytes = 0;
      const netParts = (raw.NetIO || "").split("/");
      if (netParts.length === 2) {
        networkInBytes = parseByteString(netParts[0].trim());
        networkOutBytes = parseByteString(netParts[1].trim());
      }

      const pids = parseInt(raw.PIDs || "0", 10) || 0;

      return {
        containerId: raw.ID || containerIdOrName,
        name: raw.Name || containerIdOrName,
        cpuPercent,
        memoryUsageBytes,
        memoryLimitBytes,
        memoryPercent,
        networkInBytes,
        networkOutBytes,
        pids,
      };
    } catch {
      return null;
    }
  },

  /**
   * Stops a running container
   */
  async stop(containerIdOrName: string): Promise<boolean> {
    try {
      await execAsync(`docker stop ${containerIdOrName}`, { timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Starts an existing container
   */
  async start(containerIdOrName: string): Promise<boolean> {
    try {
      await execAsync(`docker start ${containerIdOrName}`, { timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Restarts a container
   */
  async restart(containerIdOrName: string): Promise<boolean> {
    try {
      await execAsync(`docker restart ${containerIdOrName}`, { timeout: 15000 });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Forcefully or cleanly removes a container
   */
  async remove(containerIdOrName: string, force = true): Promise<boolean> {
    try {
      const flag = force ? "-f" : "";
      await execAsync(`docker rm ${flag} ${containerIdOrName}`, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Fetches latest container logs
   */
  async getLogs(containerIdOrName: string, tail = 200): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(
        `docker logs --tail ${tail} ${containerIdOrName}`,
        { timeout: 6000 }
      );
      return stdout || stderr || "";
    } catch (err) {
      return (err as Error).message;
    }
  },
};

/**
 * Parses strings like "45.2MiB", "1.95GB", "500B", "12kB" into bytes
 */
function parseByteString(str: string): number {
  if (!str) return 0;
  const match = str.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = (match[2] || "").toLowerCase();

  switch (unit) {
    case "b":
      return Math.round(value);
    case "kb":
    case "kib":
      return Math.round(value * 1024);
    case "mb":
    case "mib":
      return Math.round(value * 1024 * 1024);
    case "gb":
    case "gib":
      return Math.round(value * 1024 * 1024 * 1024);
    case "tb":
    case "tib":
      return Math.round(value * 1024 * 1024 * 1024 * 1024);
    default:
      return Math.round(value);
  }
}
