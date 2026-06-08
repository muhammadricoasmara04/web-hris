"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllOffices,
  createOffice,
  updateOffice,
  deleteOffice,
  RadiusOffice,
} from "@/services/officeService";

export function useOffices() {
  return useQuery({
    queryKey: ["offices"],
    queryFn: getAllOffices,
    staleTime: 60 * 1000,
  });
}

export function useCreateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<RadiusOffice, "id">> }) =>
      updateOffice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOffice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offices"] });
    },
  });
}
