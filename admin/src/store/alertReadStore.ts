import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AlertReadStore {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  unmarkRead: (id: string) => void; // when alert is deleted, clean up
  isRead: (id: string) => boolean;
  unreadCount: (totalIds: string[]) => number;
}

export const useAlertReadStore = create<AlertReadStore>()(
  persist(
    (set, get) => ({
      readIds: [],

      markRead: (id) =>
        set((s) => ({
          readIds: s.readIds.includes(id) ? s.readIds : [...s.readIds, id],
        })),

      markAllRead: (ids) =>
        set((s) => ({
          readIds: Array.from(new Set([...s.readIds, ...ids])),
        })),

      unmarkRead: (id) =>
        set((s) => ({ readIds: s.readIds.filter((r) => r !== id) })),

      isRead: (id) => get().readIds.includes(id),

      unreadCount: (totalIds) =>
        totalIds.filter((id) => !get().readIds.includes(id)).length,
    }),
    { name: "taeri_alert_read" },
  ),
);
