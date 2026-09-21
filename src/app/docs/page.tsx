"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Anchor,
  ArrowLeft,
  Copy,
  Check,
  Server,
  Terminal,
  Shield,
  Rocket,
  Globe,
  FileCode,
  Users,
  Database,
  Search,
} from "lucide-react";

export default function DocsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sections = [
    { id: "quickstart", title: "Quickstart (One-Line VPS Install)" },
    { id: "architecture", title: "Appliance Architecture & Zero Config" },
    { id: "worker-nodes", title: "Connecting Worker Nodes" },
    { id: "file-editor", title: "In-Browser File Editor & Static Hosting" },
    { id: "git-auto-deploy", title: "Git Push & Webhook Auto-Deploy" },
    { id: "custom-domains", title: "Custom Domains & Reverse Proxy" },
    { id: "security-vault", title: "AES-256 Vault & Security Model" },
    { id: "api-reference", title: "REST & Agent API Reference" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800">
      {/* Top Docs Navigation */}
      <header className="h-14 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-100">
              <Anchor className="w-4 h-4 text-zinc-200" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-wider text-zinc-100">
              SHIPYARD
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              DOCS
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Docs Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10">
        {/* Left Table of Contents */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-20 space-y-4">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Documentation
            </div>
            <nav className="space-y-1">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block px-3 py-2 rounded text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
                >
                  {sec.title}
                </a>
              ))}
            </nav>

            <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <div className="text-zinc-200 font-semibold mb-1">Version: 1.0.0</div>
              <div>License: MIT / Self-Hosted</div>
            </div>
          </div>
        </aside>

        {/* Right Documentation Body */}
        <main className="flex-1 max-w-4xl space-y-12 text-sm leading-relaxed text-zinc-300">
          {/* Section 1: Quickstart */}
          <section id="quickstart" className="space-y-4 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Rocket className="w-4 h-4" />
              <span>GETTING STARTED</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              One-Line Appliance Installation
            </h2>
            <p>
              Shipyard is distributed as a self-contained appliance. Deploying it on any fresh Linux VPS (Ubuntu, Debian, CentOS, Rocky Linux) requires zero post-deployment setup:
            </p>

            <div className="relative group">
              <pre className="p-4 rounded-lg bg-black border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto">
                curl -fsSL https://shipyard.example/install.sh | sh
              </pre>
              <button
                onClick={() => copyCode("install", "curl -fsSL https://shipyard.example/install.sh | sh")}
                className="absolute top-3 right-3 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1"
              >
                {copiedSection === "install" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === "install" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              The installer checks Docker availability, creates persistent data directories in <code className="text-zinc-200">/var/lib/shipyard</code>, generates 256-bit cryptographic secrets, initializes PostgreSQL and Redis, runs migrations, seeds the initial administrator, and prints the live dashboard URL.
            </p>
          </section>

          {/* Section 2: Architecture */}
          <section id="architecture" className="space-y-4 scroll-mt-20 border-t border-zinc-800/80 pt-8">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Database className="w-4 h-4" />
              <span>ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Control Plane & Zero-Configuration Model
            </h2>
            <p>
              Shipyard is built on a distributed **Control Plane (Leader) + Deployment Agent (Worker Nodes)** architecture:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-400">
              <li>
                <strong className="text-zinc-200">Control Plane:</strong> Manages webhooks, project configurations, user accounts, audit activity, secret encryption, and dynamic reverse proxy routing.
              </li>
              <li>
                <strong className="text-zinc-200">Deployment Agents:</strong> Run on the local machine and remote servers. They execute builds in isolated Docker sandboxes and stream real-time CPU, RAM, Disk, and Network I/O metrics back to the leader.
              </li>
              <li>
                <strong className="text-zinc-200">Zero-Trust Sandboxing:</strong> Untrusted repository code builds exclusively on worker nodes—never in the main control plane process.
              </li>
            </ul>
          </section>

          {/* Section 3: Worker Nodes */}
          <section id="worker-nodes" className="space-y-4 scroll-mt-20 border-t border-zinc-800/80 pt-8">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Server className="w-4 h-4" />
              <span>CLUSTER SCALING</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Connecting Remote Worker Nodes
            </h2>
            <p>
              To join any remote VPS, bare-metal server, or PC as a worker node, execute the agent installation command:
            </p>

            <div className="relative group">
              <pre className="p-4 rounded-lg bg-black border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto">
                curl -fsSL http://&lt;LEADER_HOST&gt;:3000/agent_install | bash -s -- --token &lt;SECRET_KEY&gt;
              </pre>
              <button
                onClick={() =>
                  copyCode(
                    "agent",
                    "curl -fsSL http://<LEADER_HOST>:3000/agent_install | bash -s -- --token <SECRET_KEY>"
                  )
                }
                className="absolute top-3 right-3 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center gap-1"
              >
                {copiedSection === "agent" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === "agent" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Alternatively, use Docker to run the agent:
            </p>

            <pre className="p-4 rounded-lg bg-black border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
{`docker run -d \\
  --name shipyard-agent \\
  --restart always \\
  --net host \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -e SHIPYARD_LEADER_URL=http://<LEADER_HOST>:3000 \\
  -e SHIPYARD_AGENT_TOKEN=<SECRET_KEY> \\
  node:20-alpine sh -c "curl -fsSL http://<LEADER_HOST>:3000/agent_install | bash -s -- --token <SECRET_KEY>"`}
            </pre>
          </section>

          {/* Section 4: File Editor */}
          <section id="file-editor" className="space-y-4 scroll-mt-20 border-t border-zinc-800/80 pt-8">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <FileCode className="w-4 h-4" />
              <span>DEVELOPER WORKFLOW</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              In-Browser File Editor & Static Hosting
            </h2>
            <p>
              Shipyard includes a built-in file editor and upload manager. You can create projects directly by uploading HTML, CSS, and JS files without needing a Git repository.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-400">
              <li>Upload individual files or multi-file web assets via the project editor.</li>
              <li>Edit code directly inside the browser with live syntax buffers.</li>
              <li>Click &ldquo;Save &amp; Redeploy&rdquo; to instantaneously rebuild the container and update live reverse proxy routes.</li>
            </ul>
          </section>

          {/* Section 5: Git Auto Deploy */}
          <section id="git-auto-deploy" className="space-y-4 scroll-mt-20 border-t border-zinc-800/80 pt-8">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>CI/CD PIPELINE</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Git Push Webhook Auto-Deploy
            </h2>
            <p>
              Every project provides a dedicated GitHub webhook URL:
            </p>
            <pre className="p-3 bg-black border border-zinc-800 rounded font-mono text-xs text-emerald-400">
              http://&lt;LEADER_HOST&gt;:3000/api/webhooks/github
            </pre>
            <p className="text-xs text-zinc-400">
              When configured in GitHub (Payload URL &rarr; Content type: <code className="text-zinc-200">application/json</code>), every push to the monitored branch automatically triggers a zero-downtime deployment.
            </p>
          </section>

          {/* Section 6: Domains */}
          <section id="custom-domains" className="space-y-4 scroll-mt-20 border-t border-zinc-800/80 pt-8">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <Globe className="w-4 h-4" />
              <span>NETWORKING</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Custom Domains & Automated SSL
            </h2>
            <p>
              Shipyard dynamically assigns collision-free internal ports (30000-39999) and connects them to a Caddy reverse proxy. Adding a custom domain provisions automated Let&apos;s Encrypt SSL certificates.
            </p>
          </section>

          {/* Section 7: Security Vault */}
          <section id="security-vault" className="space-y-4 scroll-mt-20 border-t border-zinc-800/80 pt-8">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>SECURITY & ENCRYPTION</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
              AES-256-GCM Vault & Zero-Trust
            </h2>
            <p>
              All project environment variables and server tokens are encrypted at rest using AES-256-GCM authenticated encryption. Variables are never exposed in build logs or UI responses unless explicitly decrypted by an authorized admin session.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
