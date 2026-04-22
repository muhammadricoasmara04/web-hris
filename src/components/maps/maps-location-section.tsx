"use client";

import { CurrentLocationMap } from "@/components/maps/current-location-map";
import { useCurrentLocation } from "@/hooks/maps/use-current-location";
import { AlertTriangle, RefreshCcw } from "lucide-react";

type MapsLocationSectionProps = {
  compact?: boolean;
};

export function MapsLocationSection({
  compact = false,
}: MapsLocationSectionProps) {
  const { coordinates, loading, error, isSupported, requestLocation } =
    useCurrentLocation();

  if (compact) {
    return (
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 pb-2">
        <div className="flex items-center justify-end">
          <button
            id="maps-refresh-location-button"
            type="button"
            onClick={requestLocation}
            disabled={!isSupported || loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/20 bg-white/10 px-4 py-2.5 text-xs font-medium text-white backdrop-blur-xl transition hover:border-sky-300/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Mengambil lokasi..." : "Refresh lokasi"}
          </button>
        </div>

        <CurrentLocationMap
          center={coordinates}
          loading={loading}
          mapTitle="Lokasi Presensi"
        />

        {error ? (
          <div className="flex items-start gap-3 rounded-3xl border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(12,18,37,0.96),rgba(139,92,246,0.2))] p-6 shadow-[0_24px_70px_rgba(6,10,24,0.45)]">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.16),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200/80">
              Smart Maps Workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Peta lokasi real-time untuk kebutuhan absensi & verifikasi titik hadir.
            </h1>
          </div>

          <button
            id="maps-refresh-location-button"
            type="button"
            onClick={requestLocation}
            disabled={!isSupported || loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:border-sky-300/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Mengambil lokasi..." : "Refresh lokasi"}
          </button>
        </div>
      </div>

      <CurrentLocationMap
        center={coordinates}
        loading={loading}
        mapTitle="Current Device Location"
      />

      {error ? (
        <div className="flex items-start gap-3 rounded-3xl border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}
    </section>
  );
}
