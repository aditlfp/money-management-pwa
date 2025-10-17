import { ApiResponse } from "../state/types";

export async function toApiResponse<T>(
  promise: Promise<any>
): Promise<ApiResponse<T>> {
  const res = await promise;
  const data = res.body?.data ?? res.body;

  // detect which route was called
  const url = window.location.href;
  const isBalanceRoute = url?.includes("/balance");

  let normalized: any = null;

  if (Array.isArray(data)) {
    // already an array — keep as-is
    normalized = data;
  } else if (data && typeof data === "object") {
    // ✅ only wrap in array for /balance routes
    normalized = isBalanceRoute ? [data] : data;
  } else {
    normalized = null;
  }

  return {
    success: res.status >= 200 && res.status < 300,
    message: res.body?.message || "OK",
    data: normalized as T,
  };
}
