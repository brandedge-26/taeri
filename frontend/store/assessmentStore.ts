import type { Assessment, DurationCategory, FrequencyCategory, RiskLevel } from '@/types/assessment';
import axios from 'axios';
import { create } from 'zustand';
import { useAuthStore } from './authStore';

const BASE_URL = 'http://192.168.100.24:5510/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AddAssessmentPayload = Omit<Assessment, 'id'>;

type AssessmentState = {
  assessments: Assessment[];
  isLoading: boolean;
  error: string | null;

  fetchAssessments: () => Promise<void>;
  addAssessment: (payload: AddAssessmentPayload) => Promise<boolean>;
  removeAssessment: (id: string) => Promise<boolean>;
  removeAllAssessments: () => Promise<void>;
  getThisWeekAssessments: () => Assessment[];
  clearError: () => void;
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function getAuthHeader() {
  const token = useAuthStore.getState().accessToken;
  return { Authorization: `Bearer ${token}` };
}

function extractError(err: any): string {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}

// MongoDB _id ko frontend id mein map karo
function mapAssessment(raw: any): Assessment {
  return {
    id: raw._id,
    taskId: raw.taskId,
    taskName: raw.taskName,
    date: typeof raw.date === 'string' ? raw.date : new Date(raw.date).toISOString(),
    frequency: raw.frequency as FrequencyCategory,
    duration: raw.duration as DurationCategory,
    psychological: raw.psychological as 1 | 2 | 3,
    posture: raw.posture as 1 | 2 | 3,
    handling: raw.handling as 1 | 2 | 3,
    rawScore: raw.rawScore,
    adjustmentFactor: raw.adjustmentFactor,
    finalScore: raw.finalScore,
    riskLevel: raw.riskLevel as RiskLevel,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: [],
  isLoading: false,
  error: null,

  // ── FETCH ALL ──────────────────────────────────────────────────────────────
  fetchAssessments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`${BASE_URL}/assessments/get`, {
        headers: getAuthHeader(),
      });
      set({ assessments: data.assessments.map(mapAssessment), isLoading: false });
    } catch (err) {
      set({ error: extractError(err), isLoading: false });
    }
  },

  // ── ADD ────────────────────────────────────────────────────────────────────
  addAssessment: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${BASE_URL}/assessments/add`, payload, {
        headers: getAuthHeader(),
      });
      const newAssessment = mapAssessment(data.assessment);
      // Newest first
      set((state) => ({
        assessments: [newAssessment, ...state.assessments],
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({ error: extractError(err), isLoading: false });
      return false;
    }
  },

  // ── DELETE ONE ─────────────────────────────────────────────────────────────
  removeAssessment: async (id) => {
    try {
      await axios.delete(`${BASE_URL}/assessments/delete/${id}`, {
        headers: getAuthHeader(),
      });
      set((state) => ({
        assessments: state.assessments.filter((a) => a.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: extractError(err) });
      return false;
    }
  },

  // ── DELETE ALL ─────────────────────────────────────────────────────────────
  removeAllAssessments: async () => {
    const { assessments } = get();
    await Promise.all(
      assessments.map((a) =>
        axios.delete(`${BASE_URL}/assessments/delete/${a.id}`, {
          headers: getAuthHeader(),
        }),
      ),
    );
    set({ assessments: [] });
  },

  // ── THIS WEEK (computed) ───────────────────────────────────────────────────
  getThisWeekAssessments: () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return get().assessments.filter((a) => new Date(a.date) >= startOfWeek);
  },

  clearError: () => set({ error: null }),
}));
