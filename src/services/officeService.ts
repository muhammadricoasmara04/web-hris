import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

export type RadiusOffice = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  createdAt?: string;
  updatedAt?: string;
};

export type OfficeResponse = {
  success?: boolean;
  message?: string;
  data?: RadiusOffice | RadiusOffice[];
};

export async function getAllOffices(): Promise<RadiusOffice[]> {
  const response = await authFetch(buildApiUrl("/api/offices"), {
    method: "GET",
  });
  const resData = (await response.json().catch(() => null)) as OfficeResponse | null;
  if (!response.ok) {
    throw new Error(resData?.message || "Gagal mengambil data radius kantor.");
  }
  const data = resData?.data;
  return Array.isArray(data) ? data : [];
}

export async function createOffice(payload: Omit<RadiusOffice, "id">): Promise<RadiusOffice> {
  const response = await authFetch(buildApiUrl("/api/offices"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const resData = (await response.json().catch(() => null)) as OfficeResponse | null;
  if (!response.ok) {
    throw new Error(resData?.message || "Gagal membuat radius kantor baru.");
  }
  return resData?.data as RadiusOffice;
}

export async function updateOffice(id: string, payload: Partial<Omit<RadiusOffice, "id">>): Promise<RadiusOffice> {
  const response = await authFetch(buildApiUrl(`/api/offices/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const resData = (await response.json().catch(() => null)) as OfficeResponse | null;
  if (!response.ok) {
    throw new Error(resData?.message || "Gagal memperbarui radius kantor.");
  }
  return resData?.data as RadiusOffice;
}

export async function deleteOffice(id: string): Promise<void> {
  const response = await authFetch(buildApiUrl(`/api/offices/${id}`), {
    method: "DELETE",
  });
  const resData = (await response.json().catch(() => null)) as OfficeResponse | null;
  if (!response.ok) {
    throw new Error(resData?.message || "Gagal menghapus radius kantor.");
  }
}
