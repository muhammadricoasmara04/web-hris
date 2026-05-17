"use client";

import { useState } from "react";
import { UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddEmployeePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    nik: "",
    department: "",
    roleId: "2", // Default to Employee role or similar
    salary: "",
    bankName: "",
    bankAccountNumber: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = buildApiUrl("/api/auth/register");
      const response = await authFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mendaftarkan karyawan");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "all"] });
      router.push("/dashboard/app-hr/data-employees");
    },
    onError: (err: any) => {
      setError(err.message || "Terjadi kesalahan");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6 pb-20 pt-20 max-w-4xl mx-auto">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <Link 
          href="/dashboard/app-hr/data-employees" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Data Karyawan
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tambah Data Karyawan</h1>
            <p className="mt-1 text-sm text-zinc-300">Lengkapi formulir di bawah ini untuk mendaftarkan karyawan baru.</p>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="johndoe"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">NIK</label>
              <input
                type="text"
                name="nik"
                required
                value={formData.nik}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="EMP-001"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Departemen</label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="Engineering"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Gaji Pokok (Rp)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="5000000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Bank Terdaftar</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="BCA, Mandiri, BRI, dll"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">Nomor Rekening</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                placeholder="1234567890"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
            <Link
              href="/dashboard/app-hr/data-employees"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mutation.isPending ? "Menyimpan..." : "Simpan Karyawan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
