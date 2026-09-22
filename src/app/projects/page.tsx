"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderGit2,
  GitBranch,
  ExternalLink,
  Plus,
  Search,
  Server,
  ArrowRight,
  Rocket,
  Sparkles,
  Box,
} from "lucide-react";
import { ProjectModel } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [starterTemplate, setStarterTemplate] = useState<string | undefined>(undefined);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 3500);
    return () => clearInterval(interval);
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.repoUrl.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell title="Projects">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Projects & Services</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage containerized workloads, custom domains, and zero-downtime deployments
          </p>
        </div>

        <Button
          size="sm"
          variant="default"
          onClick={() => {
            setStarterTemplate(undefined);
            setIsModalOpen(true);
          }}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search projects, repositories, or slugs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="BUILDING">Building</option>
            <option value="STOPPED">Stopped</option>
            <option value="FAILED">Failed</option>
            <option value="IDLE">Idle</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          Showing {filtered.length} of {projects.length} project{projects.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Empty State with Starter Templates */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <FolderGit2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No projects found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
            Deploy in seconds by selecting one of the popular starter frameworks or importing your GitHub repository.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 max-w-3xl mx-auto text-left">
            {[
              {
                id: "static-landing",
                name: "Modern Static HTML",
                type: "STATIC",
                desc: "Edge-routed HTML5 & CSS3 with zero config.",
              },
              {
                id: "express-api",
                name: "Node.js Express",
                type: "NODEJS",
                desc: "REST API with /api/health and /api/stats.",
              },
              {
                id: "python-fastapi",
                name: "Python FastAPI",
                type: "PYTHON",
                desc: "Async Python service with Swagger docs.",
              },
              {
                id: "nextjs-app",
                name: "Next.js 14 App",
                type: "NODEJS",
                desc: "React 18 SSR App Router with standalone output.",
              },
            ].map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  setStarterTemplate(tmpl.id);
                  setIsModalOpen(true);
                }}
                className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-cyan-500/50 hover:bg-zinc-900 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {tmpl.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono py-0">
                      {tmpl.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{tmpl.desc}</p>
                </div>
                <span className="text-[11px] text-cyan-400 font-mono mt-3 block">Deploy →</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setStarterTemplate(undefined);
                setIsModalOpen(true);
              }}
            >
              Custom Git Repository
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const isRunning = project.status === "RUNNING";
            const isBuilding = project.status === "BUILDING" || project.status === "DEPLOYING";
            const isFailed = project.status === "FAILED";
            const isStopped = project.status === "STOPPED";

            return (
              <Card
                key={project.id}
                className="p-5 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Status & AppType Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isRunning
                            ? "bg-emerald-400"
                            : isBuilding
                            ? "bg-amber-400 animate-pulse"
                            : isFailed
                            ? "bg-red-400"
                            : isStopped
                            ? "bg-zinc-500"
                            : "bg-zinc-600"
                        }`}
                      ></span>
                      <span className="text-[11px] font-mono font-medium text-zinc-300">
                        {project.status}
                      </span>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-mono">
                      {project.appType}
                    </Badge>
                  </div>

                  {/* Title & Slug */}
                  <Link href={`/projects/${project.id}`}>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{project.slug}</p>
                  </Link>

                  {/* Info Row */}
                  <div className="mt-4 space-y-1.5 text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-1.5 truncate text-zinc-400">
                      <FolderGit2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{project.repoUrl}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{project.branch}</span>
                    </div>
                    {project.allocatedPort && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Box className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>Port: {project.allocatedPort}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Server className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>{project.serverName || "Local Node"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer / Live Link */}
                <div className="mt-5 pt-3.5 border-t border-zinc-850 flex items-center justify-between">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono truncate max-w-[200px]"
                    >
                      <span className="truncate">{project.liveUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-zinc-600 font-mono">Not deployed</span>
                  )}

                  <Link
                    href={`/projects/${project.id}`}
                    className="p-1 text-zinc-500 group-hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        initialTemplate={starterTemplate}
        onClose={() => {
          setIsModalOpen(false);
          setStarterTemplate(undefined);
        }}
        onCreated={() => {
          fetchProjects();
        }}
      />
    </AppShell>
  );
}
