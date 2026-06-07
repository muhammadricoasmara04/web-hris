"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, Loader2, MapPin, Pencil, Navigation } from "lucide-react";
import { getAllOffices, createOffice, updateOffice, deleteOffice, RadiusOffice } from "@/services/officeService";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";

const OfficeMap = dynamic(() => import("@/components/office/office-map"), {
  ssr: false,
});

export default function DataOfficePage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newLat, setNewLat] = useState(-6.200000);
  const [newLng, setNewLng] = useState(106.816666);
  const [newRadius, setNewRadius] = useState(100);

  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editLat, setEditLat] = useState(-6.200000);
  const [editLng, setEditLng] = useState(106.816666);
  const [editRadius, setEditRadius] = useState(100);

  // Address search states
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [isSearchingAddLoc, setIsSearchingAddLoc] = useState(false);
  const [editSearchQuery, setEditSearchQuery] = useState("");
  const [isSearchingEditLoc, setIsSearchingEditLoc] = useState(false);

  const handleGeocodeSearch = async (query: string, isEdit: boolean) => {
    if (!query.trim()) return;
    if (isEdit) setIsSearchingEditLoc(true);
    else setIsSearchingAddLoc(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (isEdit) {
          setEditLat(Number(lat));
          setEditLng(Number(lon));
        } else {
          setNewLat(Number(lat));
          setNewLng(Number(lon));
        }
      } else {
        Swal.fire({
          title: "Tidak Ditemukan!",
          text: "Alamat atau lokasi tidak ditemukan.",
          icon: "warning",
          background: "#18181b",
          color: "#fff",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal menghubungi layanan pencari koordinat.",
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    } finally {
      if (isEdit) setIsSearchingEditLoc(false);
      else setIsSearchingAddLoc(false);
    }
  };

  const { data: offices = [], isLoading, isError } = useQuery({
    queryKey: ["offices"],
    queryFn: getAllOffices,
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setIsAddModalOpen(false);
      setNewName("");
      setNewLat(-6.200000);
      setNewLng(106.816666);
      setNewRadius(100);
      Swal.fire({
        title: "Berhasil!",
        text: "Radius kantor baru berhasil disimpan.",
        icon: "success",
        background: "#18181b",
        color: "#fff",
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Gagal menyimpan data.",
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<RadiusOffice, "id">> }) =>
      updateOffice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      setIsEditModalOpen(false);
      setEditId("");
      setEditName("");
      setEditLat(-6.200000);
      setEditLng(106.816666);
      setEditRadius(100);
      Swal.fire({
        title: "Berhasil!",
        text: "Radius kantor berhasil diperbarui.",
        icon: "success",
        background: "#18181b",
        color: "#fff",
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Gagal memperbarui data.",
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
      Swal.fire({
        title: "Terhapus!",
        text: "Radius kantor berhasil dihapus.",
        icon: "success",
        background: "#18181b",
        color: "#fff",
      });
    },
    onError: (err: any) => {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Gagal menghapus data.",
        icon: "error",
        background: "#18181b",
        color: "#fff",
      });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName,
      latitude: newLat,
      longitude: newLng,
      radius: newRadius,
    });
  };

  const handleEditClick = (office: RadiusOffice) => {
    setEditId(office.id);
    setEditName(office.name);
    setEditLat(office.latitude);
    setEditLng(office.longitude);
    setEditRadius(office.radius);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateMutation.mutate({
      id: editId,
      payload: {
        name: editName,
        latitude: editLat,
        longitude: editLng,
        radius: editRadius,
      },
    });
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: "Hapus Radius Kantor?",
      text: `Apakah Anda yakin ingin menghapus "${name}"? Karyawan yang terhubung dengan kantor ini mungkin tidak bisa melakukan absensi.`,
      icon: "warning",
      showCancelButton: true,
      background: "#18181b",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const filteredOffices = offices.filter((o) =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Master Data</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Radius Kantor</h1>
            <p className="mt-2 text-sm text-zinc-300">
              Kelola lokasi kantor, titik koordinat GPS, serta batas radius jangkauan absensi masuk & pulang karyawan.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-sky-400 active:scale-95 cursor-pointer"
          >
            <Plus className="h-5 w-5" /> Tambah Kantor
          </button>
        </div>
      </header>

      {/* List / Search Section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 max-w-md">
          <div className="inline-flex w-full items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
            <Search className="h-4 w-4 text-sky-300" />
            <input
              type="text"
              placeholder="Cari lokasi kantor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-300">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            <p className="mt-2 text-sm">Memuat lokasi kantor...</p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">
            Gagal mengambil data lokasi kantor dari server.
          </div>
        ) : filteredOffices.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">
            Tidak ada lokasi kantor yang ditemukan.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOffices.map((office) => (
              <div
                key={office.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 p-5 transition hover:border-sky-500/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-300">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{office.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Radius: {office.radius} meter</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-white/5 pt-4 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Latitude:</span>
                    <span className="text-zinc-200">{office.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude:</span>
                    <span className="text-zinc-200">{office.longitude.toFixed(6)}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => handleEditClick(office)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/10 transition cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(office.id, office.name)}
                    className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c1222] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
              <Navigation className="h-5 w-5 text-sky-400" /> Tambah Radius Kantor
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Nama Lokasi Kantor
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kantor Pusat Jakarta"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Radius Jangkauan Absensi (meter)
                  <input
                    type="number"
                    required
                    min={5}
                    max={10000}
                    value={newRadius}
                    onChange={(e) => setNewRadius(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Latitude
                  <input
                    type="number"
                    step="any"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 font-mono"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Longitude
                  <input
                    type="number"
                    step="any"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 font-mono"
                  />
                </label>
              </div>

              {/* Search Address Bar */}
              <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
                Cari Alamat / Nama Lokasi
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Gedung Cyber 1, Jakarta Selatan..."
                    value={addSearchQuery}
                    onChange={(e) => setAddSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleGeocodeSearch(addSearchQuery, false);
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    disabled={isSearchingAddLoc}
                    onClick={() => handleGeocodeSearch(addSearchQuery, false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-4 py-2 text-xs font-semibold border border-sky-500/20 transition cursor-pointer"
                  >
                    {isSearchingAddLoc ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Cari
                  </button>
                </div>
              </div>

              {/* Map Preview */}
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">Klik Peta untuk Mengatur Titik Koordinat</p>
                <OfficeMap
                  lat={newLat}
                  lng={newLng}
                  radius={newRadius}
                  onChange={(lat, lng) => {
                    setNewLat(lat);
                    setNewLng(lng);
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-sky-400 disabled:opacity-50 cursor-pointer"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Kantor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c1222] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
              <Pencil className="h-5 w-5 text-sky-400" /> Edit Radius Kantor
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Nama Lokasi Kantor
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Radius Jangkauan Absensi (meter)
                  <input
                    type="number"
                    required
                    min={5}
                    max={10000}
                    value={editRadius}
                    onChange={(e) => setEditRadius(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Latitude
                  <input
                    type="number"
                    step="any"
                    required
                    value={editLat}
                    onChange={(e) => setEditLat(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 font-mono"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
                  Longitude
                  <input
                    type="number"
                    step="any"
                    required
                    value={editLng}
                    onChange={(e) => setEditLng(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500 font-mono"
                  />
                </label>
              </div>

              {/* Search Address Bar */}
              <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
                Cari Alamat / Nama Lokasi
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Gedung Cyber 1, Jakarta Selatan..."
                    value={editSearchQuery}
                    onChange={(e) => setEditSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleGeocodeSearch(editSearchQuery, true);
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    disabled={isSearchingEditLoc}
                    onClick={() => handleGeocodeSearch(editSearchQuery, true)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-4 py-2 text-xs font-semibold border border-sky-500/20 transition cursor-pointer"
                  >
                    {isSearchingEditLoc ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Cari
                  </button>
                </div>
              </div>

              {/* Map Preview */}
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">Klik Peta untuk Mengatur Titik Koordinat</p>
                <OfficeMap
                  lat={editLat}
                  lng={editLng}
                  radius={editRadius}
                  onChange={(lat, lng) => {
                    setEditLat(lat);
                    setEditLng(lng);
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-sky-400 disabled:opacity-50 cursor-pointer"
                >
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
