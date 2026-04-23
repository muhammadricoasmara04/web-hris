"use client";

import { CurrentDate, DigitalClock } from "@/components/attendance/digital-clock";
import { ProfileHeader } from "@/components/attendance/profile-header";
import { CurrentLocationMap } from "@/components/maps/current-location-map";
import { EMPLOYEE_ATTENDANCE_COLORS } from "@/constants/colors";
import { useCurrentLocation } from "@/hooks/maps/use-current-location";
import { checkIn } from "@/services/attendanceService";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Loader2, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

export default function EmployeeAttendancePage() {
  const { coordinates, loading: locationLoading } = useCurrentLocation();
  const [expanded, setExpanded] = useState(false);
  const colors = EMPLOYEE_ATTENDANCE_COLORS;

  const mutation = useMutation({
    mutationFn: checkIn,
    onSuccess: (data) => {
      alert(data.message || "Berhasil Clock In!");
    },
    onError: (error: Error) => {
      alert(error.message || "Gagal melakukan absensi.");
    },
  });

  const handleClockIn = () => {
    if (locationLoading) {
      alert("Sedang mengambil lokasi, mohon tunggu...");
      return;
    }
    mutation.mutate({
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      type: "in",
    });
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: colors.screen.base }}>
      {/* 1. Background Map */}
      <div className="absolute inset-0 h-full w-full">
        <CurrentLocationMap
          center={coordinates}
          loading={locationLoading}
          mapTitle="" // Title is empty as per screenshot design
          focusOffset="up"
          zoomControlPlacement="underNotification"
        />
        {/* Overlay for better readability at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" style={{ background: colors.screen.mapOverlay }} />
      </div>

      {/* 2. Top Header Overlay */}
      <ProfileHeader />

      {/* 3. Bottom Sheet Attendance Panel */}
      <div
        className={`absolute bottom-0 left-0 z-[600] w-full transition-all duration-500 ease-in-out ${expanded ? "h-[56vh]" : "h-[200px]"
          }`}
      >
        <div
          className="relative h-full w-full rounded-t-[40px] bg-transparent backdrop-blur-[5px] p-6 border-t"
          style={{
            borderTopColor: colors.panel.borderTop,
            boxShadow: colors.panel.insetHighlight,
          }}
        >
          {/* Toggle Indicator - Floating with Bounce */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute left-1/2 -top-5 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full transition active:scale-95 animate-bounce"
            style={{
              background: colors.toggle.background,
              color: colors.toggle.text,
              boxShadow: colors.toggle.shadow,
            }}
          >
            {expanded ? <ChevronDown className="h-6 w-6" /> : <ChevronUp className="h-6 w-6" />}
          </button>

          <div className="h-full pb-10 overflow-y-auto pt-4">
            {expanded ? (
              /* EXPANDED VIEW */
              <div className="flex flex-col items-center">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: colors.heading.overline }}
                >
                  Waktu & Tanggal
                </p>
                <div style={{ color: colors.heading.time }}>
                  <DigitalClock className="mt-0.5 text-5xl font-bold tracking-tight" />
                </div>
                <div className="mt-0.5 text-[13px] font-medium" style={{ color: colors.heading.date }}>
                  <CurrentDate />
                </div>

                <div className="mt-5 grid w-full grid-cols-2 gap-3 px-2">
                  <button
                    onClick={handleClockIn}
                    disabled={mutation.isPending}
                    className="flex h-20 flex-col items-center justify-center gap-1 rounded-[24px] p-3 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: colors.actions.clockIn.background,
                      color: colors.actions.clockIn.text,
                      boxShadow: colors.actions.clockIn.shadow,
                    }}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <span className="text-lg font-extrabold tracking-tight">Clock In</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">Masuk Kerja</span>
                      </>
                    )}
                  </button>
                  <button
                    className="flex h-20 flex-col items-center justify-center gap-1 rounded-[24px] p-3 transition active:scale-95"
                    style={{
                      background: colors.actions.clockOut.background,
                      color: colors.actions.clockOut.text,
                      boxShadow: colors.actions.clockOut.shadow,
                    }}
                  >
                    <span className="text-lg font-extrabold tracking-tight">Clock Out</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-70">Pulang Kerja</span>
                  </button>
                </div>

                {/* Recent History Section */}
                <div className="mt-5 w-full px-2">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: colors.history.title }}
                    >
                      Riwayat Hari Ini
                    </p>
                    <button
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: colors.history.viewAll }}
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div
                      className="flex items-center justify-between rounded-2xl border p-4 backdrop-blur-sm shadow-sm"
                      style={{
                        background: colors.history.card.background,
                        borderColor: colors.history.card.border,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                          style={{
                            background: colors.history.iconIn.background,
                            color: colors.history.iconIn.text,
                          }}
                        >
                          <LogIn className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold leading-none" style={{ color: colors.history.card.title }}>Check In</span>
                          <span className="mt-1 text-[10px] font-medium" style={{ color: colors.history.card.subtitle }}>Kantor Pusat</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold leading-none" style={{ color: colors.history.card.time }}>08:00</span>
                        <span className="mt-1 text-[9px] font-bold uppercase tracking-tighter" style={{ color: colors.history.card.status }}>
                          On Time
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between rounded-2xl border p-4 backdrop-blur-sm opacity-70"
                      style={{
                        background: colors.history.cardMuted.background,
                        borderColor: colors.history.cardMuted.border,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{
                            background: colors.history.iconOut.background,
                            color: colors.history.iconOut.text,
                          }}
                        >
                          <LogOut className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold leading-none italic" style={{ color: colors.history.cardMuted.title }}>Check Out</span>
                          <span className="mt-1 text-[10px] font-medium" style={{ color: colors.history.cardMuted.subtitle }}>Belum dilakukan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* COLLAPSED VIEW */
              <div className="mt-1 flex items-center justify-between gap-4">
                <button
                  onClick={handleClockIn}
                  disabled={mutation.isPending}
                  className="flex-1 flex items-center justify-center gap-3 rounded-[24px] py-5 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: colors.actions.clockIn.background,
                    color: colors.actions.clockIn.text,
                    boxShadow: colors.actions.clockIn.shadow,
                  }}
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <span className="text-xl font-bold">Clock In</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Absen Masuk</span>
                    </>
                  )}
                </button>
                <div className="flex flex-col items-end pr-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: colors.collapsed.overline }}>Waktu & Tanggal</p>
                  <div style={{ color: colors.collapsed.time }}>
                    <DigitalClock className="text-3xl font-bold tracking-tight" />
                  </div>
                  <div className="text-[10px] font-medium" style={{ color: colors.collapsed.date }}>
                    <CurrentDate />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
