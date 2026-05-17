import { Activity, Clock3, UsersRound } from "lucide-react";

type AttendanceHeaderProps = {
  totalEmployees: number;
  hadirCount: number;
  terlambatCount: number;
  belumCheckoutCount: number;
};

export function AttendanceHeader({
  totalEmployees,
  hadirCount,
  terlambatCount,
  belumCheckoutCount,
}: AttendanceHeaderProps) {
  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">HR Attendance Monitoring</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Data Attendance Karyawan</h1>
      <p className="mt-2 text-sm text-zinc-300">Data diambil dari endpoint /api/attendance dengan filter periode dan tanggal.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <UsersRound className="mb-2 h-5 w-5 text-sky-300" />
          <p className="text-xs text-zinc-400">Total Data</p>
          <p className="text-2xl font-bold text-white">{totalEmployees}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <Activity className="mb-2 h-5 w-5 text-emerald-300" />
          <p className="text-xs text-zinc-400">Hadir (Selesai)</p>
          <p className="text-2xl font-bold text-white">{hadirCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <Activity className="mb-2 h-5 w-5 text-yellow-300" />
          <p className="text-xs text-zinc-400">Sedang Bekerja</p>
          <p className="text-2xl font-bold text-white">{belumCheckoutCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <Clock3 className="mb-2 h-5 w-5 text-amber-300" />
          <p className="text-xs text-zinc-400">Terlambat</p>
          <p className="text-2xl font-bold text-white">{terlambatCount}</p>
        </div>
      </div>
    </header>
  );
}
