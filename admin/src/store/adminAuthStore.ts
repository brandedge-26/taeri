"use client";
import { create } from "zustand";
import { adminAxios, setAdminToken } from "@/lib/axios";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

const SESSION_KEY = "taeri_admin_auth";

function saveSession(user: AdminUser, token: string) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, token })); } catch {}
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

function getSession(): { user: AdminUser; token: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  initAuth: () => {
    const session = getSession();
    if (session) {
      setAdminToken(session.token);
      set({ user: session.user, isAuthenticated: true, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    const res = await adminAxios.post("/admin/login", { email, password });
    const { accessToken, user } = res.data;
    setAdminToken(accessToken);
    saveSession(user, accessToken);
    set({ user, isAuthenticated: true, isInitialized: true });
  },

  logout: () => {
    setAdminToken(null);
    clearSession();
    set({ user: null, isAuthenticated: false });
  },
}));
