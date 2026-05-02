"use client";

import { 
  Building2, 
  CalendarClock, 
  ClipboardList, 
  FileText, 
  LayoutGrid, 
  Settings, 
  Users, 
  Wallet 
} from "lucide-react";
import Link from "next/link";
import { ProfileHeader } from "@/components/attendance/profile-header";

const hrMenus = [
  {
    label: "Data Absen",
    icon: CalendarClock,
    href: "/dashboard/hr/attendance",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    label: "Karyawan",
    icon: Users,
    href: "/dashboard/hr/employees",
    color: "bg-sky-500",
    shadow: "shadow-sky-500/20",
  },
  {
    label: "Departemen",
    icon: Building2,
    href: "/dashboard/hr/departments",
    color: "bg-amber-500",
    shadow: "shadow-amber-500/20",
  },
  {
    label: "Payroll",
    icon: Wallet,
    href: "/dashboard/hr/payroll",
    color: "bg-purple-500",
    shadow: "shadow-purple-500/20",
  },
  {
    label: "Laporan",
    icon: FileText,
    href: "/dashboard/hr/reports",
    color: "bg-rose-500",
    shadow: "shadow-rose-500/20",
  },
  {
    label: "Lainnya",
    icon: LayoutGrid,
    href: "/dashboard/hr/more",
    color: "bg-zinc-600",
    shadow: "shadow-zinc-600/20",
  },
];

export default function HRDashboardPage() {
  return (
    <>
      <ProfileHeader />
      <div className="pb-32 pt-28">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            HR Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Kelola data operasional perusahaan dan absensi karyawan.
          </p>
        </header>

        {/* Akses HRIS Menu Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Akses HRIS
            </h2>
          </div>

          {/* Android App-like Grid (Side-by-side) */}
          <div className="grid grid-cols-3 gap-y-6 gap-x-2 md:grid-cols-4 lg:grid-cols-6">
            {hrMenus.map((menu, index) => {
              const Icon = menu.icon;
              return (
                <Link
                  key={index}
                  href={menu.href}
                  className="group flex flex-col items-center gap-3 transition active:scale-95"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${menu.color} shadow-lg ${menu.shadow} transition-transform group-hover:-translate-y-1`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-center text-[11px] font-semibold tracking-wide text-zinc-300 group-hover:text-white">
                    {menu.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Simulasi Akses Karyawan Card */}
        <section className="mt-12">
          <Link
            href="/dashboard/employee"
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-sky-500/40 hover:bg-white/10"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/10 blur-[40px] transition group-hover:bg-sky-500/20" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 shadow-inner">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-white">Dashboard Absensi</span>
                <span className="text-xs font-medium text-zinc-400">Lihat simulasi absensi karyawan</span>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </>
  );
}
