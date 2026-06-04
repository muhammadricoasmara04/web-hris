"use client";

import {
  Building2,
  CalendarClock,
  Users,
  Wallet,
  Clock,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { ProfileHeader } from "@/components/attendance/profile-header";
import { getMe } from "@/services/authService";
import { authFetch } from "@/services/authClient";
import { buildApiUrl } from "@/api/api";

export default function HRDashboardPage() {
  const router = useRouter();
  const hasAlertedRef = useRef(false);

  // Fetch HR profile
  const { data: profileMe, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ["profile-me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch employees
  const employeeQuery = useQuery({
    queryKey: ["employees", "all"],
    queryFn: async () => {
      const url = buildApiUrl("/api/auth/users");
      const response = await authFetch(url);
      if (!response.ok) throw new Error("Gagal mengambil data employee");
      const json = await response.json();
      return (json.data || []) as any[];
    },
    staleTime: 60 * 1000,
  });

  // Fetch attendance records
  const attendanceQuery = useQuery({
    queryKey: ["attendance", "all"],
    queryFn: async () => {
      const url = buildApiUrl("/api/attendance");
      const response = await authFetch(url);
      if (!response.ok) throw new Error("Gagal mengambil data absensi");
      const json = await response.json();
      return (json.data || []) as any[];
    },
    staleTime: 60 * 1000,
  });

  // Access control
  const isEmployee = useMemo(() => {
    const rawPayload = (profileMe?.data || profileMe?.user || profileMe) as unknown;
    const rawUser = rawPayload && typeof rawPayload === "object" ? (rawPayload as Record<string, unknown>) : null;
    let apiRole = "";
    const roleData = rawUser?.role;
    if (typeof roleData === "string") apiRole = roleData.toLowerCase();
    else if (roleData && typeof roleData === "object") apiRole = String((roleData as Record<string, unknown>).name || "").toLowerCase();
    else if (typeof rawUser?.roleName === "string") apiRole = rawUser.roleName.toLowerCase();
    return !(apiRole.includes("admin") || apiRole.includes("hr") || apiRole.includes("manager") || apiRole.includes("super"));
  }, [profileMe]);

  useEffect(() => {
    if (isProfileLoading || isProfileError || !profileMe || !isEmployee || hasAlertedRef.current) return;
    hasAlertedRef.current = true;
    alert("Tidak Dapat Akses");
    router.replace("/dashboard/employee");
  }, [profileMe, isEmployee, isProfileError, isProfileLoading, router]);

  // Analytics calculations
  const stats = useMemo(() => {
    const employees = employeeQuery.data || [];
    const attendance = attendanceQuery.data || [];

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(
      (u) => (u.status || "").toUpperCase() === "ACTIVE"
    ).length;

    // Financial Average Salary
    const salaryList = employees.map((u) => u.salary).filter((s) => typeof s === "number" && s > 0);
    const avgSalary = salaryList.length > 0 
      ? Math.round(salaryList.reduce((sum, s) => sum + s, 0) / salaryList.length)
      : 0;

    // Departments Grouping
    const deptMap: Record<string, number> = {};
    employees.forEach((emp) => {
      const deptName = emp.department?.name || (typeof emp.department === "string" ? emp.department : null);
      if (deptName && deptName.trim()) {
        const cleaned = deptName.trim();
        deptMap[cleaned] = (deptMap[cleaned] || 0) + 1;
      }
    });

    const departmentList = Object.entries(deptMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const totalDepts = departmentList.length;

    // Determine target attendance date (latest date with check-ins, or today)
    const latestRecordDate = attendance[0]?.createdAt
      ? new Date(attendance[0].createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const todayRecords = attendance.filter(
      (r) => r.createdAt && r.createdAt.startsWith(latestRecordDate)
    );

    const presentUserIds = new Set(todayRecords.map((r) => r.employeeId));
    const presentCount = presentUserIds.size;
    const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

    // Late count (let's say late is checked in after 09:00 AM)
    let lateCount = 0;
    todayRecords.forEach((r) => {
      if (r.checkInTime) {
        const checkInHour = new Date(r.checkInTime).getHours();
        if (checkInHour >= 9) {
          lateCount++;
        }
      }
    });

    // Recent activity log
    const recentLogs = attendance.slice(0, 5).map((record) => {
      const empName = record.employee?.name || "Karyawan";
      const checkInDate = record.checkInTime ? new Date(record.checkInTime) : null;
      
      const timeLabel = checkInDate
        ? checkInDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
        : "-";
        
      const isLate = checkInDate ? checkInDate.getHours() >= 9 : false;

      return {
        id: record.id,
        name: empName,
        time: timeLabel,
        type: "Check In",
        status: isLate ? "Terlambat" : "Tepat Waktu",
        statusColor: isLate 
          ? "border-amber-400/30 bg-amber-400/15 text-amber-300"
          : "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
        dateLabel: record.createdAt 
          ? new Date(record.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
          : ""
      };
    });

    return {
      totalEmployees,
      activeEmployees,
      avgSalary,
      totalDepts,
      departmentList,
      attendanceRate,
      presentCount,
      lateCount,
      recentLogs,
      targetDateLabel: new Date(latestRecordDate).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    };
  }, [employeeQuery.data, attendanceQuery.data]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (isProfileLoading || employeeQuery.isLoading || attendanceQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (isProfileError || isEmployee) return null;

  return (
    <>
      <ProfileHeader />
      <div className="pb-32 pt-28">
        {/* Page Header */}
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">HRIS Analytics Overview</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            HR Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Pemantauan langsung analitik operasional perusahaan dan aktivitas kehadiran staf.
          </p>
        </header>

        {/* Analytics Key Metrics Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Employees */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl transition group-hover:bg-sky-500/20" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Karyawan</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 shadow-inner">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{stats.totalEmployees}</span>
              <span className="text-xs text-zinc-400">orang</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{stats.activeEmployees} Karyawan Aktif</span>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Rasio Kehadiran</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shadow-inner">
                <CalendarClock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{stats.attendanceRate}%</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400 truncate">
              {stats.presentCount} hadir pada {stats.targetDateLabel}
            </p>
          </div>

          {/* Terlambat Hari Ini */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Terlambat</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shadow-inner">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{stats.lateCount}</span>
              <span className="text-xs text-zinc-400">staf</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Absen masuk di atas pukul 09:00 WIB
            </p>
          </div>

          {/* Average Salary */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition group-hover:bg-purple-500/20" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Rata-rata Gaji</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 shadow-inner">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex flex-col">
              <span className="text-2xl font-extrabold text-white truncate">{formatIDR(stats.avgSalary)}</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Rata-rata remunerasi per staf
            </p>
          </div>
        </section>

        {/* Dashboard Panels */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column (2 Panels) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Department Breakdown */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Distribusi Departemen</h3>
                  <p className="text-xs text-zinc-400">Pembagian jumlah karyawan per departemen saat ini.</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>

              {stats.departmentList.length === 0 ? (
                <p className="text-sm text-zinc-400 py-6 text-center">Belum ada departemen yang terdaftar.</p>
              ) : (
                <div className="space-y-4">
                  {stats.departmentList.map((dept, index) => {
                    const pct = stats.totalEmployees > 0 ? Math.round((dept.count / stats.totalEmployees) * 100) : 0;
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-white">{dept.name}</span>
                          <span className="text-xs text-zinc-400">
                            {dept.count} Staf ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions / HR Management Links */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-4">Akses Navigasi HRIS</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href="/dashboard/app-hr/data-employees"
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4 transition hover:border-sky-500/30 hover:bg-white/5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Data Karyawan</p>
                      <p className="text-xs text-zinc-400">Kelola & daftarkan staf baru</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition" />
                </Link>

                <Link
                  href="/dashboard/app-hr/data-attendance"
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4 transition hover:border-emerald-500/30 hover:bg-white/5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Riwayat Kehadiran</p>
                      <p className="text-xs text-zinc-400">Monitor clock-in/out harian</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline / Latest Activity */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Log Aktivitas Terbaru</h3>
                <p className="text-xs text-zinc-400">Aktivitas clock-in terakhir.</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                <Activity className="h-4 w-4" />
              </div>
            </div>

            {stats.recentLogs.length === 0 ? (
              <p className="text-sm text-zinc-400 py-12 text-center">Belum ada aktivitas absensi.</p>
            ) : (
              <div className="relative border-l border-white/10 pl-4 space-y-6">
                {stats.recentLogs.map((log, index) => (
                  <div key={log.id || index} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-sky-400 bg-[#050816]" />
                    
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-white">{log.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {log.type} pada {log.dateLabel} pukul {log.time}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${log.statusColor}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
