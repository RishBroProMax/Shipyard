"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Activity, Search, ShieldCheck, User, Clock, Terminal, ChevronDown, ChevronRight } from "lucide-react";
import { ActivityLogModel } from "@/types";

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLogModel[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.activity || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      (log.entityId && log.entityId.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "ALL" || log.entityType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AppShell title="Audit Activity Log">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit actions or users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
          >
            <option value="ALL">All Entities</option>
            <option value="PROJECT">Projects</option>
            <option value="DEPLOYMENT">Deployments</option>
            <option value="SERVER">Servers / Nodes</option>
            <option value="AUTH">Authentication</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            No audit logs recorded matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900 text-xs font-mono">
            {filtered.map((log) => {
              const isExpanded = expandedIds.has(log.id);

              return (
                <div key={log.id} className="p-4 hover:bg-zinc-900/30 transition-colors">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-zinc-500 hover:text-zinc-300">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action.includes("FAIL") || log.action.includes("DELETED")
                            ? "bg-red-950 text-red-400 border border-red-800/60"
                            : log.action.includes("SUCCESS") || log.action.includes("INITIALIZED")
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                            : "bg-zinc-900 text-zinc-300 border border-zinc-800"
                        }`}
                      >
                        {log.action}
                      </span>

                      <span className="text-zinc-300 font-medium">
                        {log.userEmail || "System Daemon"}
                      </span>

                      <span className="text-zinc-600">•</span>

                      <span className="text-zinc-500 text-[11px]">{log.entityType}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Expandable JSON details */}
                  {isExpanded && log.details && (
                    <div className="mt-3 pt-3 border-t border-zinc-900 pl-6">
                      <pre className="p-3 bg-black/80 rounded border border-zinc-850 text-[11px] text-zinc-400 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
