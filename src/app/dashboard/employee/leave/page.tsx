"use client";

import { useMyLeave } from "@/hooks/leave/use-leave";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Eye,
  HeartPulse,
  ImagePlus,
  Send,
  Stethoscope,
  Trash2,
  Umbrella,
  X,
  XCircle,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import type { LeaveSubmissionItem, LeaveType } from "@/services/leaveService";
import { dateFormater } from "@/utils/dateFormater";

/* ─── Tab definitions ─── */
type TabId = "sick" | "annual" | "permit";

const TABS: { id: TabId; label: string; icon: typeof HeartPulse }[] = [
  { id: "sick", label: "Sakit", icon: Stethoscope },
  { id: "annual", label: "Cuti", icon: Umbrella },
  { id: "permit", label: "Izin", icon: AlertTriangle },
];

const TAB_META: Record<TabId, { title: string; desc: string; attachmentLabel?: string }> = {
  sick: {
    title: "Pengajuan Sakit",
    desc: "Ajukan cuti karena sakit dan lampirkan surat dokter.",
    attachmentLabel: "Lampiran surat dokter",
  },
  annual: {
    title: "Pengajuan Cuti Tahunan",
    desc: "Ajukan cuti tahunan, pantau sisa saldo, dan status persetujuan.",
  },
  permit: {
    title: "Pengajuan Izin",
    desc: "Ajukan izin keperluan pribadi atau hal mendesak lainnya dengan bukti lampiran.",
    attachmentLabel: "Lampiran bukti izin",
  },
};

/* ─── Helpers ─── */
const TYPE_MAP: Record<TabId, LeaveType> = {
  sick: "sick",
  annual: "annual",
  permit: "permit",
};

const getStatusLabel = (status: string) =>
  status === "approved" ? "Disetujui" : status === "rejected" ? "Ditolak" : "Menunggu";

const getAttachmentHref = (item: LeaveSubmissionItem) => item.attachmentUrl || item.proofUrl;

/* ─── Page ─── */
export default function LeavePage() {
  const {
    balanceQuery,
    requestsQuery,
    submitMutation,
    deleteMutation,
    balance,
    requests,
    isSubmitting,
  } = useMyLeave();

  const [activeTab, setActiveTab] = useState<TabId>("sick");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LeaveSubmissionItem | null>(null);

  const currentType = TYPE_MAP[activeTab];
  const meta = TAB_META[activeTab];
  const needsAttachment = activeTab === "sick" || activeTab === "permit";

  /* Filtered requests for active tab */
  const filteredRequests = requests.filter((r) => r.type === currentType);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    if (needsAttachment && !attachment) {
      setAttachmentError(`${meta.attachmentLabel} wajib diunggah.`);
      return;
    }

    await submitMutation.mutateAsync({
      startDate,
      endDate,
      type: currentType,
      reason: reason.trim(),
      attachment: needsAttachment ? attachment : null,
    });
    setStartDate("");
    setEndDate("");
    setReason("");
    setAttachment(null);
    setAttachmentError("");
  };

  const handleDelete = async (id: string | number) => {
    await deleteMutation.mutateAsync(id);
  };

  const loading = balanceQuery.isLoading || requestsQuery.isLoading;

  return (
    <main className="min-h-screen text-white">
      <section className="mx-auto max-w-5xl space-y-4">
        {/* ── Header ── */}
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h1 className="text-3xl font-bold">Pengajuan</h1>
          <p className="mt-1 text-sm text-zinc-300">
            Ajukan sakit, cuti, atau izin — pantau status dan kelola
            pengajuan kamu.
          </p>
        </header>

        {/* ── Tabs ── */}
        <div className="flex gap-2" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`leave-tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.id);
                  setAttachment(null);
                  setAttachmentError("");
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sky-500/20 text-sky-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]"
                    : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Stats cards ── */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Kuota", value: balance.total ?? "-" },
            { label: "Terpakai", value: balance.used ?? "-" },
            { label: "Tersisa", value: balance.remaining ?? "-" },
            {
              label: "Menunggu",
              value: filteredRequests.filter((r) => r.status === "pending")
                .length,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-400">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-sky-300">
                {loading ? (
                  <span className="inline-block h-6 w-10 animate-pulse rounded bg-white/10" />
                ) : (
                  item.value
                )}
              </p>
            </div>
          ))}
        </div>

        {/* ── Content grid ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.05] p-5"
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Send className="h-4 w-4" />
              {meta.title}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-zinc-300">
                Tanggal Mulai
                <input
                  id="leave-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 [color-scheme:dark]"
                />
              </label>
              <label className="text-xs text-zinc-300">
                Tanggal Selesai
                <input
                  id="leave-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 [color-scheme:dark]"
                />
              </label>
            </div>
            <label className="text-xs text-zinc-300">
              Alasan
              <textarea
                id="leave-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder={`Deskripsi ${meta.title.toLowerCase()}...`}
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 placeholder:text-zinc-600"
              />
            </label>

            {needsAttachment ? (
              <label className="block text-xs text-zinc-300">
                {meta.attachmentLabel} <span className="text-rose-300">*</span>
                <div className="mt-1 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-4 transition hover:border-sky-300/40 hover:bg-sky-400/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
                      <ImagePlus className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-100">
                        {attachment ? attachment.name : "Upload foto lampiran"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        Format gambar/PDF, maksimal 5MB.
                      </p>
                    </div>
                  </div>
                  <input
                    id="leave-attachment"
                    type="file"
                    accept="image/*,.pdf"
                    required={needsAttachment}
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file && file.size > 5 * 1024 * 1024) {
                        setAttachment(null);
                        setAttachmentError("Ukuran lampiran maksimal 5MB.");
                        e.currentTarget.value = "";
                        return;
                      }
                      setAttachment(file);
                      setAttachmentError("");
                    }}
                    className="mt-3 block w-full cursor-pointer rounded-xl border border-white/10 bg-black/20 text-xs text-zinc-300 file:mr-3 file:cursor-pointer file:border-0 file:bg-sky-400 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-sky-300"
                  />
                </div>
                {attachmentError ? (
                  <p className="mt-1 text-[11px] text-rose-300">{attachmentError}</p>
                ) : null}
              </label>
            ) : (
              <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-3 text-xs text-emerald-100/80">
                Pengajuan cuti tidak memerlukan lampiran foto.
              </div>
            )}
            <button
              id="leave-submit"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-sky-300 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Mengirim..." : `Kirim ${TABS.find((t) => t.id === activeTab)?.label}`}
            </button>
          </form>

          {/* ── Recent requests (filtered by active tab) ── */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4" />
              Riwayat {TABS.find((t) => t.id === activeTab)?.label}
            </p>
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="mb-1 h-3 w-24 rounded bg-white/10" />
                    <div className="mb-1 h-4 w-full rounded bg-white/10" />
                    <div className="h-3 w-16 rounded bg-white/10" />
                  </div>
                ))
              ) : filteredRequests.length ? (
                filteredRequests.slice(0, 6).map((item, idx) => {
                  const approved = item.status === "approved";
                  const rejected = item.status === "rejected";
                  const pending = item.status === "pending";
                  return (
                    <button
                      type="button"
                      key={String(item.id ?? idx)}
                      onClick={() => setSelectedRequest(item)}
                      className="group w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition-all hover:border-sky-300/30 hover:bg-sky-400/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-zinc-300">
                            {dateFormater(item.startDate)} s/d {dateFormater(item.endDate)}
                          </p>
                          {item.createdAt && (
                            <p className="mt-0.5 text-[10px] text-zinc-500">
                              Diajukan: {dateFormater(item.createdAt)}
                            </p>
                          )}
                          <p className="mt-1 line-clamp-2 text-sm font-semibold">
                            {item.reason}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                              {approved ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                              ) : rejected ? (
                                <XCircle className="h-3.5 w-3.5 text-rose-300" />
                              ) : (
                                <CalendarDays className="h-3.5 w-3.5 text-amber-200" />
                              )}
                              {getStatusLabel(item.status)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-sky-200 opacity-80">
                              <Eye className="h-3.5 w-3.5" />
                              Lacak pengajuan
                            </span>
                          </div>
                        </div>

                        {/* Delete — only for pending items */}
                        {pending && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(item.id ?? idx);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleDelete(item.id ?? idx);
                              }
                            }}
                            aria-label="Hapus pengajuan"
                            className="shrink-0 rounded-lg p-1.5 text-zinc-500 opacity-0 transition-all hover:bg-rose-500/20 hover:text-rose-300 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-zinc-400">
                  Belum ada pengajuan{" "}
                  {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()}.
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedRequest ? (
          <div
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-detail-title"
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#080b18]/95 shadow-2xl shadow-sky-950/40">
              <div className="flex items-start justify-between border-b border-white/10 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                    Lacak Pengajuan
                  </p>
                  <h2 id="leave-detail-title" className="mt-1 text-xl font-bold">
                    Detail {TABS.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                </div>
                <button
                  id="leave-detail-close"
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  aria-label="Tutup detail pengajuan"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-[1fr_1.1fr]">
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500">Tanggal</p>
                    <p className="mt-1 text-sm text-zinc-100">
                      {dateFormater(selectedRequest.startDate)} s/d {dateFormater(selectedRequest.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500">Alasan</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-100">{selectedRequest.reason}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500">Status Saat Ini</p>
                    <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                      {selectedRequest.status === "approved" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      ) : selectedRequest.status === "rejected" ? (
                        <XCircle className="h-4 w-4 text-rose-300" />
                      ) : (
                        <CalendarDays className="h-4 w-4 text-amber-200" />
                      )}
                      {getStatusLabel(selectedRequest.status)}
                    </p>
                  </div>
                  {selectedRequest.notes || selectedRequest.rejectionReason ? (
                    <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-3">
                      <p className="text-[11px] uppercase tracking-wider text-amber-200">Catatan HR</p>
                      <p className="mt-1 text-sm text-amber-50/90">
                        {selectedRequest.notes || selectedRequest.rejectionReason}
                      </p>
                    </div>
                  ) : null}
                  {getAttachmentHref(selectedRequest) ? (
                    <a
                      href={getAttachmentHref(selectedRequest)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/15"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Lihat lampiran
                    </a>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="mb-4 text-sm font-semibold">Progress Approval</p>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Pengajuan dibuat",
                        desc: dateFormater(selectedRequest.createdAt ?? ""),
                        done: true,
                        danger: false,
                      },
                      {
                        label: "Menunggu review HR",
                        desc:
                          selectedRequest.status === "pending"
                            ? "Sedang menunggu HR/Admin meninjau pengajuan."
                            : "Pengajuan sudah ditinjau oleh HR/Admin.",
                        done: true,
                        danger: false,
                      },
                      {
                        label: selectedRequest.status === "rejected" ? "Pengajuan ditolak" : "Pengajuan disetujui",
                        desc:
                          selectedRequest.status === "pending"
                            ? "Belum ada keputusan final."
                            : dateFormater(selectedRequest.updatedAt ?? ""),
                        done: selectedRequest.status !== "pending",
                        danger: selectedRequest.status === "rejected",
                      },
                    ].map((step, index) => (
                      <div key={step.label} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={`grid h-7 w-7 place-items-center rounded-full border ${
                              step.done
                                ? step.danger
                                  ? "border-rose-300/40 bg-rose-400/15 text-rose-200"
                                  : "border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
                                : "border-white/15 bg-white/5 text-zinc-500"
                            }`}
                          >
                            {step.done ? (
                              step.danger ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <CalendarDays className="h-4 w-4" />
                            )}
                          </span>
                          {index < 2 ? <span className="h-9 w-px bg-white/10" /> : null}
                        </div>
                        <div className="pb-2">
                          <p className="text-sm font-medium text-zinc-100">{step.label}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
