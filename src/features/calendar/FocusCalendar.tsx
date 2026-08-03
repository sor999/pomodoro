import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import type { FocusSession } from '@/features/sessions/session'
import { CalendarMonthHeader } from './CalendarMonthHeader'
import { DayCell } from './DayCell'
import { countByLocalDay, type DaySummary } from './day-sessions'
import {
  buildMonthGrid,
  localDayKey,
  startOfLocalDay,
} from './month-grid'

interface FocusCalendarProps {
  year: number
  month: number
  selectedDateMs: number
  onSelectDate: (dateMs: number) => void
  onMonthChange: (next: { year: number; month: number }) => void
  sessions: readonly FocusSession[]
  now: number
}

export function FocusCalendar({
  year,
  month,
  selectedDateMs,
  onSelectDate,
  onMonthChange,
  sessions,
  now,
}: FocusCalendarProps) {
  const grid = buildMonthGrid(year, month)
  const dayCounts = countByLocalDay(sessions)
  const selectedKey = localDayKey(selectedDateMs)
  const empty: DaySummary = { count: 0, minutes: 0 }

  const goToday = () => {
    const todayMs = startOfLocalDay(now)
    const d = new Date(todayMs)
    onMonthChange({ year: d.getFullYear(), month: d.getMonth() + 1 })
    onSelectDate(todayMs)
  }

  const handleSelect = (dateMs: number, cellYear: number, cellMonth: number) => {
    if (cellYear !== year || cellMonth !== month) {
      onMonthChange({ year: cellYear, month: cellMonth })
    }
    onSelectDate(dateMs)
  }

  return (
    <Card>
      <CardHeader>
        <CalendarMonthHeader
          year={year}
          month={month}
          onMonthChange={onMonthChange}
          onGoToday={goToday}
        />
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col gap-1"
          role="grid"
          aria-label={`${year}년 ${month}월 달력`}
        >
          {grid.weeks.map((week) => (
            <div
              key={localDayKey(week[0].dateMs)}
              role="row"
              className="grid grid-cols-7 gap-1"
            >
              {week.map((cell) => {
                const key = localDayKey(cell.dateMs)
                return (
                  <div key={key} role="gridcell">
                    <DayCell
                      dateMs={cell.dateMs}
                      day={cell.day}
                      inCurrentMonth={cell.inCurrentMonth}
                      isSelected={key === selectedKey}
                      summary={dayCounts.get(key) ?? empty}
                      now={now}
                      onSelect={(ms) => handleSelect(ms, cell.year, cell.month)}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
