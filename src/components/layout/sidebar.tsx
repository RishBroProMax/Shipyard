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
  Anchor,
  X,
  ShieldCheck,
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
    <aside className="w-64 border-r border-zinc-800/80 bg-[#09090b] flex flex-col h-full select-none shrink-0 font-sans">
      {/* Brand Header */}
      <div className="h-16 border-b border-zinc-800/80 flex items-center px-5 justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={onCloseMobile}>
          <div className="w-9 h-9 rounded-xl border border-zinc-700/80 bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center text-cyan-400 shadow-sm group-hover:border-cyan-500/50 transition-colors">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-bold tracking-tight text-white">
                SHIPYARD
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-medium">
                PaaS
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Control Plane</p>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cluster Node Status Badge */}
      <div className="px-4 py-3.5 border-b border-zinc-850">
        <div className="bg-[#0c0d12] border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-zinc-300 font-medium">Cluster Active</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
            {onlineServersCount} {onlineServersCount === 1 ? "Node" : "Nodes"}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-zinc-850 text-white border border-zinc-700/80 shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-[#0c0d12]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-semibold text-zinc-200 truncate">{userEmail}</p>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Admin Role</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors shrink-0"
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
