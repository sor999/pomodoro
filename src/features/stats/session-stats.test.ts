import { describe, it, expect } from 'vitest'

import {
  isSameLocalDay,
  computeStats,
  sortByRecent,
} from './session-stats'
import type { FocusSession } from '@/features/sessions/session'

// Local-time constructors so tests are independent of the machine's UTC offset.
function localTs(
  y: number,
  m: number,
  d: number,
  h = 12,
  min = 0,
): number {
  return new Date(y, m - 1, d, h, min).getTime()
}

function session(completedAt: number, focusMinutes = 25): FocusSession {
  return { id: `s-${completedAt}`, completedAt, focusMinutes }
}

describe('isSameLocalDay', () => {
  it('is true for two times on the same local calendar day', () => {
    expect(
      isSameLocalDay(localTs(2026, 7, 31, 0, 1), localTs(2026, 7, 31, 23, 59)),
    ).toBe(true)
  })

  it('is false across the local midnight boundary (today vs yesterday)', () => {
    const lastSecondYesterday = localTs(2026, 7, 30, 23, 59)
    const firstMinuteToday = localTs(2026, 7, 31, 0, 0)
    expect(isSameLocalDay(lastSecondYesterday, firstMinuteToday)).toBe(false)
  })

  it('is false for the same day-of-month in different months', () => {
    expect(isSameLocalDay(localTs(2026, 6, 31), localTs(2026, 7, 31))).toBe(
      false,
    )
  })

  it('is false for the same date in different years', () => {
    expect(isSameLocalDay(localTs(2025, 7, 31), localTs(2026, 7, 31))).toBe(
      false,
    )
  })
})

describe('computeStats', () => {
  it('returns all-zero stats for an empty session list', () => {
    expect(computeStats([], localTs(2026, 7, 31))).toEqual({
      todayCount: 0,
      todayMinutes: 0,
      totalCount: 0,
      totalMinutes: 0,
    })
  })

  it('counts 3 sessions completed today', () => {
    const now = localTs(2026, 7, 31, 15, 0)
    const sessions = [
      session(localTs(2026, 7, 31, 9, 0), 25),
      session(localTs(2026, 7, 31, 11, 0), 25),
      session(localTs(2026, 7, 31, 14, 0), 25),
    ]
    const stats = computeStats(sessions, now)
    expect(stats.todayCount).toBe(3)
    expect(stats.todayMinutes).toBe(75)
  })

  it('totals count and minutes across all sessions regardless of day', () => {
    const now = localTs(2026, 7, 31, 15, 0)
    const sessions = [
      session(localTs(2026, 7, 31, 9, 0), 25), // today
      session(localTs(2026, 7, 30, 9, 0), 50), // yesterday
      session(localTs(2026, 7, 29, 9, 0), 10), // two days ago
    ]
    const stats = computeStats(sessions, now)
    expect(stats.totalCount).toBe(3)
    expect(stats.totalMinutes).toBe(85)
    // only one of them is "today"
    expect(stats.todayCount).toBe(1)
    expect(stats.todayMinutes).toBe(25)
  })

  it('excludes a session completed just before local midnight from today', () => {
    const now = localTs(2026, 7, 31, 0, 5)
    const sessions = [session(localTs(2026, 7, 30, 23, 59), 25)]
    const stats = computeStats(sessions, now)
    expect(stats.todayCount).toBe(0)
    expect(stats.totalCount).toBe(1)
    expect(stats.totalMinutes).toBe(25)
  })
})

describe('sortByRecent', () => {
  it('returns a new array sorted by completedAt descending (most recent first)', () => {
    const a = session(localTs(2026, 7, 31, 9, 0))
    const b = session(localTs(2026, 7, 31, 12, 0))
    const c = session(localTs(2026, 7, 31, 15, 0))
    const input = [a, c, b]
    const sorted = sortByRecent(input)
    expect(sorted.map((s) => s.completedAt)).toEqual([
      c.completedAt,
      b.completedAt,
      a.completedAt,
    ])
  })

  it('does not mutate the input array', () => {
    const a = session(localTs(2026, 7, 31, 9, 0))
    const b = session(localTs(2026, 7, 31, 15, 0))
    const input = [a, b]
    const snapshot = [...input]
    const sorted = sortByRecent(input)
    expect(input).toEqual(snapshot)
    expect(sorted).not.toBe(input)
  })

  it('handles an empty list', () => {
    expect(sortByRecent([])).toEqual([])
  })
})
