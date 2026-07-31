import { CalendarCheck, Clock, Flame, Trophy } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { useSessionLogStore } from '@/features/sessions/session-log-store'
import { formatMinutesLabel } from '@/lib/format-time'
import { useNow } from '@/lib/useNow'
import { computeStats } from './session-stats'

interface StatTile {
  key: string
  label: string
  value: string
  icon: typeof Clock
}

export function StatsPanel() {
  const sessions = useSessionLogStore((state) => state.sessions)
  const now = useNow()
  const stats = computeStats(sessions, now)

  const tiles: StatTile[] = [
    {
      key: 'today-count',
      label: '오늘 완료',
      value: `${stats.todayCount}회`,
      icon: CalendarCheck,
    },
    {
      key: 'today-minutes',
      label: '오늘 집중',
      value: formatMinutesLabel(stats.todayMinutes),
      icon: Clock,
    },
    {
      key: 'total-count',
      label: '전체 완료',
      value: `${stats.totalCount}회`,
      icon: Trophy,
    },
    {
      key: 'total-minutes',
      label: '전체 집중',
      value: formatMinutesLabel(stats.totalMinutes),
      icon: Flame,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <Card key={tile.key}>
            <CardContent className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-sm text-ink-subtle">
                <Icon className="size-4" aria-hidden="true" />
                {tile.label}
              </span>
              <span className="text-2xl font-semibold tabular-nums text-ink">
                {tile.value}
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
