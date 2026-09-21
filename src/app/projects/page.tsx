"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  FolderGit2,
  GitBranch,
  ExternalLink,
  Plus,
  Search,
  Server,
  Activity,
  ArrowRight,
  Radio,
} from "lucide-react";
import { ProjectModel } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

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
    const interval = setInterval(fetchProjects, 4000);
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
      {/* Top Bar: Search, Filters & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects or repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">Running</option>
            <option value="BUILDING">Building</option>
            <option value="FAILED">Failed</option>
            <option value="IDLE">Idle</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800/80 rounded-lg">
          <FolderGit2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-200">No projects found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first application project from any Git repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const isRunning = project.status === "RUNNING";
            const isBuilding = project.status === "BUILDING" || project.status === "DEPLOYING";
            const isFailed = project.status === "FAILED";

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group p-5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Status & AppType Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRunning
                            ? "bg-emerald-500"
                            : isBuilding
                            ? "bg-amber-400 animate-pulse"
                            : isFailed
                            ? "bg-red-500"
                            : "bg-zinc-600"
                        }`}
                      ></span>
                      <span className="text-[11px] font-mono font-medium text-zinc-300">
                        {project.status}
                      </span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                      {project.appType}
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{project.slug}</p>

                  {/* Repo & Branch info */}
                  <div className="mt-4 space-y-1.5 text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <FolderGit2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{project.repoUrl}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{project.branch}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Server className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span>{project.serverName || "Local Node"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer / Live Link */}
                <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between">
                  {project.liveUrl ? (
                    <span className="text-[11px] text-emerald-400 font-mono truncate max-w-[200px]">
                      {project.liveUrl}
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-600 font-mono">Not deployed</span>
                  )}

                  <span className="text-zinc-500 group-hover:text-zinc-200 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
