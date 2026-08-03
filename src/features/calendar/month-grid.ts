import { isSameLocalDay } from '@/features/stats/session-stats'

export interface CalendarDay {
  /** local midnight epoch ms for that calendar date */
  dateMs: number
  year: number
  month: number // 1-12
  day: number // 1-31
  inCurrentMonth: boolean
}

export interface MonthGrid {
  year: number
  month: number // 1-12
  weeks: CalendarDay[][] // each week length 7
}

/** 로컬 자정 epoch ms. */
export function startOfLocalDay(dateMs: number): number {
  const d = new Date(dateMs)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** 맵 키용 로컬 날짜 문자열 `YYYY-MM-DD`. */
export function localDayKey(dateMs: number): string {
  const d = new Date(dateMs)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isLocalToday(dateMs: number, now: number = Date.now()): boolean {
  return isSameLocalDay(dateMs, now)
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

/** 일요일 시작 월 그리드. 앞·뒤 패딩으로 주를 채운다. */
export function buildMonthGrid(year: number, month: number): MonthGrid {
  const firstOfMonth = new Date(year, month - 1, 1)
  const startDow = firstOfMonth.getDay() // 0 = Sunday
  const lastDay = new Date(year, month, 0).getDate()
  const endDow = new Date(year, month - 1, lastDay).getDay()

  const totalDays = startDow + lastDay + (6 - endDow)
  const weeks: CalendarDay[][] = []

  for (let offset = 0; offset < totalDays; offset++) {
    const cell = new Date(year, month - 1, 1 - startDow + offset)
    const y = cell.getFullYear()
    const m = cell.getMonth() + 1
    const day = cell.getDate()
    const weekIndex = Math.floor(offset / 7)

    if (!weeks[weekIndex]) weeks[weekIndex] = []
    weeks[weekIndex].push({
      dateMs: new Date(y, m - 1, day).getTime(),
      year: y,
      month: m,
      day,
      inCurrentMonth: y === year && m === month,
    })
  }

  return { year, month, weeks }
}
