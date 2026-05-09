import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const BASE_URL = 'https://respectful-adaptation-production-6e01.up.railway.app/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthUser = {
  userId: string;
  name: string;
  email: string;
  age: number;
  profilePicture?: string | null;
  livingSituation?: 'alone' | 'family' | 'spouse';
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  age: number;
  livingSituation: 'alone' | 'family' | 'spouse';
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  pendingEmail: string | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean; // app restart ke baad state restore ho gayi ya nahi

  setHasHydrated: (v: boolean) => void;
  register: (payload: RegisterPayload) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  updateProfile: (name: string, age: number) => Promise<boolean>;
  uploadAvatar: (imageUri: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function extractError(err: any): string {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(

    (set, get) => ({
      user: null,
      accessToken: null,
      pendingEmail: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      // ── REGISTER ────────────────────────────────────────────────────────────
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/register`, payload);
          set({ user: data.user, pendingEmail: payload.email, isLoading: false });
          return true;
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },



      // ── VERIFY OTP ──────────────────────────────────────────────────────────
      verifyOtp: async (otp) => {

        const email = get().pendingEmail;

        if (!email) {
          set({ error: 'Email not found. Please register again.' });
          return false;
        }

        set({ isLoading: true, error: null });

        try {

          await axios.post(`${BASE_URL}/auth/verify-otp`, { email, otp });
          set({ pendingEmail: null, isLoading: false });
          return true;

        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },



      // ── LOGIN ───────────────────────────────────────────────────────────────
      login: async (email, password) => {

        set({ isLoading: true, error: null });

        try {

          const { data } = await axios.post(`${BASE_URL}/auth/login`, { email, password });
          set({ user: data.user, accessToken: data.accessToken, isLoading: false });
          return true;

        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },



      // ── LOGOUT ──────────────────────────────────────────────────────────────
      logout: async () => {
        set({ user: null, accessToken: null, error: null });
      },

      // ── DELETE ACCOUNT ──────────────────────────────────────────────────────
      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = get().accessToken;
          await axios.delete(`${BASE_URL}/auth/delete-account`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: null, accessToken: null, isLoading: false, error: null });
          return true;
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },

      // ── UPDATE PROFILE ──────────────────────────────────────────────────────
      updateProfile: async (name, age) => {
        set({ isLoading: true, error: null });
        try {
          const token = get().accessToken;
          const { data } = await axios.patch(
            `${BASE_URL}/auth/update-profile`,
            { name, age, livingSituation: get().user?.livingSituation ?? 'alone' },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          set({ user: data.user, isLoading: false });
          return true;
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },

      // ── UPLOAD AVATAR ───────────────────────────────────────────────────────
      uploadAvatar: async (imageUri) => {
        set({ isLoading: true, error: null });
        try {
          const token = get().accessToken;
          const formData = new FormData();
          const filename = imageUri.split('/').pop() ?? 'avatar.jpg';
          const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
          formData.append('avatar', { uri: imageUri, name: filename, type: mimeType } as any);

          const { data } = await axios.patch(`${BASE_URL}/auth/upload-avatar`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
          set({ user: data.user, isLoading: false });
          return true;
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },

      // ── FORGOT PASSWORD ─────────────────────────────────────────────────────
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(`${BASE_URL}/auth/forgot-password`, { email });
          set({ isLoading: false });
          return true;
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },

      // ── RESET PASSWORD ──────────────────────────────────────────────────────
      resetPassword: async (email, otp, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(`${BASE_URL}/auth/reset-password`, { email, otp, newPassword });
          set({ isLoading: false });
          return true;
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),

    {
      name: 'auth-storage', // AsyncStorage mein yeh key se save hoga
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
