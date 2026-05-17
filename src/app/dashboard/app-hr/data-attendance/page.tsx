"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, Clock3, Search, UsersRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AttendanceHistoryItem, getAttendanceRecords } from "@/services/attendanceService";

const badgeClass: Record<string, string> = {
  Hadir: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  Terlambat: "border-amber-400/30 bg-amber-400/15 text-amber-300",
  Izin: "border-sky-400/30 bg-sky-400/15 text-sky-300",
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (value?: string) => {
  if (!value) return "Hadir";
  const lower = value.toLowerCase();
  if (lower.includes("telat") || lower.includes("lambat")) return "Terlambat";
  if (lower.includes("izin") || lower.includes("sakit") || lower.includes("cuti")) return "Izin";
  return "Hadir";
};

const getDisplayName = (item: AttendanceHistoryItem) => {
  const raw = ((item as any).employee?.name || item.employeeName || item.name || item.fullname || item.fullName || item.userName || item.username) as string | undefined;
  return raw || "-";
};

const getDepartment = (item: AttendanceHistoryItem) => {
  const raw = (item.departmentName || item.department || item.division || item.team) as string | undefined;
  return raw || "-";
};

const getDateField = (item: AttendanceHistoryItem) => item.createdAt || item.checkInTime || item.checkOutTime || item.time;

export default function HrAttendanceMonitoringPage() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [selectedDate, setSelectedDate] = useState<string>(toInputDate(new Date()));

  const attendanceQuery = useQuery({
    queryKey: ["attendance", "all", { period, date: selectedDate }],
    queryFn: () => getAttendanceRecords({ period, date: selectedDate }),
    staleTime: 60 * 1000,
  });

  const rows = useMemo(() => {
    if (!attendanceQuery.data) return [];

    return attendanceQuery.data.map((item, index) => ({
      nik: String((item.nik || (item as any).employee?.nik || item.id) ?? `ATT-${index + 1}`),
      name: getDisplayName(item),
      dept: getDepartment(item),
      date: formatDateLabel(getDateField(item)),
      checkIn: formatTime(item.checkInTime || item.time),
      checkOut: formatTime(item.checkOutTime),
      status: normalizeStatus(item.status),
      lat: item.lat || item.latitude || (item as any).checkInLatitude,
      lng: item.lng || item.longitude || (item as any).checkInLongitude,
      outLat: (item as any).checkOutLatitude,
      outLng: (item as any).checkOutLongitude,
    }));
  }, [attendanceQuery.data]);

  const totalEmployees = rows.length;
  const hadirCount = rows.filter((row) => row.status === "Hadir").length;
  const terlambatCount = rows.filter((row) => row.status === "Terlambat").length;

  return (
    <div className="space-y-6 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">HR Attendance Monitoring</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Data Attendance Karyawan</h1>
        <p className="mt-2 text-sm text-zinc-300">Data diambil dari endpoint /api/attendance dengan filter periode dan tanggal.</p>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><UsersRound className="mb-2 h-5 w-5 text-sky-300" /><p className="text-xs text-zinc-400">Total Data</p><p className="text-2xl font-bold text-white">{totalEmployees}</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><Activity className="mb-2 h-5 w-5 text-emerald-300" /><p className="text-xs text-zinc-400">Hadir</p><p className="text-2xl font-bold text-white">{hadirCount}</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><Clock3 className="mb-2 h-5 w-5 text-amber-300" /><p className="text-xs text-zinc-400">Terlambat</p><p className="text-2xl font-bold text-white">{terlambatCount}</p></div>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Periode
            <select
              id="attendance-period-filter"
              value={period}
              onChange={(event) => setPeriod(event.target.value as "today" | "week" | "month")}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Search by Date
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <CalendarDays className="h-4 w-4 text-sky-300" />
              <input
                id="attendance-date-filter"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
              />
            </div>
          </label>

          <div className="inline-flex items-end">
            <div className="inline-flex w-full items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-400">
              <Search className="h-4 w-4" /> Filter aktif: {period}, {selectedDate}
            </div>
          </div>
        </div>

        {attendanceQuery.isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Memuat data absensi...</div>
        ) : attendanceQuery.isError ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">Gagal memuat data absensi.</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Data absensi tidak ditemukan untuk filter ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-3 py-3 font-semibold">NIK</th><th className="px-3 py-3 font-semibold">Nama</th><th className="px-3 py-3 font-semibold">Departemen</th><th className="px-3 py-3 font-semibold">Tanggal</th><th className="px-3 py-3 font-semibold">Check In</th><th className="px-3 py-3 font-semibold">Check Out</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.nik}-${index}`} className="border-b border-white/5 text-zinc-200 hover:bg-white/5">
                    <td className="px-3 py-3 font-mono text-xs text-zinc-400">{row.nik}</td><td className="px-3 py-3 font-medium text-white">{row.name}</td><td className="px-3 py-3">{row.dept}</td><td className="px-3 py-3">{row.date}</td><td className="px-3 py-3">{row.checkIn}</td><td className="px-3 py-3">{row.checkOut}</td><td className="px-3 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-semibold ${badgeClass[row.status] || badgeClass.Hadir}`}>{row.status}</span></td>
                    <td className="px-3 py-3">
                      {row.lat && row.lng ? (
                        <Link
                          href={`/dashboard/app-hr/data-attendance/data-mapping?inLat=${row.lat}&inLng=${row.lng}${row.outLat && row.outLng ? `&outLat=${row.outLat}&outLng=${row.outLng}` : ""}&name=${encodeURIComponent(row.name)}`}
                          className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/30 transition-colors inline-block whitespace-nowrap"
                        >
                          Lihat Lokasi
                        </Link>
                      ) : (
                        <span className="text-zinc-500 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
