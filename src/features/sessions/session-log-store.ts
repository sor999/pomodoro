import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createFocusSession, type FocusSession } from './session'

export interface SessionLogState {
  sessions: FocusSession[]
  addFocusSession: (focusMinutes: number, completedAt?: number) => void
  removeSession: (id: string) => void
  clearAll: () => void
}

export const SESSION_LOG_STORAGE_KEY = 'pomodoro-focus-log'

export const useSessionLogStore = create<SessionLogState>()(
  persist(
    (set) => ({
      sessions: [],
      addFocusSession: (focusMinutes, completedAt) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            createFocusSession(focusMinutes, completedAt),
          ],
        })),
      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
        })),
      clearAll: () => set({ sessions: [] }),
    }),
    {
      name: SESSION_LOG_STORAGE_KEY,
      version: 1,
    },
  ),
)
