import { create } from "zustand";
import { User } from "@/lib/types";
import { tokenStore, authApi, authCookies } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;

  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { refreshToken, userId } = authCookies.getRefresh();

      if (!refreshToken || !userId) {
        set({ user: null, isLoading: false });
        return;
      }

      const { data: refreshData } = await authApi.refresh(refreshToken, userId);
      const accessToken: string =
        refreshData.data?.accessToken ?? refreshData.accessToken;
      tokenStore.set(accessToken);

      const newRefresh =
        refreshData.data?.refreshToken ?? refreshData.refreshToken;
      if (newRefresh) authCookies.setRefresh(newRefresh, userId);

      const { usersApi } = await import("@/lib/api");
      const { data: userData } = await usersApi.me();
      set({ user: userData.data ?? userData, isLoading: false });
    } catch {
      tokenStore.clear();
      authCookies.clear();
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      tokenStore.clear();
      authCookies.clear();
      set({ user: null });
    }
  },
}));
