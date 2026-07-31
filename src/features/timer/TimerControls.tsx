import { Pause, Play, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { TimerStatus } from './timer-state'

interface TimerControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
}: TimerControlsProps) {
  const isRunning = status === 'running'
  const isPaused = status === 'paused'

  return (
    <div className="flex items-center justify-center gap-3">
      {isRunning ? (
        <Button size="lg" onClick={onPause}>
          <Pause aria-hidden="true" />
          일시정지
        </Button>
      ) : (
        <Button size="lg" onClick={isPaused ? onResume : onStart}>
          <Play aria-hidden="true" />
          {isPaused ? '재개' : '시작'}
        </Button>
      )}

      <Button
        size="lg"
        variant="secondary"
        onClick={onReset}
        disabled={status === 'idle'}
      >
        <RotateCcw aria-hidden="true" />
        초기화
      </Button>
    </div>
  )
}
