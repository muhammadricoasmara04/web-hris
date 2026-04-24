"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  soon?: boolean;
};

const primaryItems: SidebarItem[] = [
  {
    id: "sidebar-link-admin-dashboard",
    label: "Admin Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/admin",
    soon: true,
  },
  {
    id: "sidebar-link-users",
    label: "Manajemen User",
    icon: Users,
    soon: true,
  },
  {
    id: "sidebar-link-payroll",
    label: "Payroll & Gaji",
    icon: Wallet,
    soon: true,
  },
  {
    id: "sidebar-link-reports",
    label: "Laporan Kehadiran",
    icon: CalendarClock,
    soon: true,
  },
];

const systemItems: SidebarItem[] = [
  {
    id: "sidebar-link-settings",
    label: "System Settings",
    icon: Settings,
    soon: true,
  },
  {
    id: "sidebar-link-security",
    label: "Security Audit",
    icon: ShieldCheck,
    soon: true,
  },
];

function SidebarMenuItem({
  item,
  active,
  onNavigate,
}: {
  item: SidebarItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  if (item.href) {
    return (
      <Link
        id={item.id}
        href={item.href}
        onClick={onNavigate}
        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active
          ? "bg-sky-400/20 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
          : "text-zinc-300 hover:bg-white/10 hover:text-white"
          }`}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <button
      id={item.id}
      type="button"
      disabled
      className="group flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-zinc-400"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        {item.label}
      </span>
      {item.soon ? (
        <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-fuchsia-200">
          Soon
        </span>
      ) : null}
    </button>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isEmployeeFlow = pathname.startsWith("/dashboard/employee");

  return (
    <>
      {!isEmployeeFlow && (
        <button
          id="dashboard-mobile-menu-toggle"
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed left-4 top-4 z-50 inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/40 p-2.5 text-white shadow-lg backdrop-blur-lg transition hover:bg-black/60 lg:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      <button
        id="dashboard-mobile-sidebar-overlay"
        type="button"
        aria-label="Close sidebar overlay"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition lg:hidden ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] shrink-0 border-r border-white/10 bg-[#050816]/90 p-4 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Web HRIS</p>
            <h2 className="mt-2 text-xl font-semibold text-white">HR & Admin Panel</h2>
            <p className="mt-1 text-xs text-zinc-400">Manage your workforce & system.</p>
          </div>

          <nav className="space-y-2" aria-label="Primary dashboard menu">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Menu
            </p>
            {primaryItems.map((item) => (
              <SidebarMenuItem
                key={item.id}
                item={item}
                active={Boolean(item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)))}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </nav>

          <nav className="space-y-2" aria-label="System configuration menu">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              System
            </p>
            {systemItems.map((item) => (
              <SidebarMenuItem
                key={item.id}
                item={item}
                active={Boolean(item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)))}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-300">Logged in as</p>
            <p className="mt-1 text-base font-semibold text-white">Administrator</p>
            <Link
              id="dashboard-logout-link"
              href="/login"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-rose-400/40 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
