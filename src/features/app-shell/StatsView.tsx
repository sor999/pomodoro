import { useState } from 'react'

import { FocusCalendar } from '@/features/calendar/FocusCalendar'
import { startOfLocalDay } from '@/features/calendar/month-grid'
import { SessionList } from '@/features/sessions/SessionList'
import { useSessionLogStore } from '@/features/sessions/session-log-store'
import { StatsPanel } from '@/features/stats/StatsPanel'
import { useNow } from '@/lib/useNow'

export function StatsView() {
  const sessions = useSessionLogStore((state) => state.sessions)
  const now = useNow()

  const today = new Date(now)
  const [selectedDateMs, setSelectedDateMs] = useState(() =>
    startOfLocalDay(now),
  )
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  }))

  return (
    <div
      role="tabpanel"
      id="panel-stats"
      aria-labelledby="tab-stats"
      className="flex flex-col gap-8"
    >
      <StatsPanel />
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <FocusCalendar
          year={visibleMonth.year}
          month={visibleMonth.month}
          selectedDateMs={selectedDateMs}
          onSelectDate={setSelectedDateMs}
          onMonthChange={setVisibleMonth}
          sessions={sessions}
          now={now}
        />
        <SessionList filterDayMs={selectedDateMs} />
      </div>
    </div>
  )
}
