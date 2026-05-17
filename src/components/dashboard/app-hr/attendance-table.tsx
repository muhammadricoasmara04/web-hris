import { MapPinned } from "lucide-react";

const badgeClass: Record<string, string> = {
  Hadir: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  Terlambat: "border-amber-400/30 bg-amber-400/15 text-amber-300",
  Izin: "border-sky-400/30 bg-sky-400/15 text-sky-300",
  "Belum Checkout": "border-yellow-400/30 bg-yellow-400/15 text-yellow-300",
};

export type AttendanceRow = {
  rowKey: string;
  recordId: string;
  nik: string;
  name: string;
  dept: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  mapsUrl: string | null;
};

type AttendanceTableProps = {
  rows: AttendanceRow[];
};

export function AttendanceTable({ rows }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-zinc-400">
            <th className="px-3 py-4 font-semibold">NIK</th>
            <th className="px-3 py-4 font-semibold">Nama</th>
            <th className="px-3 py-4 font-semibold">Departemen</th>
            <th className="px-3 py-4 font-semibold">Tanggal</th>
            <th className="px-3 py-4 font-semibold">Check In</th>
            <th className="px-3 py-4 font-semibold">Check Out</th>
            <th className="px-3 py-4 font-semibold text-center">Lokasi</th>
            <th className="px-3 py-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.rowKey}
              className="border-b border-white/5 text-zinc-200 transition-colors hover:bg-white/5"
            >
              <td className="px-3 py-4 font-mono text-xs text-zinc-300">{row.nik}</td>
              <td className="px-3 py-4 font-medium text-white">{row.name}</td>
              <td className="px-3 py-4">{row.dept}</td>
              <td className="px-3 py-4">{row.date}</td>
              <td className="px-3 py-4">{row.checkIn}</td>
              <td className="px-3 py-4">{row.checkOut}</td>
              <td className="px-3 py-4 text-center">
                {row.mapsUrl ? (
                  <a
                    id={`attendance-location-link-${row.rowKey}`}
                    href={row.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20 hover:text-cyan-100"
                  >
                    <MapPinned className="h-3.5 w-3.5" />
                    Lihat Maps
                  </a>
                ) : (
                  <span className="text-xs italic text-zinc-600">N/A</span>
                )}
              </td>
              <td className="px-3 py-4">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClass[row.status] || badgeClass.Hadir}`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
