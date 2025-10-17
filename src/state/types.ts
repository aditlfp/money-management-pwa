// types.ts
export interface Transaction {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface OverviewData {
  totalIncome: number;
  totalExpense: number;
  baseBalance: number;
  currentBalance: number;
  lastUpdated: string;
}

export interface Balance {
  _id: string;
  userId: string;
  amount: number;
  note: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}
