"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  Search,
  UserCheck,
  UsersRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  getAllLeaveRequests,
  updateLeaveStatus,
  type LeaveSubmissionItem,
} from "@/services/leaveService";
import { dateFormater } from "@/utils/dateFormater";
import modal from "@/constants/modal";
import Loader from "@/components/ui/loader-15";

const statusBadgeClass: Record<string, string> = {
  approved: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  rejected: "border-rose-400/30 bg-rose-400/15 text-rose-300",
  cancelled: "border-rose-400/30 bg-rose-400/15 text-rose-300",
  pending: "border-amber-400/30 bg-amber-400/15 text-amber-300",
};

const getStatusLabel = (status: string) => {
  const lower = status.toLowerCase();
  if (lower === "approved") return "Disetujui";
  if (lower === "rejected") return "Ditolak";
  if (lower === "cancelled") return "Dibatalkan";
  return "Menunggu";
};

const getLeaveTypeLabel = (type: string) => {
  const lower = type.toLowerCase();
  if (lower === "sick") return "Sakit";
  if (lower === "permit") return "Izin";
  return "Cuti Tahunan";
};

export default function HrLeaveRequestsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<LeaveSubmissionItem | null>(null);

  const leavesQuery = useQuery({
    queryKey: ["leaves", "all"],
    queryFn: getAllLeaveRequests,
    staleTime: 30 * 1000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (variables: { id: string | number; status: "approved" | "rejected"; reason?: string }) =>
      updateLeaveStatus(variables.id, { status: variables.status, reason: variables.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      setSelectedRequest(null);
    },
  });

  const handleApprove = async (id: string | number) => {
    const confirmResult = await modal.confirm({
      title: "Setujui Pengajuan Cuti?",
      text: "Apakah Anda yakin ingin menyetujui pengajuan cuti ini?",
      confirmButtonText: "Ya, Setujui",
      cancelButtonText: "Batal",
      confirmButtonColor: "#22C55E",
    });

    if (confirmResult.isConfirmed) {
      try {
        await updateStatusMutation.mutateAsync({ id, status: "approved" });
        modal.success("Berhasil", "Pengajuan berhasil disetujui.");
      } catch (error) {
        modal.error("Gagal", error instanceof Error ? error.message : "Terjadi kesalahan.");
      }
    }
  };

  const handleReject = async (id: string | number) => {
    // Show SweetAlert prompting for rejection reason
    const { value: reasonText, isConfirmed } = await Swal.fire({
      title: "Tolak Pengajuan?",
      text: "Berikan alasan penolakan pengajuan ini:",
      input: "textarea",
      inputPlaceholder: "Tuliskan alasan penolakan di sini...",
      inputAttributes: {
        "aria-label": "Tuliskan alasan penolakan",
      },
      showCancelButton: true,
      background: "#0B1220",
      color: "#E2E8F0",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#3F3F46",
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value) {
          return "Alasan penolakan wajib diisi!";
        }
        return null;
      },
    });

    if (isConfirmed && reasonText) {
      try {
        await updateStatusMutation.mutateAsync({ id, status: "rejected", reason: reasonText });
        modal.success("Berhasil", "Pengajuan berhasil ditolak.");
      } catch (error) {
        modal.error("Gagal", error instanceof Error ? error.message : "Terjadi kesalahan.");
      }
    }
  };

  const processedLeaves = useMemo(() => {
    const data = leavesQuery.data ?? [];
    return data
      .filter((item) => {
        // Status filter
        if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter) return false;
        // Type filter
        if (typeFilter !== "all" && item.type.toLowerCase() !== typeFilter) return false;
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = (item.employeeName || "").toLowerCase().includes(q);
          const reasonMatch = (item.reason || "").toLowerCase().includes(q);
          return nameMatch || reasonMatch;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.startDate || 0).getTime();
        const timeB = new Date(b.createdAt || b.startDate || 0).getTime();
        return timeB - timeA;
      });
  }, [leavesQuery.data, searchQuery, statusFilter, typeFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const data = leavesQuery.data ?? [];
    return {
      total: data.length,
      pending: data.filter((item) => item.status.toLowerCase() === "pending").length,
      approved: data.filter((item) => item.status.toLowerCase() === "approved").length,
      rejected: data.filter((item) => item.status.toLowerCase() === "rejected" || item.status.toLowerCase() === "cancelled").length,
    };
  }, [leavesQuery.data]);

  const isLoading = leavesQuery.isLoading;
  const isPendingMutation = updateStatusMutation.isPending;

  return (
    <div className="space-y-6 pb-20 pt-20">
      {/* Header & stats */}
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">HR Operations</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Kelola Pengajuan Cuti & Izin</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Review, setujui, atau tolak pengajuan cuti tahunan, sakit, dan izin dari seluruh karyawan.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <UsersRound className="mb-2 h-5 w-5 text-sky-300" />
            <p className="text-xs text-zinc-400">Total Pengajuan</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <Clock3 className="mb-2 h-5 w-5 text-amber-300" />
            <p className="text-xs text-zinc-400">Menunggu Review</p>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <UserCheck className="mb-2 h-5 w-5 text-emerald-300" />
            <p className="text-xs text-zinc-400">Disetujui</p>
            <p className="text-2xl font-bold text-white">{stats.approved}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <XCircle className="mb-2 h-5 w-5 text-rose-300" />
            <p className="text-xs text-zinc-400">Ditolak / Batal</p>
            <p className="text-2xl font-bold text-white">{stats.rejected}</p>
          </div>
        </div>
      </header>

      {/* Filter & Table section */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Tipe Pengajuan
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="annual">Cuti Tahunan</option>
              <option value="sick">Sakit</option>
              <option value="permit">Izin</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-zinc-300 md:col-span-2">
            Cari Karyawan / Alasan
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search className="h-4 w-4 text-sky-300" />
              <input
                type="text"
                placeholder="Ketik nama karyawan atau alasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </div>
          </label>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">
            Memuat data pengajuan...
          </div>
        ) : leavesQuery.isError ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-center text-rose-200">
            Gagal memuat data pengajuan cuti.
          </div>
        ) : processedLeaves.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-zinc-300">
            Tidak ada pengajuan ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="px-3 py-3 font-semibold">Nama Karyawan</th>
                  <th className="px-3 py-3 font-semibold">Tipe</th>
                  <th className="px-3 py-3 font-semibold">Tanggal</th>
                  <th className="px-3 py-3 font-semibold">Alasan</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {processedLeaves.map((item, index) => {
                  const isPending = item.status.toLowerCase() === "pending";
                  return (
                    <tr
                      key={item.id ?? index}
                      className="border-b border-white/5 text-zinc-200 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-3 py-3">
                        <span className="font-semibold text-white">{item.employeeName || "Staf"}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-zinc-400">
                        {getLeaveTypeLabel(item.type)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-zinc-400">
                        {dateFormater(item.startDate)} s/d {dateFormater(item.endDate)}
                      </td>
                      <td className="px-3 py-3 max-w-[200px] truncate text-zinc-300" title={item.reason}>
                        {item.reason}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            statusBadgeClass[item.status.toLowerCase()] || statusBadgeClass.pending
                          }`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(item)}
                            className="inline-flex items-center justify-center rounded-lg bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                            title="Detail Pengajuan"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id!)}
                                className="inline-flex items-center justify-center rounded-lg bg-emerald-500/10 p-2 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                                title="Setujui"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(item.id!)}
                                className="inline-flex items-center justify-center rounded-lg bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                                title="Tolak"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Detail Pengajuan</h2>
            <p className="text-sm text-zinc-400 mb-6">Informasi lengkap permohonan izin/cuti karyawan.</p>

            <div className="space-y-4 text-sm text-zinc-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Nama Karyawan</p>
                  <p className="mt-1 font-semibold text-white">{selectedRequest.employeeName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Tipe Pengajuan</p>
                  <p className="mt-1 font-semibold text-white">{getLeaveTypeLabel(selectedRequest.type)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Tanggal Mulai</p>
                  <p className="mt-1 text-white">{dateFormater(selectedRequest.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Tanggal Selesai</p>
                  <p className="mt-1 text-white">{dateFormater(selectedRequest.endDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase">Alasan</p>
                <p className="mt-1 text-zinc-300 leading-relaxed">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.rejectionReason && (
                <div className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-3 text-rose-200">
                  <p className="text-xs uppercase font-semibold">Alasan Penolakan</p>
                  <p className="mt-1">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {(selectedRequest.attachmentUrl || selectedRequest.proofUrl) && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Dokumen Lampiran</p>
                  <Link
                    href={selectedRequest.attachmentUrl || selectedRequest.proofUrl || "#"}
                    target="_blank"
                    className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-sky-400 transition hover:bg-white/10 hover:text-sky-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka Dokumen Pendukung
                  </Link>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  Tutup
                </button>
                {selectedRequest.status.toLowerCase() === "pending" && (
                  <>
                    <button
                      onClick={() => handleReject(selectedRequest.id!)}
                      className="rounded-xl bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/30 transition-colors"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id!)}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
                    >
                      Setujui
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global pending operations loader */}
      {isPendingMutation && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 blur-xl pointer-events-none" />
            <div className="relative scale-[0.4] -my-14 flex items-center justify-center">
              <Loader />
            </div>
            <div className="text-center z-10">
              <p className="text-sm font-semibold tracking-wider text-white">Memproses Permintaan</p>
              <span className="mt-1 block text-xs text-zinc-400">Sedang memperbarui status pengajuan...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
