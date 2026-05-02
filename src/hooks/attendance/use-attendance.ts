import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkIn,
  checkOut,
  getTodayAttendanceHistory,
  AttendanceHistoryItem,
} from "@/services/attendanceService";
import { modal } from "@/constants/modal";
import { getMe } from "@/services/authService";

export type AttendanceMode = "in" | "out";

interface UseAttendanceProps {
  coordinates: { lat: number; lng: number };
  locationLoading: boolean;
}

export function useAttendance({ coordinates, locationLoading }: UseAttendanceProps) {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["attendance-history-today"],
    queryFn: getTodayAttendanceHistory,
  });

  const clockInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-history-today"] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-history-today"] });
    },
  });

  const handleAttendanceSubmit = async (type: AttendanceMode) => {
    if (locationLoading) {
      await modal.info("Lokasi belum siap", "Sedang mengambil lokasi, mohon tunggu...");
      return;
    }

    try {
      // Validasi sesi terlebih dahulu
      await getMe();

      const payload = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      };

      console.log("[useAttendance] attendance payload", { ...payload, type });

      const data =
        type === "in"
          ? await clockInMutation.mutateAsync({ ...payload, type: "in" })
          : await clockOutMutation.mutateAsync({ ...payload, type: "out" });

      console.log("[useAttendance] attendance response", data);

      await historyQuery.refetch();
      await modal.success(
        "Absensi berhasil",
        data.message || (type === "in" ? "Berhasil Clock In!" : "Berhasil Clock Out!")
      );
    } catch (error) {
      console.error("[useAttendance] attendance error", error);
      const message = error instanceof Error ? error.message : "Gagal melakukan absensi.";
      const isUnauthorized = /akses ditolak|unauthorized|token|login/i.test(message);

      await modal.error(
        isUnauthorized ? "Akses ditolak" : "Absensi gagal",
        isUnauthorized
          ? "Sesi kamu kemungkinan sudah tidak valid. Silakan login ulang."
          : message
      );
    }
  };

  return {
    historyQuery,
    clockInMutation,
    clockOutMutation,
    isSubmitting: clockInMutation.isPending || clockOutMutation.isPending,
    handleAttendanceSubmit,
  };
}
