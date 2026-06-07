"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/loader-15";

function LoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hide loader with a 1.2-second delay for smooth premium transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        const href = anchor.getAttribute("href");
        const targetAttr = anchor.getAttribute("target");

        // Only trigger loading for internal links
        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("#") &&
          targetAttr !== "_blank" &&
          href !== pathname
        ) {
          // Check if it's a normal left click without modifier keys
          if (
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey &&
            !event.altKey &&
            event.button === 0
          ) {
            setLoading(true);
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300">
      <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#0a0a0a]/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 blur-xl pointer-events-none" />
        
        <div className="relative scale-[0.4] -my-14 flex items-center justify-center">
          <Loader />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wider text-white">Memuat Halaman</p>
          <span className="mt-1 block text-xs text-zinc-400">Sedang mengalihkan ke rute tujuan...</span>
        </div>
      </div>
    </div>
  );
}

export default function GlobalRouteLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  );
}
