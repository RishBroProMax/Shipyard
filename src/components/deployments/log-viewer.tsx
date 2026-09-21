"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download, Search, Check, RefreshCw } from "lucide-react";

interface LogViewerProps {
  deploymentId: string;
  initialLogs?: string;
  isLive?: boolean;
}

export function LogViewer({ deploymentId, initialLogs = "", isLive = false }: LogViewerProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Connect to SSE stream if live
  useEffect(() => {
    if (!deploymentId) return;

    // Load initial logs
    fetch(`/api/deployments/${deploymentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.deployment?.buildLogs) {
          setLogs(data.deployment.buildLogs);
        }
      })
      .catch(() => {});

    if (!isLive) return;

    const eventSource = new EventSource(`/api/deployments/${deploymentId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.log) {
          setLogs((prev) => prev + data.log);
        }
      } catch {
        setLogs((prev) => prev + event.data + "\n");
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [deploymentId, isLive]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-${deploymentId.substring(0, 8)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = logs.split("\n");
  const filteredLines = search
    ? lines.filter((line) => line.toLowerCase().includes(search.toLowerCase()))
    : lines;

  return (
    <div className="flex flex-col h-full border border-zinc-800 rounded-lg overflow-hidden bg-black">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[11px]">Console Stream</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono w-44"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-zinc-400 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-0"
            />
            <span>Auto-scroll</span>
          </label>

          <button
            onClick={handleCopy}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            title="Download log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={containerRef}
        className="flex-1 p-4 font-mono text-xs text-zinc-300 overflow-y-auto space-y-1 select-text leading-relaxed"
      >
        {filteredLines.length === 0 || (filteredLines.length === 1 && !filteredLines[0]) ? (
          <div className="text-zinc-600 italic">No output received yet...</div>
        ) : (
          filteredLines.map((line, idx) => {
            let colorClass = "text-zinc-300";
            if (line.includes("FAILED") || line.includes("error") || line.includes("Error")) {
              colorClass = "text-red-400";
            } else if (line.includes("succeeded") || line.includes("LIVE") || line.includes("OK")) {
              colorClass = "text-emerald-400";
            } else if (line.includes("Starting") || line.includes("Step")) {
              colorClass = "text-cyan-400";
            } else if (line.includes("Reserved") || line.includes("Buildpack")) {
              colorClass = "text-amber-300";
            }

            return (
              <div key={idx} className={`${colorClass} whitespace-pre-wrap break-all`}>
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
