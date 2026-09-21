"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Rocket,
  Server,
  Activity,
  Settings,
  LogOut,
  Radio,
  Anchor,
  BookOpen,
  X,
} from "lucide-react";

interface SidebarProps {
  userEmail?: string;
  onlineServersCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  userEmail = "admin@shipyard.local",
  onlineServersCount = 1,
  isOpenMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Overview", href: "/", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderGit2 },
    { label: "Deployments", href: "/deployments", icon: Rocket },
    { label: "Servers", href: "/servers", icon: Server },
    { label: "Activity", href: "/activity", icon: Activity },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Documentation", href: "/docs", icon: BookOpen },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const content = (
    <aside className="w-64 border-r border-zinc-800/80 bg-[#09090b] flex flex-col h-full select-none shrink-0">
      {/* Brand Header */}
      <div className="h-14 border-b border-zinc-800/80 flex items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={onCloseMobile}>
          <div className="w-8 h-8 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-100">
            <Anchor className="w-4 h-4 text-zinc-200" />
          </div>
          <div>
            <span className="font-mono text-sm font-semibold tracking-wider text-zinc-100">
              SHIPYARD
            </span>
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              PaaS
            </span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cluster Node Status Badge */}
      <div className="px-3 py-3 border-b border-zinc-900">
        <div className="bg-zinc-950 border border-zinc-800/60 rounded px-2.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">Cluster Active</span>
          </div>
          <span className="text-xs font-mono font-medium text-zinc-300">
            {onlineServersCount} {onlineServersCount === 1 ? "Node" : "Nodes"}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? "bg-zinc-800/80 text-zinc-100 border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-zinc-100" : "text-zinc-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-zinc-200 truncate">{userEmail}</p>
            <p className="text-[10px] text-zinc-500 font-mono">Platform Admin</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen">{content}</div>

      {/* Mobile Drawer Backdrop and Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          ></div>
          <div className="relative z-10 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
