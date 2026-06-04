"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarClock,
  Contact,
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
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/authService";

type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  soon?: boolean;
};

const primaryItemsByRole: Record<"admin" | "hr" | "employee", SidebarItem[]> = {
  admin: [
    {
      id: "sidebar-link-admin-dashboard",
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/admin",
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
  ],
  hr: [
    {
      id: "sidebar-link-hr-dashboard",
      label: "HR Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/app-hr",
    },
    {
      id: "sidebar-link-hr-attendance",
      label: "Kehadiran Tim",
      icon: CalendarClock,
      href: "/dashboard/app-hr/data-attendance",
    },
    {
      id: "sidebar-link-hr-payroll",
      label: "Payroll & Gaji",
      icon: Wallet,
      soon: true,
    },
  ],
  employee: [
    {
      id: "sidebar-link-employee-home",
      label: "Dashboard Karyawan",
      icon: LayoutDashboard,
      href: "/dashboard/employee",
    },
    {
      id: "sidebar-link-employee-attendance",
      label: "Absen Hari Ini",
      icon: CalendarClock,
      href: "/dashboard/employee",
    },
    {
      id: "sidebar-link-employee-leave",
      label: "Pengajuan Cuti",
      icon: CalendarClock,
      href: "/dashboard/leave",
    },
    {
      id: "sidebar-link-employee-history",
      label: "Riwayat Absensi",
      icon: CalendarClock,
      href: "/dashboard/historyattendance",
    },
    {
      id: "sidebar-link-employee-payroll",
      label: "Slip Gaji",
      icon: Wallet,
      soon: true,
    },
  ],
};

const masterItemsByRole: Record<"admin" | "hr" | "employee", SidebarItem[]> = {
  admin: [],
  hr: [
    {
      id: "sidebar-link-hr-employees",
      label: "Data Karyawan",
      icon: Users,
      href: "/dashboard/app-hr/data-employees",
    },
    {
      id: "sidebar-link-hr-departments",
      label: "Departemen",
      icon: Building2,
      href: "/dashboard/app-hr/data-departements",
    },
    {
      id: "sidebar-link-hr-positions",
      label: "Jabatan",
      icon: Contact,
      href: "/dashboard/app-hr/data-position",
    },
  ],
  employee: [],
};

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

function checkIsActive(itemHref: string | undefined, currentPathname: string): boolean {
  if (!itemHref) return false;
  // Exact match for dashboard homes/roots
  const exactMatchRoutes = [
    "/dashboard/app-hr",
    "/dashboard/admin",
    "/dashboard/employee"
  ];
  if (exactMatchRoutes.includes(itemHref)) {
    return currentPathname === itemHref;
  }
  return currentPathname === itemHref || currentPathname.startsWith(`${itemHref}/`);
}

export function DashboardSidebar({ onStartTransition }: { onStartTransition?: () => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["profile-me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract display name
  const rawUser = (userData?.data || userData?.user || userData) as any;
  const displayName = rawUser?.fullname || rawUser?.name || rawUser?.fullName || rawUser?.username || "User";

  // Extract role from API, handle both string and object formats
  let apiRole = "";
  const roleData = rawUser?.role;

  if (typeof roleData === "string") {
    apiRole = roleData.toLowerCase();
  } else if (roleData && typeof roleData === "object") {
    apiRole = String((roleData as any).name || "").toLowerCase();
  } else if (rawUser?.roleName) {
    apiRole = String(rawUser.roleName).toLowerCase();
  }

  const isUserHrOrAdmin = apiRole.includes("admin") || apiRole.includes("hr") || apiRole.includes("manager") || apiRole.includes("super");
  const isHrisMode = isUserHrOrAdmin && (pathname.startsWith("/dashboard/app-hr") || pathname.startsWith("/dashboard/admin"));

  const activeMenuRole: "admin" | "hr" | "employee" = isHrisMode
    ? (apiRole.includes("admin") ? "admin" : "hr")
    : "employee";

  const primaryItems = primaryItemsByRole[activeMenuRole];
  const masterItems = masterItemsByRole[activeMenuRole];
  const roleLabel = isHrisMode
    ? (apiRole.includes("admin") ? "Administrator" : "HR Manager")
    : "Karyawan";

  return (
    <>
      <button
        id="dashboard-menu-toggle"
        type="button"
        aria-label="Toggle sidebar"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-[760] hidden items-center justify-center rounded-xl border border-white/15 bg-black/40 p-2.5 text-white shadow-lg backdrop-blur-lg transition hover:bg-black/60 md:inline-flex"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <button
        id="dashboard-sidebar-overlay"
        type="button"
        aria-label="Close sidebar overlay"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[730] bg-black/70 backdrop-blur-sm transition ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[750] w-[280px] border-r border-white/10 bg-[#050816]/90 p-4 backdrop-blur-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Web HRIS</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {isHrisMode ? "HR & Admin Panel" : "Portal Karyawan"}
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              {isHrisMode ? "Kelola data & operasional tim." : "Akses absensi mandiri staf."}
            </p>

            {isUserHrOrAdmin && (
              <Link
                href={isHrisMode ? "/dashboard/employee" : "/dashboard/app-hr"}
                onClick={() => {
                  setIsOpen(false);
                  if (onStartTransition) onStartTransition();
                }}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold shadow-lg transition active:scale-95 ${isHrisMode
                    ? "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                    : "bg-sky-500 text-white hover:bg-sky-400 shadow-sky-500/20"
                  }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                {isHrisMode ? "Mode Absensi" : "Mode HRIS"}
              </Link>
            )}
          </div>

          <nav className="space-y-2" aria-label="Primary dashboard menu">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Menu
            </p>
            {primaryItems.map((item) => (
              <SidebarMenuItem
                key={item.id}
                item={item}
                active={checkIsActive(item.href, pathname)}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </nav>

          {masterItems.length > 0 && (
            <nav className="space-y-2" aria-label="Master data menu">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Master Data
              </p>
              {masterItems.map((item) => (
                <SidebarMenuItem
                  key={item.id}
                  item={item}
                  active={checkIsActive(item.href, pathname)}
                  onNavigate={() => setIsOpen(false)}
                />
              ))}
            </nav>
          )}

          <nav className="space-y-2" aria-label="System configuration menu">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              System
            </p>
            {systemItems.map((item) => (
              <SidebarMenuItem
                key={item.id}
                item={item}
                active={checkIsActive(item.href, pathname)}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-300">Logged in as</p>
            <p className="mt-1 text-base font-semibold text-white">{displayName}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/60">{roleLabel}</p>
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
