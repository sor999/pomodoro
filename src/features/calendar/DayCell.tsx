import { cn } from '@/lib/utils'
import type { DaySummary } from './day-sessions'
import { isLocalToday } from './month-grid'

interface DayCellProps {
  dateMs: number
  day: number
  inCurrentMonth: boolean
  isSelected: boolean
  summary: DaySummary
  now: number
  onSelect: (dateMs: number) => void
}

export function DayCell({
  dateMs,
  day,
  inCurrentMonth,
  isSelected,
  summary,
  now,
  onSelect,
}: DayCellProps) {
  const isToday = isLocalToday(dateMs, now)
  const hasSessions = summary.count > 0
  const date = new Date(dateMs)
  const dateLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  const countLabel =
    summary.count > 0
      ? `, 집중 ${summary.count}회${summary.minutes > 0 ? ` ${summary.minutes}분` : ''}`
      : ', 기록 없음'

  return (
    <button
      type="button"
      onClick={() => onSelect(dateMs)}
      aria-label={`${dateLabel}${countLabel}${isToday ? ', 오늘' : ''}${isSelected ? ', 선택됨' : ''}`}
      aria-current={isToday ? 'date' : undefined}
      aria-pressed={isSelected}
      className={cn(
        'relative flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-0.5 py-1 text-center transition-colors',
        "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
        'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        inCurrentMonth ? 'text-ink' : 'text-ink-tertiary opacity-70',
        isSelected && 'bg-surface-3 ring-1 ring-primary',
        !isSelected && isToday && 'ring-1 ring-primary',
        !isSelected && !isToday && 'hover:bg-surface-2',
      )}
    >
      <span className="text-sm tabular-nums leading-none">{day}</span>
      {isToday && (
        <span className="sr-only">오늘</span>
      )}
      {hasSessions ? (
        <>
          <span className="text-[10px] leading-none text-ink-subtle tabular-nums">
            {summary.count}회
          </span>
          {summary.minutes > 0 && (
            <span className="text-[10px] leading-none text-ink-tertiary tabular-nums">
              {summary.minutes}분
            </span>
          )}
        </>
      ) : (
        <span className="h-2.5" aria-hidden="true" />
      )}
    </button>
  )
}
