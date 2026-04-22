"use client";

import { ChevronDown, ChevronUp, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

export function MobileAttendanceActions() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mt-2 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <button
        id="attendance-dropdown-toggle"
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mb-3 inline-flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-black/30"
      >
        <span>{expanded ? "Sembunyikan opsi" : "Tampilkan opsi absensi"}</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            id="attendance-clock-in-button"
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            <LogIn className="h-4 w-4" />
            Clock In
          </button>
          <button
            id="attendance-clock-out-button"
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-400 px-4 py-4 text-sm font-semibold text-rose-950 transition hover:bg-rose-300"
          >
            <LogOut className="h-4 w-4" />
            Clock Out
          </button>
        </div>
      ) : (
        <button
          id="attendance-single-clock-in-button"
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
        >
          <LogIn className="h-4 w-4" />
          Clock In
        </button>
      )}
    </section>
  );
}
