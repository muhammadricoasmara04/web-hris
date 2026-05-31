"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, Loader2, Building, Pencil } from "lucide-react";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";
import { formatDate } from "@/utils/formatDate";
import Swal from "sweetalert2";

export default function DataDepartmentsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDeptId, setEditDeptId] = useState("");
  const [editDeptCode, setEditDeptCode] = useState("");
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptDesc, setEditDeptDesc] = useState("");

  const { data: departments = [], isLoading, isError } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/departments"));
      if (!res.ok) throw new Error("Gagal memuat departemen");
      const json = await res.json();
      // Adjusting to common API response shapes, either json is an array or json.data is an array
      return (Array.isArray(json) ? json : json.data || []) as any[];
    },
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { code: string; name: string; description?: string }) => {
      const res = await authFetch(buildApiUrl("/api/departments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menambah departemen");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsAddModalOpen(false);
      setNewDeptCode("");
      setNewDeptName("");
      setNewDeptDesc("");
    },
    onError: (err: any) => {
      alert(err.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; code: string; name: string; description?: string }) => {
      const { id, ...payload } = data;
      const res = await authFetch(buildApiUrl(`/api/departments/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengubah departemen");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsEditModalOpen(false);
      setEditDeptId("");
      setEditDeptCode("");
      setEditDeptName("");
      setEditDeptDesc("");
    },
    onError: (err: any) => {
      alert(err.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(buildApiUrl(`/api/departments/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghapus departemen");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (err: any) => {
      alert(err.message);
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode.trim() || !newDeptName.trim()) return;
    createMutation.mutate({ code: newDeptCode, name: newDeptName, description: newDeptDesc });
  };

  const handleEditClick = (dept: any) => {
    setEditDeptId(dept.id);
    setEditDeptCode(dept.code || "");
    setEditDeptName(dept.name || "");
    setEditDeptDesc(dept.description || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeptCode.trim() || !editDeptName.trim()) return;
    updateMutation.mutate({ id: editDeptId, code: editDeptCode, name: editDeptName, description: editDeptDesc });
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: 'Hapus Departemen?',
      text: `Apakah Anda yakin ingin menghapus departemen "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      background: '#18181b',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const filteredData = departments.filter((dept) => 
    (dept.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">HR Master Data</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Data Departemen</h1>
            <p className="mt-2 text-sm text-zinc-300">Kelola daftar departemen di perusahaan Anda.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            Tambah Departemen
          </button>
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <Building className="mb-2 h-5 w-5 text-sky-300" />
            <p className="text-xs text-zinc-400">Total Departemen</p>
            <p className="text-2xl font-bold text-white">{departments.length}</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Cari Departemen
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
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Memuat data departemen...</div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">Gagal memuat data departemen.</div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Data departemen tidak ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-3 py-3 font-semibold">Kode</th>
                  <th className="px-3 py-3 font-semibold">Nama Departemen</th>
                  <th className="px-3 py-3 font-semibold">Deskripsi</th>
                  <th className="px-3 py-3 font-semibold">Dibuat Pada</th>
                  <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((dept) => (
                  <tr key={dept.id} className="border-b border-white/5 text-zinc-200 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs text-zinc-400">{dept.code || "-"}</td>
                    <td className="px-3 py-3 font-medium text-white">{dept.name}</td>
                    <td className="px-3 py-3 text-zinc-400">{dept.description || "-"}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-zinc-400">
                      {dept.createdAt ? formatDate(dept.createdAt, true) : "-"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="inline-flex items-center justify-center rounded-lg bg-sky-500/10 p-2 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
                          title="Edit Departemen"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id, dept.name)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors disabled:opacity-50"
                          title="Hapus Departemen"
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
            <h2 className="text-xl font-bold text-white mb-2">Edit Departemen</h2>
            <p className="text-sm text-zinc-400 mb-6">Ubah data departemen yang dipilih.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Kode Departemen</label>
                <input
                  type="text"
                  required
                  value={editDeptCode}
                  onChange={(e) => setEditDeptCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Nama Departemen</label>
                <input
                  type="text"
                  required
                  value={editDeptName}
                  onChange={(e) => setEditDeptName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Deskripsi (Opsional)</label>
                <textarea
                  rows={3}
                  value={editDeptDesc}
                  onChange={(e) => setEditDeptDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
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
            <h2 className="text-xl font-bold text-white mb-2">Tambah Departemen Baru</h2>
            <p className="text-sm text-zinc-400 mb-6">Masukkan nama dan deskripsi departemen yang akan ditambahkan ke sistem.</p>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Kode Departemen</label>
                <input
                  type="text"
                  required
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: IT"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Nama Departemen</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: Engineering"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Deskripsi (Opsional)</label>
                <textarea
                  rows={3}
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Departemen yang mengurus..."
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
