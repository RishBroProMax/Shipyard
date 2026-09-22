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
          window.location.href = "/login";
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
