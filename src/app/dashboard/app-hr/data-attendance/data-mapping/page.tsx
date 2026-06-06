"use client";

import type { DivIcon } from "leaflet";
import { ArrowLeft, MapPin, User, Calendar, Clock, Building, ArrowUpRight } from "lucide-react";
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

const badgeClass: Record<string, string> = {
  Hadir: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
  Terlambat: "border-amber-400/30 bg-amber-400/15 text-amber-300",
  Izin: "border-sky-400/30 bg-sky-400/15 text-sky-300",
  "Belum Checkout": "border-orange-400/30 bg-orange-400/15 text-orange-300",
};

export default function AttendanceDataMappingPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Karyawan";
  const nik = searchParams.get("nik") || "-";
  const dept = searchParams.get("dept") || "-";
  const date = searchParams.get("date") || "-";
  const checkInTime = searchParams.get("checkIn") || "-";
  const checkOutTime = searchParams.get("checkOut") || "-";
  const status = searchParams.get("status") || "Hadir";

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
    <div className="space-y-6 pb-20 pt-20">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <Link
          href="/dashboard/app-hr/data-attendance"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
          id="attendance-map-back-button"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Data Attendance
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-white">Detail Lokasi & Absensi Karyawan</h1>
        <p className="mt-1 text-sm text-zinc-300">Pantau koordinat presisi check-in dan check-out karyawan pada peta interaktif.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map Panel */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#071120] lg:col-span-2 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-black/25 px-5 py-3.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-200">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> IN
              </span>
              {checkOut && (
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/15 px-3 py-1 font-semibold text-rose-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> OUT
                </span>
              )}
            </div>
            <span className="text-zinc-400 font-mono text-[10px] hidden sm:inline">Peta Interaktif OpenStreetMap</span>
          </div>

          <div className="h-[60vh] min-h-[450px] w-full relative">
            <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={15} className="h-full w-full" scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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

              {path.length === 2 ? <Polyline positions={path} pathOptions={{ color: "#0ea5e9", weight: 3, opacity: 0.8, dashArray: "6, 6" }} /> : null}
            </MapContainer>
          </div>
        </section>

        {/* Info Sidebar Panel */}
        <section className="flex flex-col gap-4">
          {/* Profile Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="h-5 w-5 text-sky-400" /> Profil Karyawan
            </h2>
            <div className="space-y-3.5">
              <div>
                <p className="text-xs text-zinc-400">Nama Lengkap</p>
                <p className="text-sm font-semibold text-white">{name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-400">NIK</p>
                  <p className="text-sm font-mono text-zinc-200">{nik}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Departemen</p>
                  <p className="text-sm text-zinc-200">{dept}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-400">Tanggal Kerja</p>
                  <p className="text-sm text-zinc-200">{date}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Status Kehadiran</p>
                  <span className={`inline-block mt-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClass[status] || badgeClass.Hadir}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clock In Info */}
          {checkIn && (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <Clock className="h-4 w-4" /> Clock In
                </p>
                <span className="text-xs text-emerald-300 font-mono font-medium">{checkInTime}</span>
              </div>
              <div className="text-xs text-zinc-300 bg-black/30 p-2.5 rounded-xl border border-emerald-500/10">
                <span className="block text-[10px] text-zinc-500">Koordinat</span>
                <span className="font-mono text-zinc-200">{checkIn.lat}, {checkIn.lng}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${checkIn.lat},${checkIn.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 text-xs font-medium transition-all"
              >
                Buka di Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Clock Out Info */}
          {checkOut ? (
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-400">
                  <Clock className="h-4 w-4" /> Clock Out
                </p>
                <span className="text-xs text-rose-300 font-mono font-medium">{checkOutTime}</span>
              </div>
              <div className="text-xs text-zinc-300 bg-black/30 p-2.5 rounded-xl border border-rose-500/10">
                <span className="block text-[10px] text-zinc-500">Koordinat</span>
                <span className="font-mono text-zinc-200">{checkOut.lat}, {checkOut.lng}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${checkOut.lat},${checkOut.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2 text-xs font-medium transition-all"
              >
                Buka di Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/5 bg-white/5 p-5 text-center shadow-lg">
              <p className="text-xs text-zinc-400">Belum Clock Out</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
