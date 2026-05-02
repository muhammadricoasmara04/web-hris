"use client";

import {
  getMyLeaveBalance,
  getMyLeaveRequests,
  LeaveType,
  submitLeaveRequest,
} from "@/services/leaveService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ClipboardList, Send, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function LeavePage() {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<LeaveType>("annual");
  const [reason, setReason] = useState("");

  const balanceQuery = useQuery({ queryKey: ["leave-balance"], queryFn: getMyLeaveBalance });
  const requestsQuery = useQuery({ queryKey: ["leave-requests"], queryFn: getMyLeaveRequests });

  const submitMutation = useMutation({
    mutationFn: submitLeaveRequest,
    onSuccess: async () => {
      setStartDate("");
      setEndDate("");
      setType("annual");
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    await submitMutation.mutateAsync({ startDate, endDate, type, reason: reason.trim() });
  };

  return (
    <main className="min-h-screen text-white">
      <section className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h1 className="text-3xl font-bold">Pengajuan Cuti</h1>
          <p className="mt-1 text-sm text-zinc-300">Ajukan cuti, pantau status, dan cek sisa saldo cuti kamu.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total", value: balanceQuery.data?.total ?? "-" },
            { label: "Terpakai", value: balanceQuery.data?.used ?? "-" },
            { label: "Tersisa", value: balanceQuery.data?.remaining ?? "-" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-400">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-sky-300">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <p className="text-sm font-semibold">Form Pengajuan</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-zinc-300">Tanggal Mulai
                <input id="leave-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 [color-scheme:dark]" />
              </label>
              <label className="text-xs text-zinc-300">Tanggal Selesai
                <input id="leave-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 [color-scheme:dark]" />
              </label>
            </div>
            <label className="text-xs text-zinc-300">Jenis Cuti
              <select id="leave-type" value={type} onChange={(e) => setType(e.target.value as LeaveType)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                <option value="annual">Tahunan</option>
                <option value="sick">Sakit</option>
                <option value="permit">Izin</option>
              </select>
            </label>
            <label className="text-xs text-zinc-300">Alasan
              <textarea id="leave-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2" />
            </label>
            <button id="leave-submit" type="submit" disabled={submitMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">
              <Send className="h-4 w-4" /> Kirim Pengajuan
            </button>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4" />Pengajuan Terakhir</p>
            <div className="space-y-2">
              {requestsQuery.data?.length ? requestsQuery.data.slice(0, 6).map((item, idx) => {
                const approved = item.status === "approved";
                const rejected = item.status === "rejected";
                return (
                  <article key={String(item.id ?? idx)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-xs text-zinc-300">{item.startDate} s/d {item.endDate}</p>
                    <p className="mt-1 text-sm font-semibold">{item.reason}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs">
                      {approved ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : rejected ? <XCircle className="h-3.5 w-3.5 text-rose-300" /> : <CalendarDays className="h-3.5 w-3.5 text-amber-200" />}
                      {item.status}
                    </p>
                  </article>
                );
              }) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-zinc-400">Belum ada pengajuan cuti.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
