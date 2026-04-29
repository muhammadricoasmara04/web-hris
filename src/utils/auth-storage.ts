import { mmkvStorage } from "@/storage/mmkv";

const AUTH_STORAGE_EVENT = "auth-storage-change";

export const AUTH_KEYS = {
  token: "token",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  authUser: "authUser",
} as const;

type PersistAuthPayload = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: unknown;
};

const isBrowser = () => typeof window !== "undefined";

const notifyAuthChanged = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
};

export const subscribeAuthStorage = (callback: () => void) => {
  if (!isBrowser()) return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || Object.values(AUTH_KEYS).includes(event.key as (typeof AUTH_KEYS)[keyof typeof AUTH_KEYS])) {
      callback();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(AUTH_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AUTH_STORAGE_EVENT, callback);
  };
};

export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  return mmkvStorage.getString(AUTH_KEYS.token) || mmkvStorage.getString(AUTH_KEYS.accessToken) || null;
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return mmkvStorage.getString(AUTH_KEYS.refreshToken) || null;
};

export const getAuthGuardToken = (): string | null => {
  if (!isBrowser()) return null;
  return getAccessToken() || getRefreshToken();
};

export const persistAuthSession = ({ token, accessToken, refreshToken, user }: PersistAuthPayload) => {
  if (!isBrowser()) return;

  const resolvedAccessToken = accessToken || token;

  if (token || resolvedAccessToken) {
    mmkvStorage.setString(AUTH_KEYS.token, token || resolvedAccessToken || "");
    mmkvStorage.setString(AUTH_KEYS.accessToken, resolvedAccessToken || token || "");
  }

  if (refreshToken) {
    mmkvStorage.setString(AUTH_KEYS.refreshToken, refreshToken);
  }

  if (user) {
    mmkvStorage.setString(AUTH_KEYS.authUser, JSON.stringify(user));
  }

  notifyAuthChanged();
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;

  mmkvStorage.delete(AUTH_KEYS.token);
  mmkvStorage.delete(AUTH_KEYS.accessToken);
  mmkvStorage.delete(AUTH_KEYS.refreshToken);
  mmkvStorage.delete(AUTH_KEYS.authUser);

  notifyAuthChanged();
};
