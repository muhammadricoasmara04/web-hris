"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Contact,
  CreditCard,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";
import { formatDate } from "@/utils/formatDate";

const badgeClass: Record<string, string> = {
  active: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  inactive: "border-rose-400/30 bg-rose-400/15 text-rose-300",
};

const formatRupiah = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

const translateGender = (value?: string) => {
  if (!value) return "-";
  const val = value.toUpperCase();
  if (val === "MALE") return "Laki-laki (Male)";
  if (val === "FEMALE") return "Perempuan (Female)";
  return value;
};

const translateMaritalStatus = (value?: string) => {
  if (!value) return "-";
  const val = value.toUpperCase();
  if (val === "SINGLE") return "Belum Kawin (Single)";
  if (val === "MARRIED") return "Kawin (Married)";
  if (val === "DIVORCED") return "Cerai";
  return value;
};

const translateEmploymentStatus = (value?: string) => {
  if (!value) return "-";
  const val = value.toUpperCase();
  if (val === "PERMANENT") return "Karyawan Tetap (Permanent)";
  if (val === "CONTRACT") return "Kontrak (Contract)";
  if (val === "INTERN") return "Magang (Intern)";
  return value;
};

function EmployeeDetailContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");

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

  const employee = useMemo(() => {
    if (!employeeQuery.data || !employeeId) return null;
    return employeeQuery.data.find((emp) => emp.id === employeeId) || null;
  }, [employeeQuery.data, employeeId]);

  if (!employeeId) {
    return (
      <div className="space-y-6 pb-20 pt-20">
        <div className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">
          <p className="font-semibold">ID Karyawan tidak valid.</p>
          <Link
            href="/dashboard/app-hr/data-employees"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Data Karyawan
          </Link>
        </div>
      </div>
    );
  }

  if (employeeQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">Memuat detail data karyawan...</p>
        </div>
      </div>
    );
  }

  if (employeeQuery.isError || !employee) {
    return (
      <div className="space-y-6 pb-20 pt-20">
        <div className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">
          <p className="font-semibold">Data karyawan tidak ditemukan atau gagal diambil.</p>
          <Link
            href="/dashboard/app-hr/data-employees"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Data Karyawan
          </Link>
        </div>
      </div>
    );
  }

  const roleName = employee.role?.name || employee.roleId || "Employee";
  const statusStr = (employee.status || "ACTIVE").toLowerCase();
  const displayName = (employee.name || employee.username || "Karyawan").trim();
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 pb-20 pt-20">
      {/* Header & Back Button */}
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-2xl font-bold text-white shadow-lg shadow-sky-500/20">
              {initial}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white md:text-3xl">{displayName}</h1>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${
                    badgeClass[statusStr] || badgeClass.active
                  }`}
                >
                  {statusStr}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-300">
                {employee.email || "-"} • {employee.nik || "-"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/app-hr/data-employees"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Data Karyawan
          </Link>
        </div>
      </header>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Pekerjaan */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Building2 className="h-5 w-5 text-sky-400" /> Informasi Pekerjaan
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">NIK</p>
                <p className="text-sm font-medium text-white">{employee.nik || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Role Sistem</p>
                <p className="text-sm font-medium text-white capitalize">{roleName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Departemen</p>
                <p className="text-sm font-medium text-white">
                  {employee.department?.name?.trim() || (typeof employee.department === "string" ? employee.department.trim() : null) || "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Posisi / Jabatan</p>
                <p className="text-sm font-medium text-white">
                  {employee.position?.name?.trim() || (typeof employee.position === "string" ? employee.position.trim() : null) || "-"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Status Karyawan</p>
                <p className="text-sm font-medium text-white">
                  {translateEmploymentStatus(employee.employmentStatus)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Tanggal Bergabung</p>
                <p className="text-sm font-medium text-white">
                  {employee.joinDate ? formatDate(employee.joinDate) : "-"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Tanggal Akhir Kontrak</p>
                <p className="text-sm font-medium text-white">
                  {employee.contractEndDate ? formatDate(employee.contractEndDate) : "-"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">ID Manager</p>
                <p className="text-sm font-medium text-white">{employee.managerId || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">Dibuat Pada (Sistem)</p>
              <p className="text-sm font-medium text-white">
                {employee.createdAt ? formatDate(employee.createdAt, true) : "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Card 2: Informasi Pribadi */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <User className="h-5 w-5 text-sky-400" /> Informasi Pribadi
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">No. KTP</p>
                <p className="text-sm font-medium text-white">{employee.ktpNumber || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">No. Telepon / HP</p>
                <p className="text-sm font-medium text-white">{employee.phone || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Tempat Lahir</p>
                <p className="text-sm font-medium text-white">{employee.birthPlace || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Tanggal Lahir</p>
                <p className="text-sm font-medium text-white">
                  {employee.birthDate ? formatDate(employee.birthDate) : "-"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Jenis Kelamin</p>
                <p className="text-sm font-medium text-white">{translateGender(employee.gender)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Agama</p>
                <p className="text-sm font-medium text-white capitalize">{employee.religion || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Status Pernikahan</p>
                <p className="text-sm font-medium text-white">{translateMaritalStatus(employee.maritalStatus)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Golongan Darah</p>
                <p className="text-sm font-medium text-white">{employee.bloodType || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Card 3: Keuangan & Pajak */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <CreditCard className="h-5 w-5 text-sky-400" /> Keuangan & Pajak
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Gaji Pokok</p>
                <p className="text-sm font-semibold text-emerald-400">{formatRupiah(employee.salary)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">No. NPWP</p>
                <p className="text-sm font-medium text-white">{employee.npwpNumber || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Nama Bank</p>
                <p className="text-sm font-medium text-white">{employee.bankName || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">No. Rekening Bank</p>
                <p className="text-sm font-medium text-white">{employee.bankAccountNumber || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">BPJS Kesehatan</p>
                <p className="text-sm font-medium text-white">{employee.bpjsKesehatan || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">BPJS Ketenagakerjaan</p>
                <p className="text-sm font-medium text-white">{employee.bpjsKetenagakerjaan || "-"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Card 4: Kontak Darurat & Alamat */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Contact className="h-5 w-5 text-sky-400" /> Kontak Darurat
          </h2>
          <div className="space-y-4 border-b border-white/5 pb-4 mb-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Nama</p>
                <p className="text-sm font-medium text-white">{employee.emergencyContactName || "-"}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Hubungan</p>
                <p className="text-sm font-medium text-white capitalize">{employee.emergencyContactRelation || "-"}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">No. Telepon</p>
                <p className="text-sm font-medium text-white">{employee.emergencyContactPhone || "-"}</p>
              </div>
            </div>
          </div>

          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <MapPin className="h-5 w-5 text-sky-400" /> Alamat Tempat Tinggal
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">Alamat KTP</p>
              <p className="text-xs text-zinc-300">{employee.addressKtp || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">Alamat Domisili</p>
              <p className="text-xs text-zinc-300">{employee.addressDomisili || "-"}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function EmployeeDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Memuat halaman...</p>
          </div>
        </div>
      }
    >
      <EmployeeDetailContent />
    </Suspense>
  );
}
