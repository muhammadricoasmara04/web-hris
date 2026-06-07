"use client";

import { type ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { refreshAccessToken } from "@/services/authClient";
import { getAuthGuardToken, subscribeAuthStorage } from "@/utils/auth-storage";
import Loader from "@/components/ui/loader-15";

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
    }, 1200);
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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 p-8 shadow-2xl backdrop-blur-xl">
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 blur-xl pointer-events-none" />
            
            <div className="relative scale-[0.4] -my-14 flex items-center justify-center">
              <Loader />
            </div>
            
            <div className="text-center z-10">
              <p className="text-sm font-semibold tracking-wider text-white">Beralih Mode Dashboard</p>
              <span className="mt-1 block text-xs text-zinc-400">Menyiapkan antarmuka dashboard Anda...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
