"use client";

import type { DivIcon } from "leaflet";
import { ArrowLeft, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

type Point = { lat: number; lng: number };

const parseNumber = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function AttendanceDataMappingPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Karyawan";
  const checkIn: Point | null = useMemo(() => {
    const lat = parseNumber(searchParams.get("inLat"));
    const lng = parseNumber(searchParams.get("inLng"));
    if (lat === null || lng === null) return null;
    return { lat, lng };
  }, [searchParams]);

  const checkOut: Point | null = useMemo(() => {
    const lat = parseNumber(searchParams.get("outLat"));
    const lng = parseNumber(searchParams.get("outLng"));
    if (lat === null || lng === null) return null;
    return { lat, lng };
  }, [searchParams]);

  const mapCenter = useMemo(() => checkOut || checkIn || { lat: -6.2, lng: 106.816666 }, [checkIn, checkOut]);

  const path = useMemo(() => {
    if (!checkIn || !checkOut) return [];
    return [
      [checkIn.lat, checkIn.lng] as [number, number],
      [checkOut.lat, checkOut.lng] as [number, number],
    ];
  }, [checkIn, checkOut]);

  const isOverlapping = useMemo(() => {
    return !!(checkIn && checkOut && Math.abs(checkIn.lat - checkOut.lat) < 0.0001 && Math.abs(checkIn.lng - checkOut.lng) < 0.0001);
  }, [checkIn, checkOut]);

  const [inIcon, setInIcon] = useState<DivIcon | null>(null);
  const [outIcon, setOutIcon] = useState<DivIcon | null>(null);

  useEffect(() => {
    let mounted = true;

    import("leaflet").then(({ divIcon }) => {
      if (!mounted) return;

      setInIcon(
        divIcon({
          className: "bg-transparent border-none",
          html: `<div class="flex flex-col items-center justify-end w-full h-full pointer-events-none">
                  <div class="px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md border-2 border-white whitespace-nowrap mb-0.5 inline-block pointer-events-auto">
                    🚶 Masuk: ${name}
                  </div>
                  <div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md pointer-events-auto"></div>
                </div>`,
          iconSize: [160, 50],
          iconAnchor: [80, 50],
          popupAnchor: [0, -50],
        }),
      );

      setOutIcon(
        divIcon({
          className: "bg-transparent border-none",
          html: `<div class="flex flex-col items-center justify-end w-full h-full pointer-events-none">
                  <div class="px-2 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md border-2 border-white whitespace-nowrap inline-block pointer-events-auto" style="${isOverlapping ? 'margin-bottom: 42px;' : 'margin-bottom: 2px;'}">
                    🏃 Pulang: ${name}
                  </div>
                  <div class="w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-md pointer-events-auto ${isOverlapping ? 'hidden' : ''}"></div>
                </div>`,
          iconSize: [160, 50],
          iconAnchor: [80, 50],
          popupAnchor: [0, -50],
        }),
      );
    });

    return () => {
      mounted = false;
    };
  }, [name, isOverlapping]);


  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <p className="text-zinc-400">Memuat Peta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <Link
          href="/dashboard/app-hr/data-attendance"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
          id="attendance-map-back-button"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Data Attendance
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Lokasi Clock In & Clock Out</h1>
        <p className="mt-1 text-sm text-zinc-300">HR dapat melihat titik lokasi clock in dan clock out user pada peta.</p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#071120]">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/20 px-4 py-3 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /> IN
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/15 px-3 py-1 font-semibold text-rose-200">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" /> OUT
          </span>
        </div>

        <div className="h-[65vh] min-h-[420px] w-full">
          <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={15} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {checkIn && inIcon ? (
              <Marker position={[checkIn.lat, checkIn.lng]} icon={inIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-emerald-700">Absen Masuk</p>
                    <p className="text-zinc-600 font-medium mb-1">{name}</p>
                    <p className="text-xs text-zinc-500">{checkIn.lat}, {checkIn.lng}</p>
                  </div>
                </Popup>
              </Marker>
            ) : null}

            {checkOut && outIcon ? (
              <Marker position={[checkOut.lat, checkOut.lng]} icon={outIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-rose-700">Absen Pulang</p>
                    <p className="text-zinc-600 font-medium mb-1">{name}</p>
                    <p className="text-xs text-zinc-500">{checkOut.lat}, {checkOut.lng}</p>
                  </div>
                </Popup>
              </Marker>
            ) : null}

            {path.length === 2 ? <Polyline positions={path} pathOptions={{ color: "#22d3ee", weight: 4, opacity: 0.9 }} /> : null}
          </MapContainer>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-emerald-100">
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4" /> Titik Clock In</p>
          <p className="text-sm">{checkIn ? `${checkIn.lat}, ${checkIn.lng}` : "Tidak tersedia"}</p>
        </div>
        <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4 text-rose-100">
          <p className="mb-1 inline-flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4" /> Titik Clock Out</p>
          <p className="text-sm">{checkOut ? `${checkOut.lat}, ${checkOut.lng}` : "Tidak tersedia"}</p>
        </div>
      </section>
    </div>
  );
}
