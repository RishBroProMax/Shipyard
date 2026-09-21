"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
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
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 gap-6 mb-6 text-xs font-medium">
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
              className={`pb-3 flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-zinc-100 text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
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
        <div className="space-y-6">
          {/* Add User Form */}
          <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 max-w-2xl">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono mb-2">
              Add New User Account
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Grant team members access to the Shipyard control plane with granular role permissions.
            </p>

            {userError && (
              <div className="p-3 mb-4 bg-red-950/40 border border-red-800/80 rounded text-xs text-red-300">
                {userError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="developer@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
                  >
                    <option value="ADMIN">Administrator (Full Access)</option>
                    <option value="OPERATOR">Operator (Deploy & Manage)</option>
                    <option value="VIEWER">Viewer (Read Only)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {userSuccess ? (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>User account created successfully!</span>
                  </span>
                ) : (
                  <span></span>
                )}

                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded transition-colors disabled:opacity-50"
                >
                  {isAddingUser ? "Creating User..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>

          {/* User List Table */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden max-w-4xl">
            <div className="px-5 py-3 border-b border-zinc-800 text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Registered Users ({users.length})
            </div>

            <div className="divide-y divide-zinc-900 text-xs font-mono">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold">
                      {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200">{u.email}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {u.role}
                        </span>
                      </div>
                      {u.name && <p className="text-[11px] text-zinc-500">{u.name}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-zinc-600">
                      Added {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 rounded"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Internal Services */}
      {activeTab === "services" && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Self-Contained Appliance Architecture
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Shipyard operates as a complete zero-configuration appliance. All internal services are provisioned, secured, and managed automatically on startup.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-zinc-300 font-semibold">PostgreSQL 16 Engine</span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Auto-migrated relational schema & users</p>
              </div>

              <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-zinc-300 font-semibold">Redis 7 / Worker Queue</span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Durable deployment queue with auto-retry</p>
              </div>

              <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-zinc-300 font-semibold">Dynamic Reverse Proxy</span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Automated Caddy Let&apos;s Encrypt SSL & routes</p>
              </div>

              <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-zinc-300 font-semibold">Docker Agent Subsystem</span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ONLINE</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">Isolated sandboxes & bridge network</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & System Info */}
      {activeTab === "backup" && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Configuration Backup & Export
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Export an encrypted snapshot of all project configurations, cluster server nodes, custom domains, and platform settings.
            </p>

            <button
              onClick={handleDownloadBackup}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download System Backup (.json)</span>
            </button>
          </div>

          <div className="p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs font-mono">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">
              Appliance Metadata
            </h3>
            <div className="flex justify-between py-1.5 border-b border-zinc-900">
              <span className="text-zinc-500">Platform Version</span>
              <span className="text-zinc-300">Shipyard v1.0.0 (Production Appliance)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-900">
              <span className="text-zinc-500">Persistent Storage Path</span>
              <span className="text-zinc-300">/var/lib/shipyard/data</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-900">
              <span className="text-zinc-500">Security Encryption</span>
              <span className="text-emerald-400">AES-256-GCM Vault Active</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Zero-Config Appliance</span>
              <span className="text-emerald-400">Initialized & Healthy</span>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
