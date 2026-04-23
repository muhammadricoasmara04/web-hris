import { buildApiUrl } from "@/api/api";

export type CheckInPayload = {
  latitude: number;
  longitude: number;
  type?: "in" | "out";
};

export type CheckInResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export async function checkIn(payload: CheckInPayload): Promise<CheckInResponse> {
  const token = localStorage.getItem("token");
  
  // Debug log untuk melihat apakah token terambil
  console.log("Memulai Check-In dengan token:", token ? "Token ada (tersimpan)" : "Token KOSONG");

  const response = await fetch(buildApiUrl("/api/attendance/check-in"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });

  const responseData = (await response.json().catch(() => null)) as CheckInResponse | null;

  if (!response.ok) {
    const errorMessage = responseData?.message || "Gagal melakukan absensi.";
    throw new Error(errorMessage);
  }

  return responseData ?? { success: true, message: "Absensi berhasil" };
}
