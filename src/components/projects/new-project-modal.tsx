"use client";

import { useState, useEffect } from "react";
import { X, FolderGit2, Plus, Trash2, Cpu, Rocket, FileCode, Upload } from "lucide-react";
import { BuildpackType, ServerModel } from "@/types";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: any) => void;
}

export function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const [sourceType, setSourceType] = useState<"git" | "browser">("git");
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [appType, setAppType] = useState<BuildpackType>("AUTO");
  const [targetPort, setTargetPort] = useState(3000);
  const [serverId, setServerId] = useState("");
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [envPairs, setEnvPairs] = useState<{ key: string; value: string }[]>([
    { key: "NODE_ENV", value: "production" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/servers")
        .then((res) => res.json())
        .then((data) => {
          if (data.servers) {
            setServers(data.servers);
            if (data.servers.length > 0 && !serverId) {
              setServerId(data.servers[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddEnv = () => {
    setEnvPairs([...envPairs, { key: "", value: "" }]);
  };

  const handleRemoveEnv = (index: number) => {
    setEnvPairs(envPairs.filter((_, i) => i !== index));
  };

  const handleEnvChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...envPairs];
    updated[index][field] = val;
    setEnvPairs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (sourceType === "git" && !repoUrl.trim()) {
      setError("Git repository URL is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const envVars: Record<string, string> = {};
      for (const pair of envPairs) {
        if (pair.key.trim()) {
          envVars[pair.key.trim()] = pair.value;
        }
      }

      const finalRepoUrl = sourceType === "browser" ? "in-browser" : repoUrl.trim();
      const finalAppType = sourceType === "browser" ? "STATIC" : appType;
      const finalPort = sourceType === "browser" ? 80 : Number(targetPort) || 3000;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          repoUrl: finalRepoUrl,
          branch: branch.trim() || "main",
          appType: finalAppType,
          targetPort: finalPort,
          serverId: serverId || undefined,
          autoDeploy,
          envVars,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      onCreated(data.project);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0e0e11] border border-zinc-800 rounded-lg max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-200">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Create New Project</h2>
              <p className="text-[11px] text-zinc-400">
                Deploy from a Git repository or create with in-browser HTML/CSS/JS files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Selector: Git vs In-Browser / Upload */}
        <div className="px-6 pt-4 pb-1">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Project Source</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSourceType("git")}
              className={`p-3 rounded border text-left flex items-start gap-3 transition-colors ${
                sourceType === "git"
                  ? "bg-zinc-900 border-zinc-600 text-zinc-100 shadow-sm"
                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750"
              }`}
            >
              <FolderGit2 className="w-4 h-4 mt-0.5 text-zinc-300 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">Git Repository</span>
                <span className="text-[10px] text-zinc-500">GitHub, GitLab, or Git URL</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType("browser")}
              className={`p-3 rounded border text-left flex items-start gap-3 transition-colors ${
                sourceType === "browser"
                  ? "bg-zinc-900 border-zinc-600 text-zinc-100 shadow-sm"
                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750"
              }`}
            >
              <FileCode className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">Web Files / Editor</span>
                <span className="text-[10px] text-zinc-500">HTML, CSS, JS with in-browser editor</span>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. my-web-app or landing-page"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            />
          </div>

          {/* Git Source Options */}
          {sourceType === "git" ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Git Repository URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/user/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200">
              <div className="flex items-center gap-2 font-semibold">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>In-Browser Project Ready</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Shipyard will initialize your project with starter HTML, CSS, and JS files. You can upload additional files and edit them anytime using the built-in File Editor!
              </p>
            </div>
          )}

          {/* Buildpack & Target Port for Git */}
          {sourceType === "git" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Buildpack</label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value as BuildpackType)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
                >
                  <option value="AUTO">Auto-Detect Buildpack</option>
                  <option value="DOCKERFILE">Dockerfile</option>
                  <option value="NODEJS">Node.js / Next.js</option>
                  <option value="PYTHON">Python (FastAPI / Flask)</option>
                  <option value="STATIC">Static HTML / SPA</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Container Port</label>
                <input
                  type="number"
                  value={targetPort}
                  onChange={(e) => setTargetPort(parseInt(e.target.value, 10) || 3000)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>
            </div>
          )}

          {/* Target Cluster Node */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Target Node (Cluster)
            </label>
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            >
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.host}) - {s.status}
                </option>
              ))}
            </select>
          </div>

          {/* Environment Variables */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Environment Variables (AES-256 Encrypted)
              </label>
              <button
                type="button"
                onClick={handleAddEnv}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono"
              >
                <Plus className="w-3 h-3" /> Add Variable
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {envPairs.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="KEY"
                    value={pair.key}
                    onChange={(e) => handleEnvChange(idx, "key", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="VALUE"
                    value={pair.value}
                    onChange={(e) => handleEnvChange(idx, "value", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEnv(idx)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Deploy Toggle */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="autoDeploy"
              checked={autoDeploy}
              onChange={(e) => setAutoDeploy(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-0"
            />
            <label htmlFor="autoDeploy" className="text-xs text-zinc-300 cursor-pointer">
              Deploy immediately upon project creation
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Creating Project..." : "Deploy Project"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
