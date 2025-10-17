// request.ts
import { ApiResponse } from "../state/types";

export async function request<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const body = await res.json();

    return {
      success: res.ok,
      message: body.message ?? (res.ok ? "Success" : "Failed"),
      data: body.data ?? null,
    };
  } catch (err) {
    console.error("Request error:", err);
    return {
      success: false,
      message: "Network error",
      data: null,
    };
  }
}
