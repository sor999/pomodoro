import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { shiftMonth } from './month-grid'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

interface CalendarMonthHeaderProps {
  year: number
  month: number
  onMonthChange: (next: { year: number; month: number }) => void
  onGoToday: () => void
}

export function CalendarMonthHeader({
  year,
  month,
  onMonthChange,
  onGoToday,
}: CalendarMonthHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="text-base">
          {year}년 {month}월
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="이전 달"
            onClick={() => onMonthChange(shiftMonth(year, month, -1))}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11"
            onClick={onGoToday}
          >
            오늘
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="다음 달"
            onClick={() => onMonthChange(shiftMonth(year, month, 1))}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div
        className="grid grid-cols-7 gap-1 text-center text-xs text-ink-subtle"
        aria-hidden="true"
      >
        {WEEKDAYS.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
