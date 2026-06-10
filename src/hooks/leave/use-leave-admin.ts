import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getAllLeaveRequests,
  updateLeaveStatus,
  type LeaveStatusUpdatePayload,
  type LeaveSubmissionItem,
} from "@/services/leaveService";

export const leaveAdminKeys = {
  all: ["leaves", "admin"] as const,
};

export function useLeaveAdmin() {
  const queryClient = useQueryClient();

  const allRequestsQuery = useQuery({
    queryKey: leaveAdminKeys.all,
    queryFn: getAllLeaveRequests,
    staleTime: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: LeaveStatusUpdatePayload }) =>
      updateLeaveStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveAdminKeys.all });
    },
  });

  const stats = useMemo(() => {
    const items = allRequestsQuery.data ?? [];
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    };
  }, [allRequestsQuery.data]);

  return {
    allRequestsQuery,
    statusMutation,
    stats,
    requests: (allRequestsQuery.data ?? []) as LeaveSubmissionItem[],
    isUpdating: statusMutation.isPending,
  };
}
