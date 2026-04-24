"use client";

import { getMe } from "@/services/authService";
import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";

type MePayload = {
  name?: string;
  fullname?: string;
  fullName?: string;
  username?: string;
  data?: MePayload;
  user?: MePayload;
  profile?: MePayload;
};

const pickName = (source?: MePayload): string | undefined => {
  if (!source) return undefined;
  return source.name ?? source.fullname ?? source.fullName ?? source.username;
};

const extractDisplayName = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "User";

  const source = payload as MePayload;

  return (
    pickName(source) ??
    pickName(source.data) ??
    pickName(source.user) ??
    pickName(source.profile) ??
    pickName(source.data?.user) ??
    pickName(source.data?.profile) ??
    pickName(source.user?.profile) ??
    "User"
  );
};

export function ProfileHeader() {
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    console.log("[ProfileHeader] token status:", token ? "LOGIN (token ada)" : "BELUM LOGIN (token kosong)");

    if (!token) return;

    void getMe(token)
      .then((response) => {
        console.log("[ProfileHeader] /api/auth/me response:", response);
        const resolvedName = extractDisplayName(response);
        console.log("[ProfileHeader] resolved displayName:", resolvedName);
        setDisplayName(resolvedName);
      })
      .catch((error) => {
        console.error("[ProfileHeader] gagal ambil /api/auth/me:", error);
        setDisplayName("User");
      });
  }, []);

  return (
    <header className="fixed left-0 top-0 z-[500] flex w-full items-center justify-between p-4 px-6 pt-10">
      <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 p-1.5 pr-5 backdrop-blur-xl shadow-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white border border-white/30 overflow-hidden shadow-inner">
          <User className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight">{displayName}</span>
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
