import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

export type LeaveType = "annual" | "sick" | "permit";

export type LeaveSubmissionPayload = {
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  attachment?: File | null;
};

export type LeaveSubmissionItem = {
  id?: string | number;
  employeeId?: string | number;
  employeeName?: string;
  startDate: string;
  endDate: string;
  type: LeaveType | string;
  reason: string;
  status: "pending" | "approved" | "rejected" | string;
  attachmentUrl?: string;
  proofUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
};

export type LeaveBalanceSummary = {
  total: number;
  used: number;
  remaining: number;
};

export type LeaveStatusAction = "approved" | "rejected";

export type LeaveStatusUpdatePayload = {
  status: LeaveStatusAction;
  reason?: string;
};

const normalizeLeaveType = (value: unknown): LeaveType | string => {
  const normalized = String(value ?? "annual").toLowerCase();
  if (normalized === "annual") return "annual";
  if (normalized === "sick") return "sick";
  if (normalized === "permission" || normalized === "permit") return "permit";
  return normalized;
};

const normalizeLeaveStatus = (value: unknown): string => String(value ?? "pending").toLowerCase();

const normalizeLeaveItem = (raw: Record<string, unknown>): LeaveSubmissionItem => ({
  id: raw.id ?? raw._id,
  employeeId: raw.employeeId ?? raw.employee_id,
  employeeName:
    raw.employeeName ??
    raw.employee_name ??
    ((raw.employee as Record<string, unknown>)?.name as string | undefined),
  startDate: String(raw.startDate ?? raw.start_date ?? raw.tanggal_mulai ?? ""),
  endDate: String(raw.endDate ?? raw.end_date ?? raw.tanggal_selesai ?? ""),
  type: normalizeLeaveType(raw.type ?? raw.leave_type ?? raw.jenis),
  reason: String(raw.reason ?? raw.alasan ?? raw.keterangan ?? ""),
  status: normalizeLeaveStatus(raw.status),
  attachmentUrl: (raw.attachmentUrl ?? raw.attachment_url ?? raw.attachment) as string | undefined,
  proofUrl: (raw.proofUrl ?? raw.proof_url ?? raw.evidenceUrl ?? raw.evidence_url) as string | undefined,
  notes: (raw.notes ?? raw.note ?? raw.catatan) as string | undefined,
  createdAt: (raw.createdAt ?? raw.created_at ?? raw.tanggal_pengajuan) as string | undefined,
  updatedAt: (raw.updatedAt ?? raw.updated_at) as string | undefined,
  approvedBy: (raw.approvedBy ?? raw.approved_by) as string | undefined,
  rejectionReason:
    (raw.rejectionReason ?? raw.rejection_reason ?? raw.reason_rejected) as string | undefined,
});

const extractLeaveArray = (payload: unknown): LeaveSubmissionItem[] => {
  if (Array.isArray(payload)) {
    return payload
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map(normalizeLeaveItem);
  }

  if (payload && typeof payload === "object") {
    const maybeArrayKeys = ["data", "leaves", "requests", "items", "list", "records"] as const;
    for (const key of maybeArrayKeys) {
      const candidate = (payload as Record<string, unknown>)[key];
      if (Array.isArray(candidate)) {
        return candidate
          .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
          .map(normalizeLeaveItem);
      }
    }
  }

  return [];
};

export async function submitLeaveRequest(
  payload: LeaveSubmissionPayload,
): Promise<{ message: string }> {
  const hasAttachment = payload.attachment instanceof File;
  const body = hasAttachment
    ? (() => {
        const formData = new FormData();
        formData.append("startDate", payload.startDate);
        formData.append("endDate", payload.endDate);
        formData.append("type", payload.type);
        formData.append("reason", payload.reason);
        formData.append("attachment", payload.attachment as File);
        formData.append("proof", payload.attachment as File);
        return formData;
      })()
    : JSON.stringify({
        startDate: payload.startDate,
        endDate: payload.endDate,
        type: payload.type,
        reason: payload.reason,
      });

  const response = await authFetch(buildApiUrl("/api/leaves"), {
    method: "POST",
    ...(hasAttachment ? {} : { headers: { "Content-Type": "application/json" } }),
    body,
  });

  const json = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal mengirim pengajuan cuti.");
  }

  return { message: json?.message || "Pengajuan berhasil dikirim." };
}

export async function getMyLeaveRequests(): Promise<LeaveSubmissionItem[]> {
  const response = await authFetch(buildApiUrl("/api/leaves/my"), { method: "GET" });
  const json = (await response.json().catch(() => null)) as {
    data?: unknown;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal mengambil data pengajuan.");
  }

  return extractLeaveArray(json?.data ?? json);
}

export async function getAllLeaveRequests(): Promise<LeaveSubmissionItem[]> {
  const response = await authFetch(buildApiUrl("/api/leaves"), { method: "GET" });
  const json = (await response.json().catch(() => null)) as {
    data?: unknown;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal mengambil semua data pengajuan.");
  }

  return extractLeaveArray(json?.data ?? json);
}

export async function getMyLeaveBalance(): Promise<LeaveBalanceSummary> {
  const response = await authFetch(buildApiUrl("/api/leaves/balance"), { method: "GET" });
  const json = (await response.json().catch(() => null)) as {
    data?: Partial<LeaveBalanceSummary>;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal mengambil saldo cuti.");
  }

  const total = Number(json?.data?.total ?? 12);
  const used = Number(json?.data?.used ?? 0);
  const remaining = Number(json?.data?.remaining ?? Math.max(total - used, 0));

  return { total, used, remaining };
}

export async function updateLeaveStatus(
  id: string | number,
  payload: LeaveStatusUpdatePayload,
): Promise<{ message: string }> {
  const response = await authFetch(buildApiUrl(`/api/leaves/${id}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal memperbarui status pengajuan.");
  }

  return { message: json?.message || "Status pengajuan berhasil diperbarui." };
}

export async function deleteLeaveRequest(id: string | number): Promise<{ message: string }> {
  const response = await authFetch(buildApiUrl(`/api/leaves/${id}`), {
    method: "DELETE",
  });

  const json = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(json?.message || "Gagal menghapus pengajuan.");
  }

  return { message: json?.message || "Pengajuan berhasil dihapus." };
}
