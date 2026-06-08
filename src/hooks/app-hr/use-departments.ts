"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

async function fetchDepartments(): Promise<any[]> {
  const res = await authFetch(buildApiUrl("/api/departments"));
  if (!res.ok) throw new Error("Gagal memuat departemen");
  const json = await res.json();
  return (Array.isArray(json) ? json : json.data || []) as any[];
}

async function createDepartment(data: { code: string; name: string; description?: string }) {
  const res = await authFetch(buildApiUrl("/api/departments"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menambah departemen");
  }
  return res.json();
}

async function updateDepartment(data: { id: string; code: string; name: string; description?: string }) {
  const { id, ...payload } = data;
  const res = await authFetch(buildApiUrl(`/api/departments/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal mengubah departemen");
  }
  return res.json();
}

async function deleteDepartment(id: string) {
  const res = await authFetch(buildApiUrl(`/api/departments/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menghapus departemen");
  }
  return res.json();
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    staleTime: 60 * 1000,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
