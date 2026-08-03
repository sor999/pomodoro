import { describe, it, expect } from 'vitest'

import type { FocusSession } from '@/features/sessions/session'
import {
  filterSessionsOnDay,
  summarizeDay,
  countByLocalDay,
} from './day-sessions'
import { localDayKey } from './month-grid'

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

describe('filterSessionsOnDay', () => {
  it('returns empty for an empty session list', () => {
    expect(filterSessionsOnDay([], localTs(2026, 7, 31))).toEqual([])
  })

  it('keeps multiple sessions on the same local day', () => {
    const day = localTs(2026, 7, 31, 0, 0)
    const a = session(localTs(2026, 7, 31, 9, 0), 25)
    const b = session(localTs(2026, 7, 31, 14, 0), 50)
    const other = session(localTs(2026, 7, 30, 23, 59), 25)

    expect(filterSessionsOnDay([a, other, b], day)).toEqual([a, b])
  })

  it('excludes sessions on different local days', () => {
    const day = localTs(2026, 7, 31)
    const sessions = [
      session(localTs(2026, 7, 30, 12, 0)),
      session(localTs(2026, 8, 1, 0, 0)),
      session(localTs(2025, 7, 31, 12, 0)),
    ]
    expect(filterSessionsOnDay(sessions, day)).toEqual([])
  })
})

describe('summarizeDay', () => {
  it('returns zeros for empty or no matching sessions', () => {
    expect(summarizeDay([], localTs(2026, 7, 31))).toEqual({
      count: 0,
      minutes: 0,
    })
    expect(
      summarizeDay(
        [session(localTs(2026, 7, 30))],
        localTs(2026, 7, 31),
      ),
    ).toEqual({ count: 0, minutes: 0 })
  })

  it('sums count and minutes for sessions on that day', () => {
    const day = localTs(2026, 7, 31)
    const sessions = [
      session(localTs(2026, 7, 31, 9, 0), 25),
      session(localTs(2026, 7, 31, 11, 0), 30),
      session(localTs(2026, 7, 30, 9, 0), 50),
    ]
    expect(summarizeDay(sessions, day)).toEqual({ count: 2, minutes: 55 })
  })
})

describe('countByLocalDay', () => {
  it('returns an empty map for no sessions', () => {
    expect(countByLocalDay([]).size).toBe(0)
  })

  it('groups by local day key and sums minutes', () => {
    const sessions = [
      session(localTs(2026, 7, 31, 9, 0), 25),
      session(localTs(2026, 7, 31, 14, 0), 25),
      session(localTs(2026, 7, 30, 10, 0), 50),
    ]
    const map = countByLocalDay(sessions)

    expect(map.get(localDayKey(localTs(2026, 7, 31)))).toEqual({
      count: 2,
      minutes: 50,
    })
    expect(map.get(localDayKey(localTs(2026, 7, 30)))).toEqual({
      count: 1,
      minutes: 50,
    })
    expect(map.size).toBe(2)
  })
})
