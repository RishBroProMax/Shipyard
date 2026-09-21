export type UserRole = "ADMIN" | "OPERATOR" | "VIEWER";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  createdAt: string;
}

export type ProjectStatus =
  | "IDLE"
  | "QUEUED"
  | "BUILDING"
  | "DEPLOYING"
  | "HEALTH_CHECKING"
  | "RUNNING"
  | "FAILED"
  | "STOPPED";

export type BuildpackType = "AUTO" | "DOCKERFILE" | "NODEJS" | "PYTHON" | "STATIC" | "CUSTOM";

export interface ProjectModel {
  id: string;
  name: string;
  slug: string;
  repoUrl: string;
  branch: string;
  appType: BuildpackType;
  rootDir: string;
  dockerfilePath?: string | null;
  buildCommand?: string | null;
  runCommand?: string | null;
  targetPort: number;
  allocatedPort?: number | null;
  liveUrl?: string | null;
  status: ProjectStatus;
  autoDeploy: boolean;
  envVars?: Record<string, string> | string | null;
  serverId?: string | null;
  serverName?: string | null;
  createdAt: string;
  updatedAt: string;
  deployments?: DeploymentModel[];
  domains?: DomainModel[];
}

export type DeploymentStatus =
  | "QUEUED"
  | "BUILDING"
  | "DEPLOYING"
  | "HEALTH_CHECKING"
  | "RUNNING"
  | "FAILED"
  | "CANCELLED";

export type DeploymentTrigger = "MANUAL" | "WEBHOOK" | "ROLLBACK" | "AUTO";

export interface DeploymentModel {
  id: string;
  projectId: string;
  projectName?: string;
  serverId?: string | null;
  serverName?: string | null;
  status: DeploymentStatus;
  trigger: DeploymentTrigger;
  commitHash?: string | null;
  commitMessage?: string | null;
  commitAuthor?: string | null;
  branch: string;
  containerId?: string | null;
  allocatedPort?: number | null;
  liveUrl?: string | null;
  durationMs: number;
  buildLogs?: string | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ServerStatus = "ONLINE" | "OFFLINE" | "PROVISIONING";

export interface ServerModel {
  id: string;
  name: string;
  host: string;
  token: string;
  status: ServerStatus;
  isLocalHost: boolean;
  agentVersion: string;
  cpuCores: number;
  cpuUsage: number; // 0 - 100 %
  memoryTotal: number; // bytes
  memoryUsed: number; // bytes
  memoryUsage: number; // 0 - 100 %
  diskTotal: number; // bytes
  diskUsed: number; // bytes
  diskUsage: number; // 0 - 100 %
  networkInSec: number; // bytes/sec
  networkOutSec: number; // bytes/sec
  networkInTotal: number; // bytes
  networkOutTotal: number; // bytes
  dockerVersion: string;
  containerCount: number;
  uptimeSeconds: number;
  lastHeartbeatAt: string;
  createdAt: string;
  updatedAt: string;
  projectCount?: number;
}

export interface DomainModel {
  id: string;
  projectId: string;
  domain: string;
  sslStatus: "PENDING" | "ACTIVE" | "FAILED";
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogModel {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: "PROJECT" | "DEPLOYMENT" | "SERVER" | "SYSTEM" | "AUTH";
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ApplianceHealth {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  initialized: boolean;
  version: string;
  uptimeSeconds: number;
  services: {
    database: { status: "UP" | "DOWN"; latencyMs?: number };
    redis: { status: "UP" | "DOWN"; latencyMs?: number };
    docker: { status: "UP" | "DOWN"; version?: string };
    localAgent: { status: "UP" | "DOWN"; activeContainers: number };
    storage: { status: "UP" | "DOWN"; path: string; freeSpaceMb?: number };
  };
}
