import { buildApiUrl } from "@/api/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
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
