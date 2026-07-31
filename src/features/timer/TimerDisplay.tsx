import { Brain, Coffee, Pause, Play, Timer } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatClock } from '@/lib/format-time'
import type { TimerMode, TimerStatus } from './timer-state'

interface TimerDisplayProps {
  mode: TimerMode
  status: TimerStatus
  remainingMs: number
}

const MODE_LABEL: Record<TimerMode, { label: string; icon: typeof Brain }> = {
  focus: { label: '집중', icon: Brain },
  break: { label: '휴식', icon: Coffee },
}

const STATUS_LABEL: Record<
  TimerStatus,
  { label: string; icon: typeof Play }
> = {
  idle: { label: '대기 중', icon: Timer },
  running: { label: '진행 중', icon: Play },
  paused: { label: '일시정지', icon: Pause },
}

export function TimerDisplay({ mode, status, remainingMs }: TimerDisplayProps) {
  const modeMeta = MODE_LABEL[mode]
  const statusMeta = STATUS_LABEL[status]
  const ModeIcon = modeMeta.icon
  const StatusIcon = statusMeta.icon

  return (
    <div className="flex flex-col items-center gap-4">
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
        <ModeIcon aria-hidden="true" />
        {modeMeta.label} 세션
      </Badge>

      <p
        className="font-mono text-7xl font-medium tabular-nums tracking-tight text-ink sm:text-8xl"
        role="timer"
        aria-live="off"
        aria-label={`${modeMeta.label} 남은 시간 ${formatClock(remainingMs)}`}
      >
        {formatClock(remainingMs)}
      </p>

      <span className="flex items-center gap-1.5 text-sm text-ink-subtle">
        <StatusIcon className="size-4" aria-hidden="true" />
        {statusMeta.label}
      </span>
    </div>
  )
}
