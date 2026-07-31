import { Card, CardContent } from '@/components/ui/card'
import { TimerControls } from './TimerControls'
import { TimerDisplay } from './TimerDisplay'
import { useTimerStore } from './timer-store'

interface TimerCardProps {
  /** 첫 "시작" 시 알림 권한 요청 트리거 (이후 호출은 no-op). */
  onRequestPermission: () => void
}

export function TimerCard({ onRequestPermission }: TimerCardProps) {
  const mode = useTimerStore((state) => state.mode)
  const status = useTimerStore((state) => state.status)
  const remainingMs = useTimerStore((state) => state.remainingMs)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const resume = useTimerStore((state) => state.resume)
  const reset = useTimerStore((state) => state.reset)

  const handleStart = () => {
    onRequestPermission()
    start()
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-8 py-4">
        <TimerDisplay mode={mode} status={status} remainingMs={remainingMs} />
        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onReset={reset}
        />
      </CardContent>
    </Card>
  )
}
