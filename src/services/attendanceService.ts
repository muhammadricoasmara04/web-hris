import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

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
  const response = await authFetch(buildApiUrl("/api/attendance/check-in"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
