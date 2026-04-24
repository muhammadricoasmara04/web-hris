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
    onSuccess: (data) => {
      console.log("Login Response Data:", data);

      // Support response: { token } atau { data: { token } }
      const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const refreshToken = data.refreshToken || data.data?.refreshToken;
      const user = data.user || data.data?.user;

      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
      } else {
        console.warn("[useAuth] Login sukses tapi token tidak ditemukan di response.");
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      if (user) {
        localStorage.setItem("authUser", JSON.stringify(user));
      }

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
