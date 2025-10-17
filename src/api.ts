const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
import { toApiResponse } from "./utils/api-utils";
import { Transaction, ApiResponse, OverviewData, Balance } from "./state/types";

// request.ts
async function request(path: string, opts: any) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const text = await res.text();

  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch {
    return { status: res.status, body: text };
  }
}

export const authApi = {
  register: (email: string, password: string): Promise<any> =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (
    email: string,
    password: string
  ): Promise<{ status: number; body?: { token?: string; _id: string } }> =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

export const txnApi = {
  list: (): Promise<ApiResponse<Transaction[]>> =>
    toApiResponse<Transaction[]>(request("/transactions", {})),

  create: (
    payload: Omit<Transaction, "_id">
  ): Promise<ApiResponse<Transaction>> =>
    toApiResponse<Transaction>(
      request("/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ),

  del: (_id: string | number): Promise<ApiResponse<null>> =>
    toApiResponse<null>(request(`/transactions/${_id}`, { method: "DELETE" })),
};

export const overviewApi = {
  get: (): Promise<ApiResponse<OverviewData>> =>
    toApiResponse<OverviewData>(request("/overview", {})),
};

export const balanceApi = {
  list: (): Promise<ApiResponse<Balance[]>> =>
    toApiResponse<Balance[]>(request("/balance", {})),

  create: (payload: unknown): Promise<ApiResponse<Balance>> =>
    toApiResponse<Balance>(
      request("/balance", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ),

  del: (id: string | number): Promise<ApiResponse<null>> =>
    toApiResponse<null>(request(`/balance/${id}`, { method: "DELETE" })),
};
