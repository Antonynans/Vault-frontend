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

