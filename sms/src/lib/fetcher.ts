import type { ApiResponse } from "@/lib/api-response";
import { apiFetch } from "@/utils/api-client";

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return (await res.json()) as T;
}

/**
 * SWR fetcher for internal API routes that follow the ApiResponse<T> shape.
 *
 * Use as: useSWR(["/users", token], apiResponseFetcher<User[]>).
 */
export function apiResponseFetcher<T>() {
  return async (path: string, token: string): Promise<T> => {
    const res: ApiResponse<T> = await apiFetch<T>(path, { token });

    if (!res.success) {
      throw new Error(res.message || "Request failed");
    }

    return (res.data ?? null) as T;
  };
}
