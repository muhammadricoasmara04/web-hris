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
      // Validasi sesi terlebih dahulu dan ambil semua office
      const meData = await getMe();
      const allOffices = (meData?.data as any)?.allOffices || [];

      if (allOffices && allOffices.length > 0) {
        const R = 6371e3; // metres
        const lat1 = coordinates.lat;
        const lon1 = coordinates.lng;
        
        // Cek jarak ke semua kantor
        const officeDistances = allOffices.map((office: any) => {
          const lat2 = office.latitude;
          const lon2 = office.longitude;
          
          const phi1 = lat1 * Math.PI/180;
          const phi2 = lat2 * Math.PI/180;
          const deltaPhi = (lat2-lat1) * Math.PI/180;
          const deltaLambda = (lon2-lon1) * Math.PI/180;

          const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                    Math.cos(phi1) * Math.cos(phi2) *
                    Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = Math.round(R * c); // in metres

          return {
            name: office.name,
            radius: office.radius,
            distance,
            isWithinRadius: distance <= office.radius
          };
        });

        // Cek apakah dalam salah satu radius
        const isWithinAnyRadius = officeDistances.some((o: any) => o.isWithinRadius);

        if (!isWithinAnyRadius) {
          const nearest = officeDistances.reduce((prev: any, current: any) => 
            prev.distance < current.distance ? prev : current
          );
          throw new Error(`Anda berada di luar area absensi. Lokasi terdekat: ${nearest.name} (${nearest.distance}m, maksimal ${nearest.radius}m). Silakan mendekat ke area absensi.`);
        }
      }

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
