export const API_BASE_URL = "https://api-hris-company.ricoasmara.my.id";

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
