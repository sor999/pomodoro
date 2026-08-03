import { CalendarCheck, Clock } from 'lucide-react'

import { useSessionLogStore } from '@/features/sessions/session-log-store'
import { formatMinutesLabel } from '@/lib/format-time'
import { useNow } from '@/lib/useNow'
import { computeStats } from './session-stats'

/** 타이머 탭용 오늘 집중 1줄 요약. */
export function TodaySummary() {
  const sessions = useSessionLogStore((state) => state.sessions)
  const now = useNow()
  const stats = computeStats(sessions, now)

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-subtle">
      <span className="inline-flex items-center gap-1.5">
        <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
        오늘 {stats.todayCount}회
      </span>
      <span className="text-hairline-strong" aria-hidden="true">
        ·
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-4 shrink-0" aria-hidden="true" />
        {formatMinutesLabel(stats.todayMinutes)}
      </span>
    </p>
  )
}
