import type { FocusSession } from '@/features/sessions/session'
import { isSameLocalDay } from '@/features/stats/session-stats'
import { localDayKey } from './month-grid'

export interface DaySummary {
  count: number
  minutes: number
}

export function filterSessionsOnDay(
  sessions: readonly FocusSession[],
  dayMs: number,
): FocusSession[] {
  return sessions.filter((session) =>
    isSameLocalDay(session.completedAt, dayMs),
  )
}

export function summarizeDay(
  sessions: readonly FocusSession[],
  dayMs: number,
): DaySummary {
  return filterSessionsOnDay(sessions, dayMs).reduce<DaySummary>(
    (acc, session) => {
      acc.count += 1
      acc.minutes += session.focusMinutes
      return acc
    },
    { count: 0, minutes: 0 },
  )
}

/** 로컬 일 키(`YYYY-MM-DD`)별 완료 횟수·집중 분 합계. */
export function countByLocalDay(
  sessions: readonly FocusSession[],
): Map<string, DaySummary> {
  const map = new Map<string, DaySummary>()
  for (const session of sessions) {
    const key = localDayKey(session.completedAt)
    const current = map.get(key) ?? { count: 0, minutes: 0 }
    current.count += 1
    current.minutes += session.focusMinutes
    map.set(key, current)
  }
  return map
}
