import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

export type LeaveType = "annual" | "sick" | "permit";

export type LeaveSubmissionPayload = {
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
};

export type LeaveSubmissionItem = {
  id?: string | number;
  startDate: string;
  endDate: string;
  type: LeaveType | string;
  reason: string;
  status: "pending" | "approved" | "rejected" | string;
  createdAt?: string;
};

export type LeaveBalanceSummary = {
  total: number;
  used: number;
  remaining: number;
};

const ensureArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

export async function submitLeaveRequest(payload: LeaveSubmissionPayload): Promise<{ message: string }> {
  const response = await authFetch(buildApiUrl("/api/leave"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal mengirim pengajuan cuti.");
  }

  return { message: json?.message || "Pengajuan cuti berhasil dikirim." };
}

export async function getMyLeaveRequests(): Promise<LeaveSubmissionItem[]> {
  const response = await authFetch(buildApiUrl("/api/leave/me"), { method: "GET" });
  const json = (await response.json().catch(() => null)) as { data?: unknown; message?: string } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal mengambil data cuti.");
  }

  return ensureArray<LeaveSubmissionItem>(json?.data);
}

export async function getMyLeaveBalance(): Promise<LeaveBalanceSummary> {
  const response = await authFetch(buildApiUrl("/api/leave/balance"), { method: "GET" });
  const json = (await response.json().catch(() => null)) as { data?: Partial<LeaveBalanceSummary>; message?: string } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal mengambil saldo cuti.");
  }

  const total = Number(json?.data?.total ?? 12);
  const used = Number(json?.data?.used ?? 0);
  const remaining = Number(json?.data?.remaining ?? Math.max(total - used, 0));

  return { total, used, remaining };
}
