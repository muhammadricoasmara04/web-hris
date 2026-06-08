"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

async function fetchEmployees(): Promise<any[]> {
  const url = buildApiUrl("/api/auth/users");
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Gagal mengambil data employee");
  const json = await response.json();
  return (json.data || []) as any[];
}

async function fetchEmployee(id: string): Promise<any> {
  const url = buildApiUrl(`/api/auth/users/${id}`);
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Gagal mengambil data karyawan");
  const json = await response.json();
  return json.data || null;
}

async function createEmployee(data: Record<string, unknown>) {
  const url = buildApiUrl("/api/auth/register");
  const payload = {
    ...data,
    departmentId: data.department || undefined,
    positionId: data.position || undefined,
  };
  const response = await authFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorMsg = `Gagal mendaftarkan karyawan (Error ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMsg = errorData.message;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}

async function updateEmployee(id: string, data: Record<string, unknown>) {
  const url = buildApiUrl(`/api/auth/users/${id}`);
  const payload: Record<string, unknown> = {
    ...data,
    departmentId: data.department || undefined,
    positionId: data.position || undefined,
    managerId: data.managerId || undefined,
  };
  if (!payload.password) delete payload.password;
  delete payload.department;
  delete payload.position;
  Object.keys(payload).forEach((key) => {
    if (payload[key] === "") delete payload[key];
  });
  const response = await authFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let errorMsg = `Gagal memperbarui karyawan (Error ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMsg = errorData.message;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}

async function deleteEmployee(id: string) {
  const res = await authFetch(buildApiUrl(`/api/auth/users/${id}`), {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menghapus karyawan");
  }
  return res.json();
}

export function useEmployeeList() {
  return useQuery({
    queryKey: ["employees", "all"],
    queryFn: fetchEmployees,
    staleTime: 60 * 1000,
  });
}

export function useEmployee(id: string | null) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "all"] });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "all"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "all"] });
    },
  });
}
