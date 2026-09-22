"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Cluster Audit Trail</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cryptographic ledger of deployments, container state changes, and administrative actions
          </p>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search audit actions, emails, or IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs font-mono"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
          >
            <option value="ALL">All Entities</option>
            <option value="PROJECT">Projects</option>
            <option value="DEPLOYMENT">Deployments</option>
            <option value="SERVER">Servers / Nodes</option>
            <option value="AUTH">Authentication</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-mono">
          Showing {filtered.length} of {logs.length} logged events
        </div>
      </div>

      {/* Audit Log Timeline Card */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">
            No audit records found matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900 text-xs font-mono">
            {filtered.map((log) => {
              const isExpanded = expandedIds.has(log.id);
              const isError = log.action.includes("FAIL") || log.action.includes("DELETED");
              const isSuccess = log.action.includes("SUCCESS") || log.action.includes("INITIALIZED");

              return (
                <div key={log.id} className="p-4 hover:bg-zinc-900/30 transition-colors">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <button className="text-zinc-500 hover:text-white transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Badge
                        variant={isError ? "destructive" : isSuccess ? "cyan" : "outline"}
                        className="text-[10px] py-0"
                      >
                        {log.action}
                      </Badge>

                      <span className="text-white font-medium">
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
                      <pre className="p-3.5 bg-black/90 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto leading-relaxed select-text">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
