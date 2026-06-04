"use client";

import { type ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { refreshAccessToken } from "@/services/authClient";
import { getAuthGuardToken, subscribeAuthStorage } from "@/utils/auth-storage";

const getServerTokenSnapshot = (): string | null => null;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useSyncExternalStore(
    subscribeAuthStorage,
    getAuthGuardToken,
    getServerTokenSnapshot,
  );
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isTransitioning]);

  useEffect(() => {
    let isActive = true;

    const ensureSession = async () => {
      if (token) {
        if (isActive) setIsCheckingSession(false);
        return;
      }

      const refreshedToken = await refreshAccessToken();

      if (!isActive) return;

      if (!refreshedToken) {
        router.replace("/login");
        return;
      }

      setIsCheckingSession(false);
    };

    void ensureSession();

    return () => {
      isActive = false;
    };
  }, [token, router]);

  if (!mounted || !token || isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white/80">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_25%),radial-gradient(circle_at_right,rgba(168,85,247,0.14),transparent_30%),#050816] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <DashboardSidebar onStartTransition={() => setIsTransitioning(true)} />

        <main className="w-full flex-1 px-4 pb-24 pt-16 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>

        <MobileNav />
      </div>

      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/65 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="relative flex flex-col items-center gap-4 p-8 rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
            <div className="absolute inset-0 rounded-3xl bg-sky-500/10 blur-xl animate-pulse" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-bold text-white tracking-wide animate-pulse">
                  Beralih Mode Dashboard
                </span>
                <span className="text-xs text-zinc-400 mt-1">
                  Menyiapkan antarmuka dashboard Anda...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
