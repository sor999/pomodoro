import type { FocusSession } from '@/features/sessions/session'

export interface SessionStats {
  todayCount: number
  todayMinutes: number
  totalCount: number
  totalMinutes: number
}

/** 두 시각이 로컬 기준 같은 날(자정 경계)인지. */
export function isSameLocalDay(a: number, b: number): boolean {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

/** 오늘(로컬 자정 기준)·전체 완료 횟수와 총 집중 시간을 계산한다. */
export function computeStats(
  sessions: readonly FocusSession[],
  now: number = Date.now(),
): SessionStats {
  return sessions.reduce<SessionStats>(
    (acc, session) => {
      acc.totalCount += 1
      acc.totalMinutes += session.focusMinutes
      if (isSameLocalDay(session.completedAt, now)) {
        acc.todayCount += 1
        acc.todayMinutes += session.focusMinutes
      }
      return acc
    },
    { todayCount: 0, todayMinutes: 0, totalCount: 0, totalMinutes: 0 },
  )
}

/** 최근 완료순(내림차순) 정렬본을 새 배열로 반환한다. */
export function sortByRecent(
  sessions: readonly FocusSession[],
): FocusSession[] {
  return [...sessions].sort((a, b) => b.completedAt - a.completedAt)
}
