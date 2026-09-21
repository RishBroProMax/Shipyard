"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Terminal, Server, Shield, Radio } from "lucide-react";

interface ConnectNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeAdded?: () => void;
}

export function ConnectNodeModal({ isOpen, onClose, onNodeAdded }: ConnectNodeModalProps) {
  const [token, setToken] = useState("");
  const [leaderUrl, setLeaderUrl] = useState("http://localhost:3000");
  const [nodeName, setNodeName] = useState("");
  const [activeTab, setActiveTab] = useState<"curl" | "docker" | "node">("curl");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectedNode, setConnectedNode] = useState<string | null>(null);

  // Initialize leader URL and get a secure token
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLeaderUrl(window.location.origin);
    }

    if (isOpen) {
      setIsGenerating(true);
      fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nodeName || undefined }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            setToken(data.token);
          }
        })
        .catch(() => {})
        .finally(() => setIsGenerating(false));
    }
  }, [isOpen]);

  // Poll for newly registered nodes
  useEffect(() => {
    if (!isOpen || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/servers");
        if (res.ok) {
          const data = await res.json();
          const found = data.servers?.find((s: any) => s.token === token && s.status === "ONLINE");
          if (found) {
            setConnectedNode(found.name);
            if (onNodeAdded) onNodeAdded();
          }
        }
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, token, onNodeAdded]);

  if (!isOpen) return null;

  const curlCommand = `curl -fsSL ${leaderUrl}/agent_install | bash -s -- --token ${token}${nodeName ? ` --name "${nodeName}"` : ""}`;

  const dockerCommand = `docker run -d \\
  --name shipyard-agent \\
  --restart always \\
  --net host \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e SHIPYARD_LEADER_URL=${leaderUrl} \\
  -e SHIPYARD_AGENT_TOKEN=${token} \\
  -e SHIPYARD_NODE_NAME="${nodeName || "worker-node"}" \\
  node:20-alpine sh -c "curl -fsSL ${leaderUrl}/agent_install | bash -s -- --token ${token}"`;

  const nodeCommand = `curl -fsSL ${leaderUrl}/agent_install | bash -s -- --token ${token}`;

  const currentCommand =
    activeTab === "curl" ? curlCommand : activeTab === "docker" ? dockerCommand : nodeCommand;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0e0e11] border border-zinc-800 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-200">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Connect Worker Node</h2>
              <p className="text-[11px] text-zinc-400">
                Run this command on any remote VPS, server, or PC to join the cluster
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Node Name input */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Node Identifier (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. vps-hetzner-frankfurt or home-server-01"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 font-mono"
            />
          </div>

          {/* Tab Selector: cURL / Docker / Node */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTab("curl")}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === "curl"
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Linux Shell (cURL)
            </button>
            <button
              onClick={() => setActiveTab("docker")}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === "docker"
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Docker Container
            </button>
            <button
              onClick={() => setActiveTab("node")}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                activeTab === "node"
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Node.js Standalone
            </button>
          </div>

          {/* Command Display */}
          <div className="relative group">
            <div className="bg-black/90 border border-zinc-800 rounded-md p-4 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed selection:bg-zinc-800">
              {isGenerating ? "Generating cryptographic node token..." : currentCommand}
            </div>
            <button
              onClick={handleCopy}
              disabled={isGenerating || !token}
              className="absolute top-3 right-3 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Security & Architecture Note */}
          <div className="flex items-start gap-2.5 p-3 rounded bg-zinc-900/50 border border-zinc-800/80 text-[11px] text-zinc-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-300">Super Zero-Trust Architecture</p>
              <p className="mt-0.5">
                The agent communicates outbound via HTTPS/WSS to this leader. It reports real-time CPU, RAM, and Network stats every 3s and executes container builds inside isolated Docker sandboxes. Untrusted code never touches this control plane.
              </p>
            </div>
          </div>

          {/* Connection Listener Pulse */}
          <div className="flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-800">
            <div className="flex items-center gap-2">
              {connectedNode ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Node Connected: {connectedNode}
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-xs text-zinc-400">
                    Waiting for agent heartbeat from remote machine...
                  </span>
                </>
              )}
            </div>
            {connectedNode && (
              <button
                onClick={onClose}
                className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-medium"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
