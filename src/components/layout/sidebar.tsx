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
  ChevronRight,
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
    <aside className="sy-sidebar flex flex-col h-full select-none" style={{ width: '220px' }}>
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 justify-between border-b" style={{ borderColor: 'var(--ink-700)' }}>
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onCloseMobile}>
          {/* Anchor icon with signal accent */}
          <div
            className="w-8 h-8 flex items-center justify-center rounded-md transition-all group-hover:shadow-lg"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid var(--signal-border)',
            }}
          >
            <Anchor className="w-4 h-4 text-signal" style={{ color: 'var(--signal)' }} />
          </div>
          <div>
            <p
              className="text-xs font-display font-bold tracking-wider"
              style={{ color: 'var(--ink-50)', fontFamily: "'Syne', sans-serif", letterSpacing: '0.1em' }}
            >
              SHIPYARD
            </p>
            <p className="text-[10px]" style={{ color: 'var(--ink-400)' }}>
              Control Plane
            </p>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded transition-colors"
            style={{ color: 'var(--ink-300)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cluster Status Bar */}
      <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--ink-800)' }}>
        <div
          className="flex items-center justify-between px-3 py-2 rounded-md"
          style={{ background: 'var(--ink-850)', border: '1px solid var(--ink-700)' }}
        >
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot-online" />
            <span className="text-[11px]" style={{ color: 'var(--ink-200)' }}>Cluster Active</span>
          </div>
          <span
            className="sy-badge sy-badge-green"
            style={{ fontSize: '9px' }}
          >
            {onlineServersCount}N
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-1 text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--ink-500)' }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`sy-nav-item${isActive ? " active" : ""}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-40" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--ink-700)', background: 'var(--ink-950)' }}>
        <div
          className="flex items-center justify-between p-2.5 rounded-md"
          style={{ background: 'var(--ink-850)', border: '1px solid var(--ink-700)' }}
        >
          <div className="overflow-hidden pr-2 flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--ink-100)' }}>
              {userEmail}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-2.5 h-2.5" style={{ color: 'var(--status-online)' }} />
              <span className="text-[10px]" style={{ color: 'var(--ink-400)' }}>Administrator</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded transition-colors shrink-0"
            style={{ color: 'var(--ink-400)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-400)')}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen">{content}</div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 transition-opacity"
            style={{ background: 'rgba(3,5,13,0.85)', backdropFilter: 'blur(4px)' }}
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full shadow-2xl animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
