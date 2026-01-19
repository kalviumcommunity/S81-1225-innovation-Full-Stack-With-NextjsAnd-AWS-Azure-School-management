import type { ApiResponse } from "@/lib/api-response";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ApiFetchOptions = {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
};

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", token, body, signal } = options;

  const url = joinUrl(getApiBaseUrl(), path);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const data = (await res.json()) as ApiResponse<T>;

  // Normalize unexpected non-JSON errors
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as any).success !== "boolean"
  ) {
    return {
      success: false,
      statusCode: res.status as any,
      message: "Unexpected response from server",
    } as ApiResponse<T>;
  }

  return data;
}
