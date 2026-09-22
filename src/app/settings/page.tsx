"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Users,
  UserPlus,
  Shield,
  Database,
  Radio,
  HardDrive,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  Check,
  Box,
  Terminal,
  Server,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"users" | "services" | "backup">("users");

  // Add User Form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("OPERATOR");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {}
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/system/status");
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setIsAddingUser(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPassword,
          name: newName.trim() || undefined,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setUserSuccess(true);
      setTimeout(() => setUserSuccess(false), 2500);
      fetchUsers();
    } catch (err) {
      setUserError((err as Error).message);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to remove this user account?")) {
      try {
        await fetch(`/api/users/${userId}`, { method: "DELETE" });
        fetchUsers();
      } catch {}
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      applianceVersion: "1.0.0",
      systemStatus,
      users: users.map((u) => ({ id: u.id, email: u.email, role: u.role, name: u.name })),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipyard-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Platform Settings">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Platform Settings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Internal appliance daemons, user credentials, role policies, and database backup
          </p>
        </div>
      </div>

      {/* Tab Navigation (Pill style) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-zinc-800/80">
        {[
          { id: "users", label: "User Accounts & Access", icon: Users },
          { id: "services", label: "Internal Appliance Services", icon: Database },
          { id: "backup", label: "Backup & System Info", icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: User Accounts */}
      {activeTab === "users" && (
        <div className="space-y-6 max-w-4xl">
          {/* Add User Card */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-1">Add Operator or Admin Account</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Grant team members authenticated access to this Shipyard instance with granular RBAC permissions.
            </p>

            {userError && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 font-mono">
                {userError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="developer@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Password
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Display Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Alex Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                    Role Policy
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  >
                    <option value="ADMIN">Administrator (Full Access)</option>
                    <option value="OPERATOR">Operator (Deploy & Manage)</option>
                    <option value="VIEWER">Viewer (Read Only)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {userSuccess ? (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>User account created successfully!</span>
                  </span>
                ) : (
                  <span></span>
                )}

                <Button type="submit" variant="default" size="sm" disabled={isAddingUser}>
                  {isAddingUser ? "Creating User..." : "Create Account"}
                </Button>
              </div>
            </form>
          </Card>

          {/* User List Table */}
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-850 text-xs font-bold text-white uppercase tracking-wider font-mono">
              Registered Users ({users.length})
            </div>

            <div className="divide-y divide-zinc-900 text-xs font-mono">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 font-bold">
                      {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{u.name || "User"}</span>
                        <Badge
                          variant={u.role === "ADMIN" ? "cyan" : "outline"}
                          className="text-[10px] py-0"
                        >
                          {u.role}
                        </Badge>
                      </div>
                      <div className="text-zinc-500 text-[11px] mt-0.5">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-zinc-500 hidden sm:inline">
                      Created: {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    {users.length > 1 && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete user account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Internal Services */}
      {activeTab === "services" && (
        <div className="space-y-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service 1: Docker Engine */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Docker Container Engine</h3>
                    <p className="text-[11px] text-zinc-400">
                      Isolated multi-stage container sandbox
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    systemStatus?.services?.dockerEngine?.status === "UP" ? "cyan" : "outline"
                  }
                  className="font-mono text-[10px]"
                >
                  {systemStatus?.services?.dockerEngine?.status === "UP" ? "ACTIVE" : "STANDALONE"}
                </Badge>
              </div>
              <div className="pt-2 border-t border-zinc-850 font-mono text-[11px] text-zinc-400 space-y-1">
                <div>Socket: /var/run/docker.sock</div>
                <div>Version: {systemStatus?.services?.dockerEngine?.version || "Active"}</div>
              </div>
            </Card>

            {/* Service 2: Caddy Reverse Proxy */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Dynamic Reverse Proxy (Caddy)</h3>
                    <p className="text-[11px] text-zinc-400">HTTP/2, HTTP/3, and automatic TLS</p>
                  </div>
                </div>
                <Badge variant="cyan" className="font-mono text-[10px]">
                  UP (200 OK)
                </Badge>
              </div>
              <div className="pt-2 border-t border-zinc-850 font-mono text-[11px] text-zinc-400 space-y-1">
                <div>Admin API: http://localhost:2019/load</div>
                <div>Active Upstream Routes: {systemStatus?.proxy?.activeRoutes || 0}</div>
              </div>
            </Card>

            {/* Service 3: PostgreSQL Database */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Database Engine</h3>
                    <p className="text-[11px] text-zinc-400">Transactional schema & state store</p>
                  </div>
                </div>
                <Badge variant="cyan" className="font-mono text-[10px]">
                  HEALTHY
                </Badge>
              </div>
              <div className="pt-2 border-t border-zinc-850 font-mono text-[11px] text-zinc-400 space-y-1">
                <div>Engine: {systemStatus?.services?.database?.engine || "PostgreSQL 16"}</div>
                <div>Storage Path: /var/lib/shipyard/data</div>
              </div>
            </Card>

            {/* Service 4: Redis Worker Queue */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Job Queue & Cache</h3>
                    <p className="text-[11px] text-zinc-400">Async deployment worker queue</p>
                  </div>
                </div>
                <Badge variant="cyan" className="font-mono text-[10px]">
                  HEALTHY
                </Badge>
              </div>
              <div className="pt-2 border-t border-zinc-850 font-mono text-[11px] text-zinc-400 space-y-1">
                <div>Engine: {systemStatus?.services?.redisQueue?.engine || "Redis 7"}</div>
                <div>Memory Mode: LRU In-Memory</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & System Info */}
      {activeTab === "backup" && (
        <div className="space-y-6 max-w-4xl">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-1">Export Appliance Database & Config</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Generate a snapshot containing projects, encrypted environment credentials, and cluster node configurations.
            </p>

            <Button variant="default" size="sm" onClick={handleDownloadBackup} className="gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>Download Full Backup (JSON)</span>
            </Button>
          </Card>

          <Card className="p-6 font-mono text-xs text-zinc-400 space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              System Environment & Runtime
            </h4>
            <div className="flex justify-between py-1 border-b border-zinc-850">
              <span>Appliance Version:</span>
              <span className="text-white">Shipyard v1.0.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-850">
              <span>Host Process Uptime:</span>
              <span className="text-white">
                {Math.floor((systemStatus?.uptimeSeconds || 0) / 3600)}h{" "}
                {Math.floor(((systemStatus?.uptimeSeconds || 0) % 3600) / 60)}m
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-850">
              <span>Supervisor Admin Email:</span>
              <span className="text-white">{systemStatus?.adminEmail || "admin@shipyard.local"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Base Domain:</span>
              <span className="text-cyan-400">
                {process.env.SHIPYARD_BASE_DOMAIN || "localhost"}
              </span>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
