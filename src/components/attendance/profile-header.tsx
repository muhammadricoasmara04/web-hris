"use client";

import { Bell, User } from "lucide-react";

export function ProfileHeader() {
  return (
    <header className="fixed left-0 top-0 z-[500] flex w-full items-center justify-between p-4 px-6 pt-10">
      <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 p-1.5 pr-5 backdrop-blur-xl shadow-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white border border-white/30 overflow-hidden shadow-inner">
          <User className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight">Sangkuriang</span>
          <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">User/Karyawan</span>
        </div>
      </div>

      <button className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-xl transition active:scale-95 shadow-lg">
        <Bell className="h-5 w-5" />
        <span className="absolute right-3 top-3 block h-2 w-2 rounded-full bg-rose-500 border-2 border-white/20" />
      </button>
    </header>
  );
}
