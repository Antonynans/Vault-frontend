import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ─── In-memory access token ───────────────────────────────────────────────────
let _accessToken: string | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string | null) => {
    _accessToken = token;
  },
  clear: () => {
    _accessToken = null;
  },
};

// ─── Cookie helpers for refresh token + userId ────────────────────────────────
const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 7, // 7 days — match your backend's refresh token TTL
  sameSite: "Strict",
  secure: process.env.NODE_ENV === "production",
};

export const authCookies = {
  setRefresh: (token: string, userId: string) => {
    Cookies.set("vault_refresh_token", token, COOKIE_OPTS);
    Cookies.set("vault_user_id", userId, COOKIE_OPTS);
  },
  getRefresh: () => ({
    refreshToken: Cookies.get("vault_refresh_token") ?? null,
    userId: Cookies.get("vault_user_id") ?? null,
  }),
  clear: () => {
    Cookies.remove("vault_refresh_token");
    Cookies.remove("vault_user_id");
  },
};

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: silent refresh on 401 ─────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (original.headers)
              original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const { refreshToken, userId } = authCookies.getRefresh();

      if (!refreshToken || !userId) {
        throw new Error("No refresh credentials");
      }

      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken, userId },
        { withCredentials: true },
      );

      const newAccessToken: string = data.data?.accessToken ?? data.accessToken;
      tokenStore.set(newAccessToken);

      // Rotate refresh token if the server issued a new one
      const newRefresh = data.data?.refreshToken ?? data.refreshToken;
      if (newRefresh) authCookies.setRefresh(newRefresh, userId);

      processQueue(null, newAccessToken);
      if (original.headers)
        original.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStore.clear();
      authCookies.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post("/auth/register", body),

  login: (body: { email: string; password: string }) =>
    api.post("/auth/login", body),

  refresh: (refreshToken: string, userId: string) =>
    axios.post(
      `${BASE_URL}/auth/refresh`,
      { refreshToken, userId },
      { withCredentials: true },
    ),

  logout: () => api.post("/auth/logout"),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => api.get("/users/me"),
  list: (page = 1, limit = 20) => api.get(`/users?page=${page}&limit=${limit}`),
  deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
};

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const accountsApi = {
  create: (body: { currency: string; name?: string }) =>
    api.post("/accounts", body),
  list: () => api.get("/accounts"),
  get: (id: string) => api.get(`/accounts/${id}`),
  freeze: (id: string) => api.patch(`/accounts/${id}/freeze`),
  unfreeze: (id: string) => api.patch(`/accounts/${id}/unfreeze`),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsApi = {
  transfer: (body: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    idempotencyKey?: string;
  }) =>
    api.post("/transactions/transfer", body, {
      headers: body.idempotencyKey
        ? { "Idempotency-Key": body.idempotencyKey }
        : {},
    }),
  deposit: (body: {
    accountId: string;
    amount: number;
    description?: string;
  }) => api.post("/transactions/deposit", body),
  withdraw: (body: {
    accountId: string;
    amount: number;
    description?: string;
  }) => api.post("/transactions/withdraw", body),
  history: (accountId: string, page = 1, limit = 20) =>
    api.get(`/transactions/account/${accountId}?page=${page}&limit=${limit}`),
  getByRef: (ref: string) => api.get(`/transactions/ref/${ref}`),
};

// ─── Wallets ──────────────────────────────────────────────────────────────────

export const walletsApi = {
  limits: (accountId: string) =>
    api.get(`/wallets/account/${accountId}/limits`),
  upgrade: (accountId: string, body: { tier: string }) =>
    api.patch(`/wallets/account/${accountId}/upgrade`, body),
};

// ─── KYC ──────────────────────────────────────────────────────────────────────

export const kycApi = {
  submit: (body: object) => api.post("/kyc/submit", body),
  me: () => api.get("/kyc/me"),
  pending: () => api.get("/kyc/pending"),
  review: (id: string, body: { status: string; note?: string }) =>
    api.patch(`/kyc/${id}/review`, body),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (page = 1, limit = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),
  unreadCount: () => api.get("/notifications/unread-count"),
  read: (id: string) => api.patch(`/notifications/${id}/read`),
  readAll: () => api.patch("/notifications/read-all"),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () => api.get("/admin/stats"),
  userGrowth: () => api.get("/admin/user-growth"),
};

// ─── Statements ───────────────────────────────────────────────────────────────

export const statementsApi = {
  csv: (accountId: string) =>
    api.get(`/statements/${accountId}/csv`, { responseType: "blob" }),
};

// ─── Beneficiaries ────────────────────────────────────────────────────────────

export const beneficiariesApi = {
  list: () => api.get("/beneficiaries"),
  create: (body: object) => api.post("/beneficiaries", body),
  delete: (id: string) => api.delete(`/beneficiaries/${id}`),
};

// ─── Transaction PIN ──────────────────────────────────────────────────────────

export const pinApi = {
  set: (body: { pin: string }) => api.post("/transaction-pin/set", body),
  change: (body: { oldPin: string; newPin: string }) =>
    api.patch("/transaction-pin/change", body),
  verify: (body: { pin: string }) => api.post("/transaction-pin/verify", body),
};
