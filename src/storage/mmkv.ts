const isBrowser = () => typeof window !== "undefined";

const storageMap = new Map<string, string>();

export const mmkvStorage = {
  setString: (key: string, value: string) => {
    if (isBrowser()) {
      window.localStorage.setItem(key, value);
      return;
    }

    storageMap.set(key, value);
  },

  getString: (key: string): string | undefined => {
    if (isBrowser()) {
      const value = window.localStorage.getItem(key);
      return value === null ? undefined : value;
    }

    return storageMap.get(key);
  },

  delete: (key: string) => {
    if (isBrowser()) {
      window.localStorage.removeItem(key);
      return;
    }

    storageMap.delete(key);
  },
};
