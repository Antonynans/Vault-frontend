export type Currency = "NGN" | "USD" | "GBP" | "EUR";
export type WalletTier = "Basic" | "Standard" | "Premium";
export type AccountStatus = "active" | "frozen" | "closed";
export type TxType = "transfer" | "deposit" | "withdrawal";
export type TxStatus = "completed" | "pending" | "failed";
export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  currency: Currency;
  name?: string;
  balance: number;
  status: AccountStatus;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  status: TxStatus;
  amount: number;
  currency: Currency;
  reference: string;
  description?: string;
  fromAccountId?: string;
  toAccountId?: string;
  createdAt: string;
}

export interface WalletLimits {
  tier: WalletTier;
  singleTxLimit: number;
  monthlyLimit: number;
  currency: Currency;
  usedThisMonth: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalVolume: number;
  pendingKyc: number;
}

export interface KycRecord {
  id: string;
  userId: string;
  status: KycStatus;
  documentType?: string;
  submittedAt?: string;
  reviewedAt?: string;
  note?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
