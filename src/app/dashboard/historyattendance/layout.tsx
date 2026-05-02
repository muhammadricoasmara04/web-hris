import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Riwayat Absensi Saya | Web HRIS",
  description:
    "Halaman riwayat absensi karyawan yang menampilkan data kehadiran dari endpoint /api/attendance/me.",
};

export default function HistoryAttendanceLayout({ children }: { children: ReactNode }) {
  return children;
}
