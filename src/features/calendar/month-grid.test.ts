import { describe, it, expect } from 'vitest'

import {
  buildMonthGrid,
  shiftMonth,
  localDayKey,
  startOfLocalDay,
  isLocalToday,
} from './month-grid'

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

describe('startOfLocalDay', () => {
  it('returns local midnight for a midday timestamp', () => {
    const noon = localTs(2026, 7, 31, 12, 30)
    const midnight = startOfLocalDay(noon)
    const d = new Date(midnight)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(6)
    expect(d.getDate()).toBe(31)
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(d.getSeconds()).toBe(0)
  })
})

describe('localDayKey', () => {
  it('formats as YYYY-MM-DD in local time', () => {
    expect(localDayKey(localTs(2026, 7, 31, 15, 0))).toBe('2026-07-31')
    expect(localDayKey(localTs(2026, 1, 5, 0, 0))).toBe('2026-01-05')
  })
})

describe('isLocalToday', () => {
  it('is true for the same local day as now', () => {
    expect(isLocalToday(localTs(2026, 7, 31, 9, 0), localTs(2026, 7, 31, 18, 0))).toBe(
      true,
    )
  })

  it('is false across midnight', () => {
    expect(
      isLocalToday(localTs(2026, 7, 30, 23, 59), localTs(2026, 7, 31, 0, 1)),
    ).toBe(false)
  })
})

describe('shiftMonth', () => {
  it('moves forward within the same year', () => {
    expect(shiftMonth(2026, 7, 1)).toEqual({ year: 2026, month: 8 })
  })

  it('moves backward within the same year', () => {
    expect(shiftMonth(2026, 7, -1)).toEqual({ year: 2026, month: 6 })
  })

  it('crosses the year boundary forward', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
  })

  it('crosses the year boundary backward', () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
  })

  it('handles multi-month deltas', () => {
    expect(shiftMonth(2026, 7, 6)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth(2026, 3, -5)).toEqual({ year: 2025, month: 10 })
  })
})

describe('buildMonthGrid', () => {
  it('builds a complete Sunday-start grid for July 2026', () => {
    // July 1 2026 is Wednesday → pad Sun Jun 28 … Tue Jun 30
    // July 31 2026 is Friday → pad Sat Aug 1
    const grid = buildMonthGrid(2026, 7)

    expect(grid.year).toBe(2026)
    expect(grid.month).toBe(7)
    expect(grid.weeks.length).toBeGreaterThanOrEqual(5)

    for (const week of grid.weeks) {
      expect(week).toHaveLength(7)
    }

    const first = grid.weeks[0][0]
    expect(first.year).toBe(2026)
    expect(first.month).toBe(6)
    expect(first.day).toBe(28)
    expect(first.inCurrentMonth).toBe(false)
    expect(new Date(first.dateMs).getDay()).toBe(0) // Sunday

    const july1 = grid.weeks[0][3]
    expect(july1.day).toBe(1)
    expect(july1.month).toBe(7)
    expect(july1.inCurrentMonth).toBe(true)
    expect(july1.dateMs).toBe(new Date(2026, 6, 1).getTime())

    const lastWeek = grid.weeks[grid.weeks.length - 1]
    const last = lastWeek[lastWeek.length - 1]
    expect(last.day).toBe(1)
    expect(last.month).toBe(8)
    expect(last.inCurrentMonth).toBe(false)
    expect(new Date(last.dateMs).getDay()).toBe(6) // Saturday
  })

  it('marks only current-month days as inCurrentMonth', () => {
    const grid = buildMonthGrid(2026, 7)
    const current = grid.weeks.flat().filter((d) => d.inCurrentMonth)
    const outside = grid.weeks.flat().filter((d) => !d.inCurrentMonth)

    expect(current).toHaveLength(31)
    expect(outside.length).toBeGreaterThan(0)
    expect(current.every((d) => d.month === 7 && d.year === 2026)).toBe(true)
  })

  it('uses local midnight for every cell dateMs', () => {
    const grid = buildMonthGrid(2026, 2)
    for (const day of grid.weeks.flat()) {
      const d = new Date(day.dateMs)
      expect(d.getHours()).toBe(0)
      expect(d.getMinutes()).toBe(0)
      expect(d.getSeconds()).toBe(0)
      expect(d.getMilliseconds()).toBe(0)
      expect(d.getDate()).toBe(day.day)
    }
  })
})
