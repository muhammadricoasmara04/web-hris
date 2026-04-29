import { buildApiUrl } from "@/api/api";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  persistAuthSession,
} from "@/utils/auth-storage";

type RefreshTokenResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

let refreshPromise: Promise<string | null> | null = null;

const extractAccessToken = (payload: RefreshTokenResponse | null): string | null => {
  if (!payload) return null;
  return payload.accessToken || payload.token || payload.data?.accessToken || payload.data?.token || null;
};

const extractRefreshToken = (payload: RefreshTokenResponse | null): string | null => {
  if (!payload) return null;
  return payload.refreshToken || payload.data?.refreshToken || null;
};

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      clearAuthSession();
      return null;
    }

    const response = await fetch(buildApiUrl("/api/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: currentRefreshToken }),
    });

    const responseData = (await response.json().catch(() => null)) as RefreshTokenResponse | null;

    if (!response.ok) {
      clearAuthSession();
      return null;
    }

    const nextAccessToken = extractAccessToken(responseData);
    if (!nextAccessToken) {
      clearAuthSession();
      return null;
    }

    const nextRefreshToken = extractRefreshToken(responseData) || currentRefreshToken;

    persistAuthSession({
      token: nextAccessToken,
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    });

    return nextAccessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function getValidAccessToken(): Promise<string | null> {
  const currentAccessToken = getAccessToken();
  if (currentAccessToken) return currentAccessToken;

  return refreshAccessToken();
}

type AuthFetchInit = RequestInit & {
  disableAutoRefresh?: boolean;
};

export async function authFetch(url: string, init: AuthFetchInit = {}): Promise<Response> {
  const { disableAutoRefresh = false, ...requestInit } = init;

  const accessToken = await getValidAccessToken();
  const headers = new Headers(requestInit.headers ?? {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...requestInit,
    headers,
  });

  if (disableAutoRefresh || response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return response;
  }

  const retryHeaders = new Headers(requestInit.headers ?? {});
  retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

  return fetch(url, {
    ...requestInit,
    headers: retryHeaders,
  });
}
