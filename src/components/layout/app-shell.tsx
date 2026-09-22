"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ConnectNodeModal } from "../servers/connect-node-modal";
import { NewProjectModal } from "../projects/new-project-modal";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const [isConnectNodeOpen, setIsConnectNodeOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onlineNodesCount, setOnlineNodesCount] = useState(1);
  const [userEmail, setUserEmail] = useState("admin@shipyard.local");

  useEffect(() => {
    // Fetch current user and nodes
    fetch("/api/auth/me")
      .then((res) => {
        if (res.status === 401) {
          const isShowcase =
            typeof window !== "undefined" &&
            (window.location.hostname.includes("vercel.app") ||
              process.env.NEXT_PUBLIC_SHIPYARD_MODE === "public");
          if (!isShowcase) {
            window.location.href = "/login";
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      })
      .catch(() => {});

    const fetchNodes = () => {
      fetch("/api/servers")
        .then((res) => res.json())
        .then((data) => {
          if (data.servers) {
            const online = data.servers.filter((s: any) => s.status === "ONLINE").length;
            setOnlineNodesCount(online);
          }
        })
        .catch(() => {});
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        userEmail={userEmail}
        onlineServersCount={onlineNodesCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          onOpenConnectNode={() => setIsConnectNodeOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {typeof window !== "undefined" &&
          (window.location.hostname.includes("vercel.app") ||
            process.env.NEXT_PUBLIC_SHIPYARD_MODE === "public") && (
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border-b border-zinc-800 px-4 py-2 text-xs font-mono flex items-center justify-between text-zinc-300">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="font-semibold text-white">Vercel Cloud Showcase:</span>
                <span className="text-zinc-400 truncate">
                  To manage real Docker workloads & private vaults, install the appliance on your VPS.
                </span>
              </div>
              <a
                href="/docs#self-hosting"
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline shrink-0 ml-4"
              >
                VPS Installer &rarr;
              </a>
            </div>
          )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#09090b]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Modals */}
      <ConnectNodeModal
        isOpen={isConnectNodeOpen}
        onClose={() => setIsConnectNodeOpen(false)}
        onNodeAdded={() => {}}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreated={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}
