"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Terminal, Server, Shield, Radio, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0b0c10] border border-zinc-800/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Connect Worker Node</h2>
                <Badge variant="cyan" className="font-mono text-[10px]">
                  Cluster Scaling
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">
                Run this command on any remote VPS, bare-metal server, or PC to join the cluster
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Node Identifier */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
              Node Identifier (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. vps-hetzner-frankfurt or edge-worker-01"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            {[
              { id: "curl", label: "Linux Shell (cURL)" },
              { id: "docker", label: "Docker Container" },
              { id: "node", label: "Node.js Standalone" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Command Display */}
          <div className="relative group">
            <div className="bg-black/90 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed select-text">
              {isGenerating ? "Generating cryptographic node token..." : currentCommand}
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              disabled={isGenerating || !token}
              className="absolute top-3 right-3 gap-1.5"
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
            </Button>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-200">Zero-Trust Outbound Architecture</p>
              <p className="mt-0.5 leading-relaxed">
                The agent initiates an outbound WebSocket/HTTPS connection to this control plane. It exposes no inbound ports to the internet, reports kernel telemetry every 3s, and runs builds in isolated Docker sandboxes.
              </p>
            </div>
          </div>

          {/* Heartbeat Status Listener */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              {connectedNode ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium font-mono">
                    Node Connected: {connectedNode}
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    Listening for remote heartbeat pulse...
                  </span>
                </>
              )}
            </div>

            {connectedNode && (
              <Button size="sm" variant="cyan" onClick={onClose}>
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
