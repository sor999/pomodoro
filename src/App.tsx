import { Timer } from 'lucide-react'

import { NotificationBanner } from '@/features/notifications/NotificationBanner'
import { useSessionNotification } from '@/features/notifications/useSessionNotification'
import { DurationSettings } from '@/features/settings/DurationSettings'
import { SessionList } from '@/features/sessions/SessionList'
import { StatsPanel } from '@/features/stats/StatsPanel'
import { TimerCard } from '@/features/timer/TimerCard'
import { useTimerRuntime } from '@/features/timer/useTimerRuntime'

function App() {
  const notification = useSessionNotification()
  useTimerRuntime(notification.notify)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
          <Timer className="size-6 text-primary" aria-hidden="true" />
          집중 뽀모도로
        </h1>
        <p className="text-sm text-ink-subtle">
          집중과 휴식을 반복하고, 완료한 집중 세션을 이 브라우저에 기록해요.
        </p>
      </header>

      {notification.banner !== null && (
        <NotificationBanner
          notice={notification.banner}
          onDismiss={notification.dismissBanner}
        />
      )}

      <TimerCard onRequestPermission={notification.requestPermission} />

      <StatsPanel />

      <div className="grid gap-6 md:grid-cols-2">
        <DurationSettings />
        <SessionList />
      </div>
    </main>
  )
}

export default App
