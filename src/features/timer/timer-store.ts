import { create } from 'zustand'

import {
  applySettings,
  advanceToNextMode,
  createInitialTimer,
  pause,
  reset,
  resume,
  start,
  tick,
  type TimerSettings,
  type TimerSnapshot,
} from './timer-state'

export interface TimerStore extends TimerSnapshot {
  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  tick: () => void
  advanceToNextMode: () => void
  setSettings: (settings: TimerSettings) => void
}

export const useTimerStore = create<TimerStore>()((set) => ({
  ...createInitialTimer(),
  start: () => set((state) => start(state, Date.now())),
  pause: () => set((state) => pause(state, Date.now())),
  resume: () => set((state) => resume(state, Date.now())),
  reset: () => set((state) => reset(state)),
  tick: () => set((state) => tick(state, Date.now())),
  advanceToNextMode: () => set((state) => advanceToNextMode(state)),
  setSettings: (settings) => set((state) => applySettings(state, settings)),
}))
