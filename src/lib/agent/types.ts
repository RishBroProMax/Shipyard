import { BuildpackType } from "@/types";

export interface ServerMetrics {
  cpuUsage: number;
  cpuCores: number;
  memoryTotal: number;
  memoryUsage: number;
  diskTotal: number;
  diskUsage: number;
  dockerVersion: string;
  containerCount: number;
}

export interface DeploymentJob {
  deploymentId: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  repoUrl: string;
  branch: string;
  commitHash?: string;
  appType: BuildpackType;
  rootDir: string;
  dockerfilePath?: string;
  buildCommand?: string;
  runCommand?: string;
  targetPort: number;
  envVars: Record<string, string>;
  allocatedPort?: number;
}

export interface BuildLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug" | "stdout" | "stderr";
  message: string;
}

export interface BuildpackDetectionResult {
  type: BuildpackType;
  confidence: number;
  reason: string;
  suggestedPort: number;
  suggestedBuildCommand?: string;
  suggestedRunCommand?: string;
  generatedDockerfile?: string;
}
