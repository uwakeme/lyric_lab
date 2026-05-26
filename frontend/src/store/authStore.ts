// Auth store using Zustand
import { create } from 'zustand';
import type { User } from '../types';
import * as authService from '../services/authService';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login(email, password);
      const user = await authService.fetchCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '登录失败',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(email, password);
      // After registration, login automatically
      await authService.login(email, password);
      const user = await authService.fetchCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '注册失败',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    authService.clearTokens();
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    if (!authService.isAuthenticated()) {
      set({ isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.fetchCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      authService.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}))