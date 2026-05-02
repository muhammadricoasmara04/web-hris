import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

export type CheckInPayload = {
  latitude: number;
  longitude: number;
  type?: "in" | "out";
};

export type CheckOutPayload = {
  latitude: number;
  longitude: number;
  type?: "out";
};

export type CheckInResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};


export type AttendanceHistoryItem = {
  id?: string | number;
  type?: "in" | "out" | string;
  checkInTime?: string;
  checkOutTime?: string;
  time?: string;
  locationName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type AttendanceHistoryResponse = {
  success?: boolean;
  message?: string;
  data?: AttendanceHistoryItem[] | { data?: AttendanceHistoryItem[] };
  [key: string]: unknown;
};

const asText = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const normalizeHistoryItem = (raw: Record<string, unknown>): AttendanceHistoryItem => {
  const typeRaw = asText(raw.type ?? raw.attendance_type ?? raw.kind ?? raw.mode);
  const normalizedType = typeRaw?.toLowerCase().includes("out") || typeRaw?.toLowerCase().includes("pulang")
    ? "out"
    : typeRaw?.toLowerCase().includes("in") || typeRaw?.toLowerCase().includes("masuk")
      ? "in"
      : typeRaw;

  const checkInTime = asText(raw.checkInTime ?? raw.check_in_time ?? raw.clock_in ?? raw.jam_masuk ?? raw.in_time);
  const checkOutTime = asText(raw.checkOutTime ?? raw.check_out_time ?? raw.clock_out ?? raw.jam_pulang ?? raw.out_time);
  const createdAt = asText(raw.createdAt ?? raw.created_at ?? raw.date ?? raw.tanggal);

  const locationName = asText(raw.locationName ?? raw.location_name ?? raw.office_name ?? raw.office ?? raw.branch_name);
  const location = asText(raw.location ?? raw.address ?? raw.alamat ?? raw.place);

  const latitude = asNumber(raw.latitude ?? raw.lat ?? raw.check_in_latitude ?? raw.checkin_latitude);
  const longitude = asNumber(raw.longitude ?? raw.lng ?? raw.lon ?? raw.check_in_longitude ?? raw.checkin_longitude);

  const status = asText(raw.status ?? raw.attendance_status ?? raw.note ?? raw.keterangan);

  return {
    ...raw,
    id: asText(raw.id ?? raw._id ?? raw.attendance_id) ?? undefined,
    type: normalizedType,
    checkInTime,
    checkOutTime,
    time: asText(raw.time ?? raw.jam ?? checkInTime ?? checkOutTime),
    locationName,
    location,
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    status,
    createdAt,
  };
};

const extractHistoryArray = (payload: unknown): AttendanceHistoryItem[] => {
  if (Array.isArray(payload)) {
    return payload
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map(normalizeHistoryItem);
  }

  if (payload && typeof payload === "object") {
    const maybeArrayKeys = ["data", "history", "attendance", "records", "items", "list"] as const;

    for (const key of maybeArrayKeys) {
      const candidate = (payload as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) {
        return candidate
          .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
          .map(normalizeHistoryItem);
      }
    }
  }

  return [];
};

const buildAttendancePayload = (payload: CheckInPayload | CheckOutPayload) => {
  const normalized: Record<string, unknown> = {
    latitude: payload.latitude,
    longitude: payload.longitude,
    lat: payload.latitude,
    lng: payload.longitude,
  };

  if (payload.type) {
    normalized.type = payload.type;
  }

  return normalized;
};

const submitAttendance = async (
  endpoint: string,
  payload: CheckInPayload | CheckOutPayload,
  method: "POST" | "PUT" = "POST",
): Promise<CheckInResponse> => {
  const response = await authFetch(buildApiUrl(endpoint), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildAttendancePayload(payload)),
  });

  const rawBody = await response.text().catch(() => "");
  const responseData = (() => {
    if (!rawBody) return null;

    try {
      return JSON.parse(rawBody) as CheckInResponse;
    } catch {
      return null;
    }
  })();

  if (!response.ok) {
    const errorMessage = responseData?.message || rawBody || `Request gagal (${response.status}).`;
    const attendanceError = new Error(errorMessage) as Error & { status?: number };
    attendanceError.status = response.status;
    throw attendanceError;
  }

  return responseData ?? { success: true, message: "Absensi berhasil" };
};

export async function checkIn(payload: CheckInPayload): Promise<CheckInResponse> {
  return submitAttendance("/api/attendance/check-in", payload, "POST");
}

export async function checkOut(payload: CheckOutPayload): Promise<CheckInResponse> {
  const candidates = [
    "/api/attendance/check-out",
    "/api/attendance/clock-out",
    "/api/attendance/check-in",
  ] as const;

  let latestError: unknown = null;

  for (const endpoint of candidates) {
    try {
      return await submitAttendance(
        endpoint,
        {
          ...payload,
          type: "out",
        },
        "PUT",
      );
    } catch (error) {
      latestError = error;
      const status = typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : null;

      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw latestError instanceof Error ? latestError : new Error("Gagal melakukan clock out.");
}


export async function getTodayAttendanceHistory(): Promise<AttendanceHistoryItem[]> {
  const response = await authFetch(buildApiUrl("/api/attendance/me"), {
    method: "GET",
  });

  const responseData = (await response.json().catch(() => null)) as AttendanceHistoryResponse | null;

  if (!response.ok) {
    const errorMessage = responseData?.message || "Gagal mengambil riwayat absensi.";
    throw new Error(errorMessage);
  }

  return extractHistoryArray(responseData?.data);
}
