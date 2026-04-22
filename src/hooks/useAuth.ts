"use client";

import { login, type LoginPayload, type LoginResponse } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");

  const mutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: login,
    onSuccess: () => {
      setSuccessMessage("Login berhasil. Mengarahkan ke dashboard karyawan...");
      router.push("/dashboard/employee");
    },
    onError: () => {
      setSuccessMessage("");
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.error?.message ?? "",
    successMessage,
    clearSuccessMessage: () => setSuccessMessage(""),
  };
}
