import { DurationSettings } from '@/features/settings/DurationSettings'
import { TodaySummary } from '@/features/stats/TodaySummary'
import { TimerCard } from '@/features/timer/TimerCard'

interface TimerViewProps {
  onRequestPermission: () => void
}

export function TimerView({ onRequestPermission }: TimerViewProps) {
  return (
    <div
      role="tabpanel"
      id="panel-timer"
      aria-labelledby="tab-timer"
      className="flex flex-col gap-8"
    >
      <TimerCard onRequestPermission={onRequestPermission} />
      <TodaySummary />
      <DurationSettings />
    </div>
  )
}
