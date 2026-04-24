"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";

const subscribeToAuthChanges = () => () => {};

const getTokenSnapshot = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || localStorage.getItem("accessToken");
};

const getServerTokenSnapshot = (): string | null => null;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useSyncExternalStore(
    subscribeToAuthChanges,
    getTokenSnapshot,
    getServerTokenSnapshot,
  );

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white/80">
        Mengarahkan ke halaman login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_25%),radial-gradient(circle_at_right,rgba(168,85,247,0.14),transparent_30%),#050816] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <DashboardSidebar />

        <main className="w-full flex-1 px-4 pb-24 pt-16 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
