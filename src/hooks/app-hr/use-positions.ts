"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

async function fetchPositions(): Promise<any[]> {
  const res = await authFetch(buildApiUrl("/api/positions"));
  if (!res.ok) throw new Error("Gagal memuat data jabatan");
  const json = await res.json();
  return (Array.isArray(json) ? json : json.data || []) as any[];
}

async function createPosition(data: {
  name: string;
  description?: string;
  level?: string | null;
  baseAllowance?: number | null;
  departmentId?: string | null;
}) {
  const res = await authFetch(buildApiUrl("/api/positions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menambah jabatan");
  }
  return res.json();
}

async function updatePosition(data: {
  id: string;
  name: string;
  description?: string;
  level?: string | null;
  baseAllowance?: number | null;
  departmentId?: string | null;
}) {
  const { id, ...payload } = data;
  const res = await authFetch(buildApiUrl(`/api/positions/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal mengubah jabatan");
  }
  return res.json();
}

async function deletePosition(id: string) {
  const res = await authFetch(buildApiUrl(`/api/positions/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menghapus jabatan");
  }
  return res.json();
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
    staleTime: 60 * 1000,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}
