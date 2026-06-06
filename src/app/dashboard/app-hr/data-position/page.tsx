"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, Loader2, Briefcase, Pencil, Building } from "lucide-react";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";
import { formatDate } from "@/utils/formatDate";
import Swal from "sweetalert2";

export default function DataPositionsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [newBaseAllowance, setNewBaseAllowance] = useState("");
  const [newDeptId, setNewDeptId] = useState("");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editBaseAllowance, setEditBaseAllowance] = useState("");
  const [editDeptId, setEditDeptId] = useState("");

  const [filterDeptId, setFilterDeptId] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/departments"));
      if (!res.ok) return [];
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    }
  });

  const { data: positions = [], isLoading, isError } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/positions"));
      if (!res.ok) throw new Error("Gagal memuat data jabatan");
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    },
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; level?: string | null; baseAllowance?: number | null; departmentId?: string | null }) => {
      const res = await authFetch(buildApiUrl("/api/positions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menambah jabatan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setIsAddModalOpen(false);
      setNewName("");
      setNewDesc("");
      setNewLevel("");
      setNewBaseAllowance("");
      setNewDeptId("");
      Swal.fire({
        title: "Berhasil",
        text: "Jabatan berhasil ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#18181b",
        color: "#fff",
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal",
        text: err.message,
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description?: string; level?: string | null; baseAllowance?: number | null; departmentId?: string | null }) => {
      const { id, ...payload } = data;
      const res = await authFetch(buildApiUrl(`/api/positions/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengubah jabatan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setIsEditModalOpen(false);
      setEditId("");
      setEditName("");
      setEditDesc("");
      setEditLevel("");
      setEditBaseAllowance("");
      setEditDeptId("");
      Swal.fire({
        title: "Berhasil",
        text: "Jabatan berhasil diperbarui",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#18181b",
        color: "#fff",
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal",
        text: err.message,
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(buildApiUrl(`/api/positions/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghapus jabatan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      Swal.fire({
        title: "Berhasil",
        text: "Jabatan berhasil dihapus",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#18181b",
        color: "#fff",
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal",
        text: err.message,
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDeptId || !newLevel.trim()) {
      Swal.fire({
        title: "Peringatan",
        text: "Nama Jabatan, Departemen, dan Level wajib diisi",
        icon: "warning",
        background: "#18181b",
        color: "#fff",
      });
      return;
    }
    createMutation.mutate({
      name: newName,
      description: newDesc || undefined,
      level: newLevel,
      baseAllowance: newBaseAllowance ? parseFloat(newBaseAllowance) : null,
      departmentId: newDeptId,
    });
  };

  const handleEditClick = (pos: any) => {
    setEditId(pos.id);
    setEditName(pos.name || "");
    setEditDesc(pos.description || "");
    setEditLevel(pos.level || "");
    setEditBaseAllowance(pos.baseAllowance !== null && pos.baseAllowance !== undefined ? String(pos.baseAllowance) : "");
    setEditDeptId(pos.departmentId || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editDeptId || !editLevel.trim()) {
      Swal.fire({
        title: "Peringatan",
        text: "Nama Jabatan, Departemen, dan Level wajib diisi",
        icon: "warning",
        background: "#18181b",
        color: "#fff",
      });
      return;
    }
    updateMutation.mutate({
      id: editId,
      name: editName,
      description: editDesc || undefined,
      level: editLevel,
      baseAllowance: editBaseAllowance ? parseFloat(editBaseAllowance) : null,
      departmentId: editDeptId,
    });
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: "Hapus Jabatan?",
      text: `Apakah Anda yakin ingin menghapus jabatan "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      background: "#18181b",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const uniqueLevels = useMemo(() => {
    const levels = positions
      .map((pos: any) => pos.level)
      .filter((lvl: any) => !!lvl);
    return Array.from(new Set(levels)) as string[];
  }, [positions]);

  const filteredData = [...positions]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .filter((pos) => {
      const matchesSearch = (pos.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pos.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pos.level || "").toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesDept = !filterDeptId || pos.departmentId === filterDeptId;
      const matchesLevel = !filterLevel || pos.level === filterLevel;

      return matchesSearch && matchesDept && matchesLevel;
    });

  const formatAllowance = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">HR Master Data</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Data Jabatan (Position)</h1>
            <p className="mt-2 text-sm text-zinc-300">Kelola daftar struktur jabatan dan tunjangan pokok.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            Tambah Jabatan
          </button>
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <Briefcase className="mb-2 h-5 w-5 text-sky-300" />
            <p className="text-xs text-zinc-400">Total Jabatan</p>
            <p className="text-2xl font-bold text-white">{positions.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <Building className="mb-2 h-5 w-5 text-amber-300" />
            <p className="text-xs text-zinc-400">Total Departemen</p>
            <p className="text-2xl font-bold text-white">{departments.length}</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Cari Jabatan
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search className="h-4 w-4 text-sky-300" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Filter Departemen
            <select
              value={filterDeptId}
              onChange={(e) => setFilterDeptId(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#18181b] px-3 py-2 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
            >
              <option value="" className="bg-[#18181b] text-white">Semua Departemen</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id} className="bg-[#18181b] text-white">
                  {dept.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Filter Level
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#18181b] px-3 py-2 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
            >
              <option value="" className="bg-[#18181b] text-white">Semua Level</option>
              {uniqueLevels.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-[#18181b] text-white">
                  {lvl}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Memuat data jabatan...</div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">Gagal memuat data jabatan.</div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Data jabatan tidak ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-3 py-3 font-semibold">Nama Jabatan</th>
                  <th className="px-3 py-3 font-semibold">Departemen</th>
                  <th className="px-3 py-3 font-semibold">Deskripsi</th>
                  <th className="px-3 py-3 font-semibold">Level</th>
                  <th className="px-3 py-3 font-semibold">Tunjangan Pokok</th>
                  <th className="px-3 py-3 font-semibold">Jumlah Karyawan</th>
                  <th className="px-3 py-3 font-semibold">Dibuat Pada</th>
                  <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((pos) => (
                  <tr key={pos.id} className="border-b border-white/5 text-zinc-200 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-3 font-medium text-white">{pos.name}</td>
                    <td className="px-3 py-3 text-zinc-300">
                      {pos.department?.name || departments.find((d: any) => d.id === pos.departmentId)?.name || "-"}
                    </td>
                    <td className="px-3 py-3 text-zinc-400">{pos.description || "-"}</td>
                    <td className="px-3 py-3 font-mono text-xs text-zinc-400">{pos.level || "-"}</td>
                    <td className="px-3 py-3 font-medium text-sky-300">{formatAllowance(pos.baseAllowance)}</td>
                    <td className="px-3 py-3 text-zinc-300">{pos._count?.employees ?? 0} Karyawan</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-zinc-400">
                      {pos.createdAt ? formatDate(pos.createdAt, true) : "-"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(pos)}
                          className="inline-flex items-center justify-center rounded-lg bg-sky-500/10 p-2 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
                          title="Edit Jabatan"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pos.id, pos.name)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors disabled:opacity-50"
                          title="Hapus Jabatan"
                        >
                          {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Edit Jabatan</h2>
            <p className="text-sm text-zinc-400 mb-6">Ubah data jabatan yang dipilih.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Deskripsi (Opsional)</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Departemen</label>
                <select
                  required
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#18181b] p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                >
                  <option value="" disabled className="bg-[#18181b] text-white">Pilih Departemen</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id} className="bg-[#18181b] text-white">
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Level</label>
                <input
                  type="text"
                  required
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: Senior, Lead"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Tunjangan Pokok (Opsional)</label>
                <input
                  type="number"
                  value={editBaseAllowance}
                  onChange={(e) => setEditBaseAllowance(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: 1500000"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Tambah Jabatan Baru</h2>
            <p className="text-sm text-zinc-400 mb-6">Masukkan nama dan detail jabatan yang akan ditambahkan ke sistem.</p>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: IT Web Developer"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Deskripsi (Opsional)</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Deskripsi tugas jabatan..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Departemen</label>
                <select
                  required
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#18181b] p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                >
                  <option value="" disabled className="bg-[#18181b] text-white">Pilih Departemen</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id} className="bg-[#18181b] text-white">
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Level</label>
                <input
                  type="text"
                  required
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: Junior, Middle, Senior"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Tunjangan Pokok (Opsional)</label>
                <input
                  type="number"
                  value={newBaseAllowance}
                  onChange={(e) => setNewBaseAllowance(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: 1500000"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
