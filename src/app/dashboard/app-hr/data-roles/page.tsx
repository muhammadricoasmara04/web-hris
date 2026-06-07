"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, Loader2, ShieldCheck, Pencil } from "lucide-react";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";
import { formatDate } from "@/utils/formatDate";
import Swal from "sweetalert2";

const permissionLabels: Record<string, string> = {
  "VIEW_DASHBOARD_HR": "Akses Dashboard HR",
  "VIEW_DASHBOARD_ADMIN": "Akses Dashboard Admin",
  "MANAGE_EMPLOYEE": "Kelola Data Karyawan",
  "MANAGE_ROLE": "Kelola Role Sistem",
  "MANAGE_DEPARTMENT": "Kelola Departemen",
  "MANAGE_POSITION": "Kelola Jabatan",
  "MANAGE_ATTENDANCE": "Kelola Absensi Karyawan",
  "MANAGE_PAYROLL": "Kelola Payroll & Gaji",
};

function formatPermission(action: string) {
  return permissionLabels[action] || action.replace(/_/g, " ");
}

export default function DataRolesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState("");
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");
  const [editRolePermissions, setEditRolePermissions] = useState<string[]>([]);

  const { data: roles = [], isLoading, isError } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/roles"));
      if (!res.ok) throw new Error("Gagal memuat roles");
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    },
    staleTime: 60 * 1000,
  });

  const { data: allPermissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/permissions"));
      if (!res.ok) return [];
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const toggleNewPermission = (id: string) => {
    setNewRolePermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleEditPermission = (id: string) => {
    setEditRolePermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string, permissionIds?: string[] }) => {
      const res = await authFetch(buildApiUrl("/api/roles"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menambah role");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsAddModalOpen(false);
      setNewRoleName("");
      setNewRoleDesc("");
      setNewRolePermissions([]);
      Swal.fire({
        title: "Berhasil!",
        text: "Role berhasil ditambahkan.",
        icon: "success",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal!",
        text: err.message,
        icon: "error",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description?: string, permissionIds?: string[] }) => {
      const { id, ...payload } = data;
      const res = await authFetch(buildApiUrl(`/api/roles/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengubah role");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsEditModalOpen(false);
      setEditRoleId("");
      setEditRoleName("");
      setEditRoleDesc("");
      setEditRolePermissions([]);
      Swal.fire({
        title: "Berhasil!",
        text: "Role berhasil diperbarui.",
        icon: "success",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal!",
        text: err.message,
        icon: "error",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(buildApiUrl(`/api/roles/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menghapus role");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      Swal.fire({
        title: "Berhasil!",
        text: "Role berhasil dihapus.",
        icon: "success",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal!",
        text: err.message,
        icon: "error",
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9',
      });
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    createMutation.mutate({ 
      name: newRoleName, 
      description: newRoleDesc,
      permissionIds: newRolePermissions 
    });
  };

  const handleEditClick = (role: any) => {
    setEditRoleId(role.id);
    setEditRoleName(role.name || "");
    setEditRoleDesc(role.description || "");
    setEditRolePermissions(role.permissions?.map((p: any) => p.id) || []);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleName.trim()) return;
    updateMutation.mutate({ 
      id: editRoleId, 
      name: editRoleName, 
      description: editRoleDesc,
      permissionIds: editRolePermissions 
    });
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: 'Hapus Role?',
      text: `Apakah Anda yakin ingin menghapus role "${name}"?`,
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

  const filteredData = roles.filter((role) => 
    (role.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">HR Master Data</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Data Roles</h1>
            <p className="mt-2 text-sm text-zinc-300">Kelola daftar hak akses (Role) di sistem Anda.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            Tambah Role
          </button>
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <ShieldCheck className="mb-2 h-5 w-5 text-sky-300" />
            <p className="text-xs text-zinc-400">Total Role Terdaftar</p>
            <p className="text-2xl font-bold text-white">{roles.length}</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Cari Role
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
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Memuat data role...</div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">Gagal memuat data role.</div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">Data role tidak ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-3 py-3 font-semibold">Nama Role</th>
                  <th className="px-3 py-3 font-semibold">Deskripsi</th>
                  <th className="px-3 py-3 font-semibold">Dibuat Pada</th>
                  <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((role) => (
                  <tr key={role.id} className="border-b border-white/5 text-zinc-200 hover:bg-white/5 transition-colors">
                    <td className="px-3 py-3 font-medium text-white">
                      {role.name}
                      {role.permissions && role.permissions.length > 0 && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                          {role.permissions.length} Hak Akses
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-zinc-400">{role.description || "-"}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-zinc-400">
                      {role.createdAt ? formatDate(role.createdAt, true) : "-"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(role)}
                          className="inline-flex items-center justify-center rounded-lg bg-sky-500/10 p-2 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
                          title="Edit Role"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors disabled:opacity-50"
                          title="Hapus Role"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl my-8">
            <h2 className="text-xl font-bold text-white mb-2">Edit Role</h2>
            <p className="text-sm text-zinc-400 mb-6">Ubah data role yang dipilih.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Nama Role</label>
                <input
                  type="text"
                  required
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Deskripsi (Opsional)</label>
                <textarea
                  rows={2}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
                  Matrix Hak Akses (Permissions)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {allPermissions.length === 0 ? (
                    <p className="text-sm text-zinc-500 col-span-2">Belum ada permission di sistem.</p>
                  ) : (
                    allPermissions.map((perm) => (
                      <label 
                        key={perm.id} 
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                          editRolePermissions.includes(perm.id) 
                            ? "border-sky-500/50 bg-sky-500/10" 
                            : "border-white/5 bg-black/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-white/10 bg-black/50 text-sky-500 focus:ring-sky-500/50 focus:ring-offset-0"
                            checked={editRolePermissions.includes(perm.id)}
                            onChange={() => toggleEditPermission(perm.id)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${editRolePermissions.includes(perm.id) ? "text-sky-100" : "text-zinc-300"}`}>
                            {formatPermission(perm.action)}
                          </span>
                          {perm.description && (
                            <span className="text-xs text-zinc-500 mt-0.5 leading-tight">
                              {perm.description}
                            </span>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl my-8">
            <h2 className="text-xl font-bold text-white mb-2">Tambah Role Baru</h2>
            <p className="text-sm text-zinc-400 mb-6">Masukkan nama dan deskripsi role yang akan ditambahkan ke sistem.</p>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Nama Role</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Contoh: SUPERADMIN, HR, MANAGER"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Deskripsi (Opsional)</label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                  placeholder="Deskripsi hak akses..."
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-zinc-300 border-b border-white/10 pb-2">
                  Matrix Hak Akses (Permissions)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {allPermissions.length === 0 ? (
                    <p className="text-sm text-zinc-500 col-span-2">Belum ada permission di sistem.</p>
                  ) : (
                    allPermissions.map((perm) => (
                      <label 
                        key={perm.id} 
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                          newRolePermissions.includes(perm.id) 
                            ? "border-sky-500/50 bg-sky-500/10" 
                            : "border-white/5 bg-black/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-white/10 bg-black/50 text-sky-500 focus:ring-sky-500/50 focus:ring-offset-0"
                            checked={newRolePermissions.includes(perm.id)}
                            onChange={() => toggleNewPermission(perm.id)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${newRolePermissions.includes(perm.id) ? "text-sky-100" : "text-zinc-300"}`}>
                            {formatPermission(perm.action)}
                          </span>
                          {perm.description && (
                            <span className="text-xs text-zinc-500 mt-0.5 leading-tight">
                              {perm.description}
                            </span>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
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
