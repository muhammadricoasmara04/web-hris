"use client";

import { AttendanceHistoryItem, getTodayAttendanceHistory } from "@/services/attendanceService";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CalendarDays, Clock3, LocateFixed, LogIn, LogOut } from "lucide-react";
import { useMemo, useState } from "react";

const formatHistoryTime = (item: AttendanceHistoryItem) => {
  const raw = item.checkInTime || item.checkOutTime || item.time || item.createdAt;
  if (!raw) return "-";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatHistoryLocation = (item: AttendanceHistoryItem) => {
  if (item.locationName || item.location) {
    return String(item.locationName || item.location);
  }

  const lat = typeof item.lat === "number" ? item.lat : typeof item.latitude === "number" ? item.latitude : null;
  const lng = typeof item.lng === "number" ? item.lng : typeof item.longitude === "number" ? item.longitude : null;

  if (lat !== null && lng !== null) {
    return `Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`;
  }

  return "Lokasi tidak tersedia";
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getItemDateKey = (item: AttendanceHistoryItem) => {
  const raw = item.createdAt || item.checkInTime || item.checkOutTime || item.time;
  if (!raw) return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  return toInputDate(date);
};

export default function HistoryAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(toInputDate(new Date()));

  const historyQuery = useQuery({
    queryKey: ["attendance-history-me"],
    queryFn: getTodayAttendanceHistory,
  });

  const filteredHistory = useMemo(() => {
    if (!historyQuery.data) return [];
    
    const baseItems = historyQuery.data.filter((item) => getItemDateKey(item) === selectedDate);
    
    const unrolled: (AttendanceHistoryItem & { _virtualType?: "in" | "out" })[] = [];
    
    baseItems.forEach((item) => {
      const hasIn = Boolean(item.checkInTime);
      const hasOut = Boolean(item.checkOutTime);
      
      if (hasIn && hasOut) {
        unrolled.push({ ...item, type: "in", time: item.checkInTime, _virtualType: "in" });
        unrolled.push({ ...item, type: "out", time: item.checkOutTime, _virtualType: "out" });
      } else {
        unrolled.push(item);
      }
    });

    // Sort by time within the filtered results
    return unrolled.sort((a, b) => {
      const aTimeStr = a.time || a.checkInTime || a.checkOutTime || a.createdAt;
      const bTimeStr = b.time || b.checkInTime || b.checkOutTime || b.createdAt;
      const aTime = aTimeStr ? new Date(aTimeStr).getTime() : 0;
      const bTime = bTimeStr ? new Date(bTimeStr).getTime() : 0;
      return aTime - bTime;
    });
  }, [historyQuery.data, selectedDate]);

  const hasAttendanceOnSelectedDate = filteredHistory.length > 0;

  return (
    <main
      id="history-attendance-page"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#16203A_0%,#070C18_45%,#04070F_100%)] px-4 pb-28 pt-8 text-white md:px-8"
    >
      <header className="mx-auto mb-6 w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Riwayat Absensi Saya</h1>
        <p className="mt-2 text-sm text-zinc-300">Pilih tanggal untuk cek apakah sudah absen atau belum.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label htmlFor="attendance-date-filter" className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300">Pilih Tanggal</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5">
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

          <div
            id="attendance-date-status"
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              hasAttendanceOnSelectedDate
                ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                : "border-amber-300/30 bg-amber-400/10 text-amber-100"
            }`}
          >
            {hasAttendanceOnSelectedDate
              ? `Tanggal ${selectedDate}: Sudah absen`
              : `Tanggal ${selectedDate}: Belum ada absensi`}
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl">
        {historyQuery.isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-zinc-300">
            Memuat riwayat absensi...
          </div>
        ) : historyQuery.isError ? (
          <div className="rounded-3xl border border-rose-300/25 bg-rose-500/10 p-8 text-center text-sm text-rose-200">
            Gagal memuat riwayat absensi.
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="grid gap-3">
            {filteredHistory.map((item, index) => {
              const itemType = String(item.type || "").toLowerCase();
              const isClockIn = (item as any)._virtualType 
                ? (item as any)._virtualType === "in"
                : (itemType === "in" || itemType.includes("masuk") || (Boolean(item.checkInTime) && !item.checkOutTime));

              return (
                <article
                  id={`attendance-history-item-${index}`}
                  key={String(item.id ?? `${itemType}-${index}-${(item as any)._virtualType ?? ""}`)}
                  className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/40 hover:bg-white/[0.09]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-xl p-2 ${isClockIn ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300"}`}
                      >
                        {isClockIn ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{isClockIn ? "Check In" : "Check Out"}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-300">
                          <LocateFixed className="h-3.5 w-3.5" />
                          {formatHistoryLocation(item)}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-200">
                      {String(item.status || "Recorded")}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-zinc-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatHistoryTime(item)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Data Absensi
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-sm font-medium text-zinc-200">Tidak ada absensi di tanggal ini.</p>
            <p className="mt-1 text-xs text-zinc-400">Pilih tanggal lain untuk melihat riwayat absensi.</p>
          </div>
        )}
      </section>
    </main>
  );
}
