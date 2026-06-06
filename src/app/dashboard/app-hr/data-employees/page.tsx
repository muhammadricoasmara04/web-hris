"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UsersRound, Building2, UserCheck, UserPlus, Trash2, Loader2, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { authFetch } from "@/services/authClient";
import { buildApiUrl } from "@/api/api";
import { formatDate } from "@/utils/formatDate";
import Link from "next/link";

const badgeClass: Record<string, string> = {
  Active: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  Inactive: "border-rose-400/30 bg-rose-400/15 text-rose-300",
};

const MONTH_MAP: Record<string, number> = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, agu: 7,
  september: 8, sep: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  desember: 11, des: 11,
};

function parseIndonesianOrIsoDate(dateStr: string | number | Date | null | undefined): number {
  if (!dateStr) return 0;
  if (dateStr instanceof Date) return dateStr.getTime();
  if (typeof dateStr === "number") return dateStr;

  const cleanStr = String(dateStr).toLowerCase().replace(/\s+/g, " ");

  // Check if it's an Indonesian date string (contains month names or "pukul")
  const isIndo = cleanStr.includes("pukul") || 
                 Object.keys(MONTH_MAP).some(month => cleanStr.includes(month));

  if (isIndo) {
    try {
      const parts = cleanStr.split(" ");
      if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const monthName = parts[1];
        const year = parseInt(parts[2], 10);
        const month = MONTH_MAP[monthName] ?? 0;
        
        let hour = 0;
        let minute = 0;
        
        const pukulIndex = parts.indexOf("pukul");
        if (pukulIndex !== -1 && parts[pukulIndex + 1]) {
          const timeStr = parts[pukulIndex + 1];
          const timeParts = timeStr.split(".");
          if (timeParts.length >= 2) {
            hour = parseInt(timeParts[0], 10);
            minute = parseInt(timeParts[1], 10);
          }
        }
        
        const parsedDate = new Date(year, month, day, hour, minute);
        if (!Number.isNaN(parsedDate.getTime())) {
          return parsedDate.getTime();
        }
      }
    } catch (err) {
      console.error("Error parsing Indonesian date:", dateStr, err);
    }
  }

  // Fallback to standard JS Date parser for ISO / English dates
  const standardDate = new Date(dateStr);
  if (!Number.isNaN(standardDate.getTime())) {
    return standardDate.getTime();
  }

  return 0;
}

export default function HrEmployeeMonitoringPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(buildApiUrl(`/api/auth/users/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghapus karyawan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "all"] });
      Swal.fire({
        title: "Berhasil!",
        text: "Karyawan telah berhasil dihapus.",
        icon: "success",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Gagal menghapus karyawan.",
        icon: "error",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    }
  });

  const handleDelete = (id: string, name: string, nik: string) => {
    Swal.fire({
      title: 'Hapus Karyawan?',
      html: `Apakah Anda yakin ingin menghapus karyawan <strong>${name}</strong>?<br/><br/><p class="text-sm text-zinc-400">Silakan ketik NIK Karyawan berikut untuk konfirmasi:<br/><strong class="text-sky-400 select-none">${nik}</strong></p>`,
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Masukkan NIK',
      showCancelButton: true,
      background: '#18181b',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) {
          return 'NIK harus diisi!';
        }
        if (value.trim() !== nik) {
          return 'NIK yang dimasukkan tidak sesuai!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/departments"));
      if (!res.ok) return [];
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    }
  });

  const employeeQuery = useQuery({
    queryKey: ["employees", "all"],
    queryFn: async () => {
      const url = buildApiUrl("/api/auth/users");
      try {
        const response = await authFetch(url);
        if (!response.ok) throw new Error("Gagal mengambil data employee");
        const json = await response.json();
        console.log("Data Employee API Response:", json); // Debugging API data
        return (json.data || []) as any[];
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const rows = useMemo(() => {
    if (!employeeQuery.data) return [];

    let filtered = [...employeeQuery.data];
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(lower) ||
          (item.nik || "").toLowerCase().includes(lower) ||
          (item.email || "").toLowerCase().includes(lower)
      );
    }

    // Sort by createdAt descending (newest first)
    filtered.sort((a, b) => {
      const timeA = parseIndonesianOrIsoDate(a.createdAt || a.joinDate);
      const timeB = parseIndonesianOrIsoDate(b.createdAt || b.joinDate);
      return timeB - timeA;
    });

    console.log("=== SORTED EMPLOYEES (Newest First) ===");
    filtered.forEach((u, i) => {
      console.log(`[${i + 1}] Name: "${u.name}", createdAt: "${u.createdAt}", joinDate: "${u.joinDate}", parsedTS: ${parseIndonesianOrIsoDate(u.createdAt || u.joinDate)}`);
    });

    return filtered.map((item, index) => ({
      id: item.id || `EMP-${index}`,
      nik: item.nik || item.employee?.nik || `NIK-${index + 1}`,
      name: item.name || item.employee?.name || item.username || "Karyawan",
      email: item.email || "-",
      dept: item.department?.name || (typeof item.department === 'string' ? item.department : null) || "-",
      role: item.role?.name || item.roleId || "Employee",
      status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()) : "Active",
      joinDate: item.joinDate || "-",
      createdAt: item.createdAt || "-",
    }));
  }, [employeeQuery.data, searchQuery]);

  const totalEmployees = rows.length;
  const activeCount = rows.filter((row) => row.status === "Active").length;

  return (
    <div className="space-y-6 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">HR Employee Data</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Data Karyawan</h1>
            <p className="mt-2 text-sm text-zinc-300">Daftar semua karyawan yang terdaftar di dalam sistem.</p>
          </div>
          <Link
            href="/dashboard/app-hr/data-employees/add"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Karyawan
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <UsersRound className="mb-2 h-5 w-5 text-sky-300" />
            <p className="text-xs text-zinc-400">Total Karyawan</p>
            <p className="text-2xl font-bold text-white">{totalEmployees}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <UserCheck className="mb-2 h-5 w-5 text-emerald-300" />
            <p className="text-xs text-zinc-400">Karyawan Aktif</p>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <Building2 className="mb-2 h-5 w-5 text-amber-300" />
            <p className="text-xs text-zinc-400">Departemen</p>
            <p className="text-2xl font-bold text-white">{departmentsQuery.data?.length || 0}</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Cari Karyawan
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search className="h-4 w-4 text-sky-300" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NIK, atau email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
              />
            </div>
          </label>
        </div>

        {employeeQuery.isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Memuat data karyawan...</div>
        ) : employeeQuery.isError ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">Gagal memuat data karyawan.</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Data karyawan tidak ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-3 py-3 font-semibold">NIK</th>
                  <th className="px-3 py-3 font-semibold">Nama</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Departemen</th>
                  <th className="px-3 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Join Date</th>
                  <th className="px-3 py-3 font-semibold">Dibuat Pada</th>
                  <th className="px-3 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.id}-${index}`} className="border-b border-white/5 text-zinc-200 hover:bg-white/5">
                    <td className="px-3 py-3 font-mono text-xs text-zinc-400">{row.nik}</td>
                    <td className="px-3 py-3 font-medium text-white">{row.name}</td>
                    <td className="px-3 py-3 text-zinc-400">{row.email}</td>
                    <td className="px-3 py-3">{row.dept}</td>
                    <td className="px-3 py-3 capitalize">{row.role}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${badgeClass[row.status] || badgeClass.Active}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{row.joinDate !== "-" ? formatDate(row.joinDate) : "-"}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs">{row.createdAt !== "-" ? formatDate(row.createdAt, true) : "-"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/app-hr/data-employees/detail?id=${row.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                          title="Detail Karyawan"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(row.id, row.name, row.nik)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors disabled:opacity-50"
                          title="Hapus Karyawan"
                        >
                          {deleteMutation.isPending && deleteMutation.variables === row.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
