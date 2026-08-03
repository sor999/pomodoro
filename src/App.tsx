import { useState } from 'react'
import { Timer } from 'lucide-react'

import { AppTabs, type AppTab } from '@/features/app-shell/AppTabs'
import { StatsView } from '@/features/app-shell/StatsView'
import { TimerView } from '@/features/app-shell/TimerView'
import { NotificationBanner } from '@/features/notifications/NotificationBanner'
import { useSessionNotification } from '@/features/notifications/useSessionNotification'
import { useTimerRuntime } from '@/features/timer/useTimerRuntime'

function App() {
  const notification = useSessionNotification()
  useTimerRuntime(notification.notify)
  const [activeTab, setActiveTab] = useState<AppTab>('timer')

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

      <AppTabs value={activeTab} onValueChange={setActiveTab} />

      {notification.banner !== null && (
        <NotificationBanner
          notice={notification.banner}
          onDismiss={notification.dismissBanner}
        />
      )}

      {activeTab === 'timer' ? (
        <div id="panel-timer" role="tabpanel" aria-labelledby="tab-timer" tabIndex={0}>
          <TimerView onRequestPermission={notification.requestPermission} />
        </div>
      ) : (
        <div id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" tabIndex={0}>
          <StatsView />
        </div>
      )}
    </main>
  )
}

export default App
