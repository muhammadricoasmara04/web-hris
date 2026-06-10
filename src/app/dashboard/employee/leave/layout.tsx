import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pengajuan | Web HRIS",
  description: "Ajukan cuti, sakit, atau izin, cek saldo, dan pantau status pengajuan kamu.",
};

export default function LeaveLayout({ children }: { children: ReactNode }) {
  return children;
}
