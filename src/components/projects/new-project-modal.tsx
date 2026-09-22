"use client";

import { useState, useEffect } from "react";
import { X, FolderGit2, Plus, Trash2, Cpu, Rocket, FileCode, Upload, Layers, Server, Globe, Shield, Sparkles } from "lucide-react";
import { BuildpackType, ServerModel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { STARTER_TEMPLATES } from "@/lib/templates";

interface NewProjectModalProps {
  isOpen: boolean;
  initialTemplate?: string;
  onClose: () => void;
  onCreated: (project: any) => void;
}

export function NewProjectModal({
  isOpen,
  initialTemplate,
  onClose,
  onCreated,
}: NewProjectModalProps) {
  const [sourceType, setSourceType] = useState<"template" | "git" | "browser">(
    initialTemplate ? "template" : "template"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    initialTemplate || "static-landing"
  );
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
    if (initialTemplate) {
      setSourceType("template");
      setSelectedTemplate(initialTemplate);
      const tmpl = STARTER_TEMPLATES[initialTemplate];
      if (tmpl) {
        setName(`my-${tmpl.id}`);
        setTargetPort(tmpl.targetPort);
        setAppType(tmpl.appType as any);
      }
    } else if (!name) {
      setName("my-new-app");
    }
  }, [initialTemplate, isOpen]);

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

  const handleTemplateSelect = (tmplId: string) => {
    setSelectedTemplate(tmplId);
    const tmpl = STARTER_TEMPLATES[tmplId];
    if (tmpl) {
      setName(`my-${tmpl.id}`);
      setTargetPort(tmpl.targetPort);
      setAppType(tmpl.appType as any);
    }
  };

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

      let payload: any = {
        name: name.trim(),
        branch: branch.trim() || "main",
        targetPort: Number(targetPort) || 3000,
        serverId: serverId || undefined,
        autoDeploy,
        envVars,
      };

      if (sourceType === "template") {
        payload.template = selectedTemplate;
        payload.repoUrl = `template://${selectedTemplate}`;
        const tmpl = STARTER_TEMPLATES[selectedTemplate];
        payload.appType = tmpl?.appType || "STATIC";
        payload.targetPort = tmpl?.targetPort || 80;
      } else if (sourceType === "browser") {
        payload.repoUrl = "in-browser";
        payload.appType = "STATIC";
        payload.targetPort = 80;
      } else {
        payload.repoUrl = repoUrl.trim();
        payload.appType = appType;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0b0c10] border border-zinc-800/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-cyan-400 shadow-inner">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Deploy New Project</h2>
                <Badge variant="cyan" className="text-[10px] py-0 px-2 font-mono">
                  Vercel Lite
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">
                1-click starter templates, external Git import, or in-browser web editor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800/80 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Mode Tabs (Pill style) */}
        <div className="px-6 pt-5 pb-2">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono mb-2">
            Deployment Source
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setSourceType("template")}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                sourceType === "template"
                  ? "bg-zinc-900 border-cyan-500/50 text-white shadow-md ring-1 ring-cyan-500/30"
                  : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <Sparkles className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">1-Click Starter</span>
                <span className="text-[10px] text-zinc-500">FastAPI, Next.js, Express, Static</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType("git")}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                sourceType === "git"
                  ? "bg-zinc-900 border-cyan-500/50 text-white shadow-md ring-1 ring-cyan-500/30"
                  : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <FolderGit2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">Git Repository</span>
                <span className="text-[10px] text-zinc-500">GitHub, GitLab, or any Git URL</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType("browser")}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                sourceType === "browser"
                  ? "bg-zinc-900 border-cyan-500/50 text-white shadow-md ring-1 ring-cyan-500/30"
                  : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <FileCode className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">Web File Editor</span>
                <span className="text-[10px] text-zinc-500">Live HTML/CSS/JS in browser</span>
              </div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 pt-3">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 font-mono">
              {error}
            </div>
          )}

          {/* If Template Mode: Starter Carousel */}
          {sourceType === "template" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
                Select Starter Architecture:
              </label>
              <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {Object.values(STARTER_TEMPLATES).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedTemplate === t.id
                        ? "bg-zinc-900 border-cyan-500/70 text-white shadow-sm ring-1 ring-cyan-500/40"
                        : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-750 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{t.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400">
                        {t.appType}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Project Name</label>
            <Input
              type="text"
              required
              placeholder="e.g. cloud-api or dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {/* Git Source Options */}
          {sourceType === "git" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Git Repository URL
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="https://github.com/user/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Branch</label>
                  <Input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Buildpack Strategy
                  </label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value as BuildpackType)}
                    className="w-full h-10 px-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  >
                    <option value="AUTO">Auto-Detect Buildpack</option>
                    <option value="DOCKERFILE">Dockerfile</option>
                    <option value="NODEJS">Node.js / Next.js</option>
                    <option value="PYTHON">Python (FastAPI / Flask)</option>
                    <option value="STATIC">Static HTML / SPA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Target Container Port
                  </label>
                  <Input
                    type="number"
                    value={targetPort}
                    onChange={(e) => setTargetPort(parseInt(e.target.value, 10) || 3000)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {sourceType === "browser" && (
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200">
              <div className="flex items-center gap-2 font-semibold">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Zero-Setup In-Browser Web Workspace</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Shipyard will initialize starter index.html, style.css, and script.js files. You can live-edit them directly in the browser with real-time reload.
              </p>
            </div>
          )}

          {/* Node Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Execution Target (Cluster Node)
            </label>
            <select
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
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
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <label className="text-xs font-medium text-zinc-300">
                  Environment Variables (AES-256-GCM Encrypted)
                </label>
              </div>
              <button
                type="button"
                onClick={handleAddEnv}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Variable
              </button>
            </div>
            <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
              {envPairs.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="KEY"
                    value={pair.key}
                    onChange={(e) => handleEnvChange(idx, "key", e.target.value)}
                    className="flex-1 font-mono text-xs h-8"
                  />
                  <Input
                    type="text"
                    placeholder="VALUE"
                    value={pair.value}
                    onChange={(e) => handleEnvChange(idx, "value", e.target.value)}
                    className="flex-1 font-mono text-xs h-8"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveEnv(idx)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Deploy Toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="autoDeployModal"
              checked={autoDeploy}
              onChange={(e) => setAutoDeploy(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="autoDeployModal" className="text-xs text-zinc-300 cursor-pointer font-medium">
              Deploy container immediately upon creation
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="gap-2"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Orchestrating..." : "Deploy Application"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
