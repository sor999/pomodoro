import { describe, it, expect } from 'vitest'

import {
  minutesToMs,
  formatClock,
  formatMinutesLabel,
} from './format-time'

describe('minutesToMs', () => {
  it('converts whole minutes to milliseconds', () => {
    expect(minutesToMs(25)).toBe(1_500_000)
    expect(minutesToMs(1)).toBe(60_000)
  })

  it('returns 0 for 0 minutes', () => {
    expect(minutesToMs(0)).toBe(0)
  })

  it('handles fractional minutes', () => {
    expect(minutesToMs(0.5)).toBe(30_000)
  })

  it('handles negative minutes', () => {
    expect(minutesToMs(-2)).toBe(-120_000)
  })
})

describe('formatClock', () => {
  it('formats a whole-minute duration', () => {
    expect(formatClock(1_500_000)).toBe('25:00')
  })

  it('ceils so the last second shows 00:01', () => {
    // 1ms remaining is still within the final second → shown as 00:01
    expect(formatClock(1)).toBe('00:01')
    expect(formatClock(999)).toBe('00:01')
    expect(formatClock(1_000)).toBe('00:01')
  })

  it('shows 00:02 for 1001ms (just past one second)', () => {
    expect(formatClock(1_001)).toBe('00:02')
  })

  it('clamps exactly 0ms to 00:00', () => {
    expect(formatClock(0)).toBe('00:00')
  })

  it('clamps negatives to 00:00', () => {
    expect(formatClock(-1)).toBe('00:00')
    expect(formatClock(-50_000)).toBe('00:00')
  })

  it('pads minutes and seconds to two digits', () => {
    // 65s = 1:05
    expect(formatClock(65_000)).toBe('01:05')
    // 5s = 00:05
    expect(formatClock(5_000)).toBe('00:05')
  })

  it('formats durations over ten minutes', () => {
    expect(formatClock(600_000)).toBe('10:00')
  })
})

describe('formatMinutesLabel', () => {
  it('renders under 60 minutes as "N분"', () => {
    expect(formatMinutesLabel(0)).toBe('0분')
    expect(formatMinutesLabel(25)).toBe('25분')
    expect(formatMinutesLabel(59)).toBe('59분')
  })

  it('renders exactly 60 minutes as "1시간"', () => {
    expect(formatMinutesLabel(60)).toBe('1시간')
  })

  it('renders whole hours without trailing minutes', () => {
    expect(formatMinutesLabel(120)).toBe('2시간')
  })

  it('renders hours with remaining minutes', () => {
    expect(formatMinutesLabel(90)).toBe('1시간 30분')
    expect(formatMinutesLabel(145)).toBe('2시간 25분')
  })
})
