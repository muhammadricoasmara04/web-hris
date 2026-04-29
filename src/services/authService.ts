import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
  data?: {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type MeResponse = {
  message?: string;
  success?: boolean;
  user?: unknown;
  data?: unknown;
  [key: string]: unknown;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(buildApiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = (await response.json().catch(() => null)) as
    | LoginResponse
    | null;

  if (!response.ok) {
    const errorMessage =
      responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim().length > 0
        ? responseData.message
        : "Login gagal. Silakan cek email dan password.";

    throw new Error(errorMessage);
  }

  return responseData ?? {};
}

export async function getMe(): Promise<MeResponse> {
  const response = await authFetch(buildApiUrl("/api/auth/me"), {
    method: "GET",
  });

  const responseData = (await response.json().catch(() => null)) as
    | MeResponse
    | null;

  if (!response.ok) {
    const errorMessage =
      responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim().length > 0
        ? responseData.message
        : "Akses ditolak. Silakan login ulang.";

    throw new Error(errorMessage);
  }

  return responseData ?? {};
}
