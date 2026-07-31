import { Brain, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { sortByRecent } from '@/features/stats/session-stats'
import { formatCompletedAt } from '@/lib/format-time'
import { useSessionLogStore } from './session-log-store'

export function SessionList() {
  const sessions = useSessionLogStore((state) => state.sessions)
  const removeSession = useSessionLogStore((state) => state.removeSession)
  const clearAll = useSessionLogStore((state) => state.clearAll)

  const recent = sortByRecent(sessions)
  const hasSessions = recent.length > 0

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">최근 집중 기록</CardTitle>
        {hasSessions && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 aria-hidden="true" />
            전체 삭제
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {hasSessions ? (
          <ul className="flex flex-col divide-y divide-hairline">
            {recent.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex items-center gap-2 text-sm text-ink">
                  <Brain
                    className="size-4 text-ink-subtle"
                    aria-hidden="true"
                  />
                  집중 {session.focusMinutes}분
                </span>
                <span className="flex items-center gap-2">
                  <time
                    className="text-sm text-ink-subtle"
                    dateTime={new Date(session.completedAt).toISOString()}
                  >
                    {formatCompletedAt(session.completedAt)}
                  </time>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="이 기록 삭제"
                    onClick={() => removeSession(session.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-ink-subtle">
            아직 완료한 집중 세션이 없어요. 첫 세션을 시작해 보세요.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
