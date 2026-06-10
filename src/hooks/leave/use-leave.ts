import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  deleteLeaveRequest,
  getMyLeaveBalance,
  getMyLeaveRequests,
  submitLeaveRequest,
  type LeaveBalanceSummary,
  type LeaveSubmissionItem,
  type LeaveSubmissionPayload,
} from "@/services/leaveService";

export const leaveKeys = {
  all: ["leaves"] as const,
  my: ["leaves", "my"] as const,
  balance: ["leaves", "balance"] as const,
};

export function useMyLeave() {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: leaveKeys.my,
    queryFn: getMyLeaveRequests,
    staleTime: 30_000,
  });

  const balanceQuery = useQuery({
    queryKey: leaveKeys.balance,
    queryFn: getMyLeaveBalance,
    staleTime: 60_000,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: LeaveSubmissionPayload) => submitLeaveRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.my });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.my });
      queryClient.invalidateQueries({ queryKey: leaveKeys.balance });
    },
  });

  const stats = useMemo(() => {
    const items = requestsQuery.data ?? [];
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    };
  }, [requestsQuery.data]);

  return {
    requestsQuery,
    balanceQuery,
    submitMutation,
    deleteMutation,
    stats,
    requests: (requestsQuery.data ?? []) as LeaveSubmissionItem[],
    balance:
      balanceQuery.data ??
      ({ total: 0, used: 0, remaining: 0 } satisfies LeaveBalanceSummary),
    isSubmitting: submitMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
