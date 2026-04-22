"use client";

import { CurrentDate, DigitalClock } from "@/components/attendance/digital-clock";
import { ProfileHeader } from "@/components/attendance/profile-header";
import { CurrentLocationMap } from "@/components/maps/current-location-map";
import { useCurrentLocation } from "@/hooks/maps/use-current-location";
import { ChevronDown, ChevronUp, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

export default function EmployeeAttendancePage() {
  const { coordinates, loading } = useCurrentLocation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* 1. Background Map */}
      <div className="absolute inset-0 h-full w-full">
        <CurrentLocationMap
          center={coordinates}
          loading={loading}
          mapTitle="" // Title is empty as per screenshot design
        />
        {/* Overlay for better readability at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Header Overlay */}
      <ProfileHeader />

      {/* 3. Bottom Sheet Attendance Panel */}
      <div
        className={`absolute bottom-0 left-0 z-[600] w-full transition-all duration-500 ease-in-out ${
          expanded ? "h-[62vh]" : "h-[200px]"
        }`}
      >
        <div className="relative h-full w-full rounded-t-[40px] bg-white/60 backdrop-blur-2xl p-6 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-white/30">
          {/* Toggle Indicator - Floating with Bounce */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute left-1/2 -top-5 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 text-white shadow-[0_10px_25px_rgba(251,191,36,0.4)] transition active:scale-95 animate-bounce"
          >
            {expanded ? <ChevronDown className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
          </button>

          <div className="h-full pb-10 overflow-y-auto pt-4">
            {expanded ? (
              /* EXPANDED VIEW */
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Waktu & Tanggal
                </p>
                <DigitalClock className="mt-0.5 text-5xl font-bold tracking-tight text-zinc-900" />
                <CurrentDate className="mt-0.5 text-[13px] font-medium text-zinc-600" />

                <div className="mt-6 grid w-full grid-cols-2 gap-4 px-2">
                  <button className="flex h-28 flex-col items-center justify-center gap-1 rounded-[28px] bg-emerald-400 p-4 text-emerald-950 transition active:scale-95 shadow-lg shadow-emerald-500/20">
                    <span className="text-lg font-extrabold tracking-tight">Clock In</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">Masuk Kerja</span>
                  </button>
                  <button className="flex h-28 flex-col items-center justify-center gap-1 rounded-[28px] bg-rose-400 p-4 text-rose-950 transition active:scale-95 shadow-lg shadow-rose-500/20">
                    <span className="text-lg font-extrabold tracking-tight">Clock Out</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">Pulang Kerja</span>
                  </button>
                </div>

                {/* Recent History Section */}
                <div className="mt-6 w-full px-2">
                  <div className="flex items-center justify-between px-1 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Riwayat Hari Ini</p>
                    <button className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Lihat Semua</button>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between rounded-2xl bg-white/40 border border-white/50 p-4 backdrop-blur-sm shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-sm">
                           <LogIn className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-zinc-800 leading-none">Check In</span>
                           <span className="text-[10px] font-medium text-zinc-500 mt-1">Kantor Pusat</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-sm font-bold text-zinc-900 leading-none">08:00</span>
                         <span className="text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">On Time</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-white/30 border border-white/40 p-4 backdrop-blur-sm opacity-60">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-200/50 text-zinc-500">
                           <LogOut className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-zinc-500 leading-none italic">Check Out</span>
                           <span className="text-[10px] font-medium text-zinc-400 mt-1">Belum dilakukan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* COLLAPSED VIEW */
              <div className="mt-1 flex items-center justify-between gap-4">
                <button className="flex-1 flex items-center justify-center gap-3 rounded-[24px] bg-emerald-400 py-5 text-emerald-950 transition active:scale-95 shadow-lg shadow-emerald-500/20">
                  <span className="text-xl font-bold">Clock In</span>
                  <span className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">Absen Masuk</span>
                </button>
                <div className="flex flex-col items-end pr-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Waktu & Tanggal</p>
                  <DigitalClock className="text-3xl font-bold tracking-tight text-zinc-900" />
                  <CurrentDate className="text-[10px] font-medium text-zinc-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
