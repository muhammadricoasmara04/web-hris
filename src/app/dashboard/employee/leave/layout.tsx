import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pengajuan Cuti | Web HRIS",
  description: "Ajukan cuti, cek saldo cuti, dan pantau status persetujuan pengajuan cuti karyawan.",
};

export default function LeaveLayout({ children }: { children: ReactNode }) {
  return children;
}
