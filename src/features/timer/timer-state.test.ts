import { describe, it, expect } from 'vitest'

import {
  DEFAULT_SETTINGS,
  durationMsFor,
  createInitialTimer,
  start,
  pause,
  resume,
  reset,
  tick,
  hasReachedZero,
  advanceToNextMode,
  applySettings,
  type TimerSettings,
} from './timer-state'

const SETTINGS: TimerSettings = { focusMinutes: 25, breakMinutes: 5 }
const FOCUS_MS = 25 * 60_000
const BREAK_MS = 5 * 60_000

describe('durationMsFor', () => {
  it('returns focus duration in ms', () => {
    expect(durationMsFor('focus', SETTINGS)).toBe(FOCUS_MS)
  })

  it('returns break duration in ms', () => {
    expect(durationMsFor('break', SETTINGS)).toBe(BREAK_MS)
  })
})

describe('createInitialTimer', () => {
  it('starts in focus/idle with full remaining time', () => {
    const t = createInitialTimer(SETTINGS)
    expect(t.mode).toBe('focus')
    expect(t.status).toBe('idle')
    expect(t.endsAt).toBeNull()
    expect(t.remainingMs).toBe(FOCUS_MS)
    expect(t.settings).toBe(SETTINGS)
  })

  it('uses DEFAULT_SETTINGS when none provided', () => {
    const t = createInitialTimer()
    expect(t.settings).toEqual(DEFAULT_SETTINGS)
    expect(t.remainingMs).toBe(FOCUS_MS)
  })
})

describe('start', () => {
  it('idle → running sets endsAt = now + remaining', () => {
    const t = createInitialTimer(SETTINGS)
    const now = 1_000_000
    const started = start(t, now)
    expect(started.status).toBe('running')
    expect(started.endsAt).toBe(now + FOCUS_MS)
    expect(started.remainingMs).toBe(FOCUS_MS)
  })

  it('is a no-op when already running (returns same snapshot)', () => {
    const t = start(createInitialTimer(SETTINGS), 1_000_000)
    const again = start(t, 2_000_000)
    expect(again).toBe(t)
  })

  it('resets to full mode duration when remaining is exhausted (0)', () => {
    const drained = { ...createInitialTimer(SETTINGS), remainingMs: 0 }
    const now = 5_000
    const started = start(drained, now)
    expect(started.remainingMs).toBe(FOCUS_MS)
    expect(started.endsAt).toBe(now + FOCUS_MS)
  })

  it('resumes from a partial remaining time (paused-like snapshot)', () => {
    const partial = { ...createInitialTimer(SETTINGS), remainingMs: 10_000 }
    const now = 5_000
    const started = start(partial, now)
    expect(started.remainingMs).toBe(10_000)
    expect(started.endsAt).toBe(now + 10_000)
  })
})

describe('pause', () => {
  it('running → paused freezes remaining based on now, clears endsAt', () => {
    const startNow = 1_000_000
    const running = start(createInitialTimer(SETTINGS), startNow)
    // 3 seconds later
    const paused = pause(running, startNow + 3_000)
    expect(paused.status).toBe('paused')
    expect(paused.endsAt).toBeNull()
    expect(paused.remainingMs).toBe(FOCUS_MS - 3_000)
  })

  it('clamps frozen remaining to 0 if paused past the end', () => {
    const startNow = 0
    const running = start(createInitialTimer(SETTINGS), startNow)
    const paused = pause(running, startNow + FOCUS_MS + 5_000)
    expect(paused.remainingMs).toBe(0)
  })

  it('is a no-op when not running', () => {
    const idle = createInitialTimer(SETTINGS)
    expect(pause(idle, 1)).toBe(idle)
  })
})

describe('resume', () => {
  it('paused → running continues from the frozen remainingMs, not wall clock', () => {
    const startNow = 1_000_000
    const running = start(createInitialTimer(SETTINGS), startNow)
    const paused = pause(running, startNow + 3_000) // remaining = FOCUS_MS - 3000
    // Resume much later — should continue from frozen remaining, ignoring elapsed pause time.
    const resumeNow = startNow + 10 * 60_000
    const resumed = resume(paused, resumeNow)
    expect(resumed.status).toBe('running')
    expect(resumed.remainingMs).toBe(FOCUS_MS - 3_000)
    expect(resumed.endsAt).toBe(resumeNow + (FOCUS_MS - 3_000))
  })

  it('is a no-op when not paused', () => {
    const running = start(createInitialTimer(SETTINGS), 0)
    expect(resume(running, 100)).toBe(running)
  })
})

describe('reset', () => {
  it('returns current-mode full duration and produces no record', () => {
    const running = start(createInitialTimer(SETTINGS), 1_000)
    const ticked = tick(running, 1_000 + 12_345)
    const r = reset(ticked)
    expect(r.status).toBe('idle')
    expect(r.endsAt).toBeNull()
    expect(r.remainingMs).toBe(FOCUS_MS)
    expect(r.mode).toBe('focus')
  })

  it('resets to break duration when in break mode', () => {
    const inBreak = advanceToNextMode(createInitialTimer(SETTINGS))
    const running = start(inBreak, 0)
    const r = reset(tick(running, 20_000))
    expect(r.mode).toBe('break')
    expect(r.remainingMs).toBe(BREAK_MS)
  })
})

describe('tick', () => {
  it('recomputes remaining from endsAt while running', () => {
    const startNow = 100_000
    const running = start(createInitialTimer(SETTINGS), startNow)
    const ticked = tick(running, startNow + 7_000)
    expect(ticked.remainingMs).toBe(FOCUS_MS - 7_000)
    expect(ticked.status).toBe('running')
  })

  it('clamps remaining to 0 past the end', () => {
    const running = start(createInitialTimer(SETTINGS), 0)
    const ticked = tick(running, FOCUS_MS + 1_000)
    expect(ticked.remainingMs).toBe(0)
  })

  it('is a no-op when not running', () => {
    const idle = createInitialTimer(SETTINGS)
    expect(tick(idle, 999)).toBe(idle)
  })
})

describe('hasReachedZero', () => {
  it('is true exactly at endsAt (0ms remaining boundary)', () => {
    const startNow = 0
    const running = start(createInitialTimer(SETTINGS), startNow)
    expect(hasReachedZero(running, startNow + FOCUS_MS)).toBe(true)
  })

  it('is true past endsAt', () => {
    const running = start(createInitialTimer(SETTINGS), 0)
    expect(hasReachedZero(running, FOCUS_MS + 500)).toBe(true)
  })

  it('is false before endsAt', () => {
    const running = start(createInitialTimer(SETTINGS), 0)
    expect(hasReachedZero(running, FOCUS_MS - 1)).toBe(false)
  })

  it('is false when not running', () => {
    const idle = createInitialTimer(SETTINGS)
    expect(hasReachedZero(idle, 10 ** 12)).toBe(false)
  })
})

describe('advanceToNextMode', () => {
  it('flips focus → break, lands idle with break duration, no auto-start', () => {
    const running = start(createInitialTimer(SETTINGS), 0)
    const next = advanceToNextMode(running)
    expect(next.mode).toBe('break')
    expect(next.status).toBe('idle')
    expect(next.endsAt).toBeNull()
    expect(next.remainingMs).toBe(BREAK_MS)
  })

  it('flips break → focus', () => {
    const inBreak = advanceToNextMode(createInitialTimer(SETTINGS))
    const back = advanceToNextMode(inBreak)
    expect(back.mode).toBe('focus')
    expect(back.status).toBe('idle')
    expect(back.remainingMs).toBe(FOCUS_MS)
  })
})

describe('applySettings', () => {
  it('updates remainingMs to new mode duration when idle', () => {
    const idle = createInitialTimer(SETTINGS)
    const updated = applySettings(idle, { focusMinutes: 50, breakMinutes: 10 })
    expect(updated.settings).toEqual({ focusMinutes: 50, breakMinutes: 10 })
    expect(updated.remainingMs).toBe(50 * 60_000)
  })

  it('does NOT change remainingMs while running (applies from next session)', () => {
    const startNow = 0
    const running = start(createInitialTimer(SETTINGS), startNow)
    const ticked = tick(running, 5_000) // remaining = FOCUS_MS - 5000
    const updated = applySettings(ticked, { focusMinutes: 50, breakMinutes: 10 })
    expect(updated.settings).toEqual({ focusMinutes: 50, breakMinutes: 10 })
    expect(updated.remainingMs).toBe(FOCUS_MS - 5_000)
    expect(updated.status).toBe('running')
  })

  it('does NOT change remainingMs while paused', () => {
    const running = start(createInitialTimer(SETTINGS), 0)
    const paused = pause(running, 4_000) // remaining = FOCUS_MS - 4000
    const updated = applySettings(paused, { focusMinutes: 50, breakMinutes: 10 })
    expect(updated.remainingMs).toBe(FOCUS_MS - 4_000)
    expect(updated.status).toBe('paused')
  })
})
