"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

async function fetchRoles(): Promise<any[]> {
  const res = await authFetch(buildApiUrl("/api/roles"));
  if (!res.ok) throw new Error("Gagal memuat roles");
  const json = await res.json();
  return (Array.isArray(json) ? json : json.data || []) as any[];
}

async function fetchPermissions(): Promise<any[]> {
  const res = await authFetch(buildApiUrl("/api/permissions"));
  if (!res.ok) return [];
  const json = await res.json();
  return (Array.isArray(json) ? json : json.data || []) as any[];
}

async function createRole(data: { name: string; description?: string; permissionIds?: string[] }) {
  const res = await authFetch(buildApiUrl("/api/roles"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menambah role");
  }
  return res.json();
}

async function updateRole(data: { id: string; name: string; description?: string; permissionIds?: string[] }) {
  const { id, ...payload } = data;
  const res = await authFetch(buildApiUrl(`/api/roles/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal mengubah role");
  }
  return res.json();
}

async function deleteRole(id: string) {
  const res = await authFetch(buildApiUrl(`/api/roles/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menghapus role");
  }
  return res.json();
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 60 * 1000,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
