import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  ProjectModel,
  DeploymentModel,
  ServerModel,
  DomainModel,
  ActivityLogModel,
  UserProfile,
} from "@/types";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface ShipyardDatabaseState {
  users: StoredUser[];
  sessions: StoredSession[];
  projects: ProjectModel[];
  deployments: DeploymentModel[];
  servers: ServerModel[];
  domains: DomainModel[];
  activityLogs: ActivityLogModel[];
  settings: Record<string, string>;
}

const DATA_DIR = process.env.SHIPYARD_DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "shipyard-store.json");

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialState: ShipyardDatabaseState = {
      users: [],
      sessions: [],
      projects: [],
      deployments: [],
      servers: [],
      domains: [],
      activityLogs: [],
      settings: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), "utf8");
  }
}

function readState(): ShipyardDatabaseState {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw) as ShipyardDatabaseState;
  } catch {
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

function writeState(state: ShipyardDatabaseState): void {
  ensureStorage();
  const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(tempFile, DB_FILE);
}

// Global in-memory lock/state
export const db = {
  // Users
  users: {
    async list(): Promise<StoredUser[]> {
      const state = readState();
      return state.users;
    },
    async findByEmail(email: string): Promise<StoredUser | null> {
      const state = readState();
      return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    async findById(id: string): Promise<StoredUser | null> {
      const state = readState();
      return state.users.find((u) => u.id === id) || null;
    },
    async create(data: Omit<StoredUser, "id" | "createdAt" | "updatedAt">): Promise<StoredUser> {
      const state = readState();
      const user: StoredUser = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.users.push(user);
      writeState(state);
      return user;
    },
    async count(): Promise<number> {
      const state = readState();
      return state.users.length;
    },
  },

  // Sessions
  sessions: {
    async create(data: Omit<StoredSession, "id" | "createdAt">): Promise<StoredSession> {
      const state = readState();
      const session: StoredSession = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      state.sessions.push(session);
      writeState(state);
      return session;
    },
    async findByToken(token: string): Promise<(StoredSession & { user: StoredUser }) | null> {
      const state = readState();
      const session = state.sessions.find((s) => s.token === token);
      if (!session) return null;
      if (new Date(session.expiresAt) < new Date()) {
        // Expired
        state.sessions = state.sessions.filter((s) => s.id !== session.id);
        writeState(state);
        return null;
      }
      const user = state.users.find((u) => u.id === session.userId);
      if (!user) return null;
      return { ...session, user };
    },
    async delete(token: string): Promise<void> {
      const state = readState();
      state.sessions = state.sessions.filter((s) => s.token !== token);
      writeState(state);
    },
  },

  // Servers
  servers: {
    async list(): Promise<ServerModel[]> {
      const state = readState();
      return state.servers.map((server) => ({
        ...server,
        projectCount: state.projects.filter((p) => p.serverId === server.id).length,
      }));
    },
    async findById(id: string): Promise<ServerModel | null> {
      const state = readState();
      return state.servers.find((s) => s.id === id) || null;
    },
    async findByToken(token: string): Promise<ServerModel | null> {
      const state = readState();
      return state.servers.find((s) => s.token === token) || null;
    },
    async create(
      data: Omit<ServerModel, "id" | "createdAt" | "updatedAt"> | (Partial<ServerModel> & { name: string; token: string })
    ): Promise<ServerModel> {
      const state = readState();
      const server: ServerModel = {
        id: crypto.randomUUID(),
        host: "localhost",
        status: "ONLINE",
        isLocalHost: false,
        agentVersion: "1.0.0",
        cpuCores: 0,
        cpuUsage: 0,
        memoryTotal: 0,
        memoryUsed: 0,
        memoryUsage: 0,
        diskTotal: 0,
        diskUsed: 0,
        diskUsage: 0,
        networkInSec: 0,
        networkOutSec: 0,
        networkInTotal: 0,
        networkOutTotal: 0,
        dockerVersion: "Pending",
        containerCount: 0,
        uptimeSeconds: 0,
        lastHeartbeatAt: new Date().toISOString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.servers.push(server);
      writeState(state);
      return server;
    },
    async update(id: string, updates: Partial<ServerModel>): Promise<ServerModel | null> {
      const state = readState();
      const index = state.servers.findIndex((s) => s.id === id);
      if (index === -1) return null;
      state.servers[index] = {
        ...state.servers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeState(state);
      return state.servers[index];
    },
  },

  // Projects
  projects: {
    async list(): Promise<ProjectModel[]> {
      const state = readState();
      return state.projects.map((proj) => {
        const projDeployments = state.deployments.filter((d) => d.projectId === proj.id);
        const projDomains = state.domains.filter((dm) => dm.projectId === proj.id);
        return {
          ...proj,
          deployments: projDeployments,
          domains: projDomains,
        };
      });
    },
    async findById(id: string): Promise<ProjectModel | null> {
      const state = readState();
      const proj = state.projects.find((p) => p.id === id);
      if (!proj) return null;
      const deployments = state.deployments.filter((d) => d.projectId === id);
      const domains = state.domains.filter((dm) => dm.projectId === id);
      return { ...proj, deployments, domains };
    },
    async findBySlug(slug: string): Promise<ProjectModel | null> {
      const state = readState();
      const proj = state.projects.find((p) => p.slug === slug);
      if (!proj) return null;
      const deployments = state.deployments.filter((d) => d.projectId === proj.id);
      const domains = state.domains.filter((dm) => dm.projectId === proj.id);
      return { ...proj, deployments, domains };
    },
    async create(data: Omit<ProjectModel, "id" | "createdAt" | "updatedAt">): Promise<ProjectModel> {
      const state = readState();
      const project: ProjectModel = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.projects.push(project);
      writeState(state);
      return project;
    },
    async update(id: string, updates: Partial<ProjectModel>): Promise<ProjectModel | null> {
      const state = readState();
      const index = state.projects.findIndex((p) => p.id === id);
      if (index === -1) return null;
      state.projects[index] = {
        ...state.projects[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeState(state);
      return state.projects[index];
    },
    async delete(id: string): Promise<boolean> {
      const state = readState();
      state.projects = state.projects.filter((p) => p.id !== id);
      state.deployments = state.deployments.filter((d) => d.projectId !== id);
      state.domains = state.domains.filter((dm) => dm.projectId !== id);
      writeState(state);
      return true;
    },
  },

  // Deployments
  deployments: {
    async list(limit = 50): Promise<DeploymentModel[]> {
      const state = readState();
      const list = [...state.deployments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return list.slice(0, limit);
    },
    async findById(id: string): Promise<DeploymentModel | null> {
      const state = readState();
      return state.deployments.find((d) => d.id === id) || null;
    },
    async findByProjectId(projectId: string): Promise<DeploymentModel[]> {
      const state = readState();
      return state.deployments
        .filter((d) => d.projectId === projectId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async create(
      data: Omit<DeploymentModel, "id" | "createdAt" | "updatedAt" | "durationMs"> & { durationMs?: number }
    ): Promise<DeploymentModel> {
      const state = readState();
      const deployment: DeploymentModel = {
        id: crypto.randomUUID(),
        durationMs: 0,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.deployments.push(deployment);
      writeState(state);
      return deployment;
    },
    async update(id: string, updates: Partial<DeploymentModel>): Promise<DeploymentModel | null> {
      const state = readState();
      const index = state.deployments.findIndex((d) => d.id === id);
      if (index === -1) return null;
      state.deployments[index] = {
        ...state.deployments[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeState(state);
      return state.deployments[index];
    },
  },

  // Domains
  domains: {
    async listByProjectId(projectId: string): Promise<DomainModel[]> {
      const state = readState();
      return state.domains.filter((d) => d.projectId === projectId);
    },
    async create(data: Omit<DomainModel, "id" | "createdAt" | "updatedAt">): Promise<DomainModel> {
      const state = readState();
      const domain: DomainModel = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.domains.push(domain);
      writeState(state);
      return domain;
    },
    async delete(id: string): Promise<boolean> {
      const state = readState();
      state.domains = state.domains.filter((d) => d.id !== id);
      writeState(state);
      return true;
    },
  },

  // Activity Logs
  activityLogs: {
    async list(limit = 100): Promise<ActivityLogModel[]> {
      const state = readState();
      return [...state.activityLogs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },
    async create(data: Omit<ActivityLogModel, "id" | "createdAt">): Promise<ActivityLogModel> {
      const state = readState();
      const log: ActivityLogModel = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      state.activityLogs.push(log);
      writeState(state);
      return log;
    },
  },

  // System Settings
  settings: {
    async get(key: string): Promise<string | null> {
      const state = readState();
      return state.settings[key] || null;
    },
    async set(key: string, value: string): Promise<void> {
      const state = readState();
      state.settings[key] = value;
      writeState(state);
    },
  },
};
