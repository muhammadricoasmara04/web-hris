"use client";

import { type ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { refreshAccessToken } from "@/services/authClient";
import { getAuthGuardToken, subscribeAuthStorage } from "@/utils/auth-storage";

const getServerTokenSnapshot = (): string | null => null;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useSyncExternalStore(
    subscribeAuthStorage,
    getAuthGuardToken,
    getServerTokenSnapshot,
  );
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <DashboardSidebar />

        <main className="w-full flex-1 px-4 pb-24 pt-16 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
