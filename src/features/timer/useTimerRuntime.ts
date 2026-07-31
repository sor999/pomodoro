import { useEffect, useRef } from 'react'

import { useSessionLogStore } from '@/features/sessions/session-log-store'
import { hasReachedZero, type TimerMode } from './timer-state'
import { useTimerStore } from './timer-store'

const TICK_MS = 250

/**
 * 진행 중 타이머의 tick 루프(외부 시스템 = setInterval 동기화)와 완료 처리를 담당.
 * 종료 도달 시 집중 세션만 기록하고, 모드만 전환한다(자동 시작 안 함).
 */
export function useTimerRuntime(onComplete: (mode: TimerMode) => void): void {
  const status = useTimerStore((state) => state.status)

  // 매 tick 마다 이펙트를 재구독하지 않도록 최신 콜백을 ref로 유지한다.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    if (status !== 'running') return

    const intervalId = setInterval(() => {
      useTimerStore.getState().tick()

      const now = Date.now()
      const snapshot = useTimerStore.getState()
      if (!hasReachedZero(snapshot, now)) return

      const completedMode = snapshot.mode
      if (completedMode === 'focus') {
        useSessionLogStore
          .getState()
          .addFocusSession(snapshot.sessionMinutes, now)
      }
      useTimerStore.getState().advanceToNextMode()
      onCompleteRef.current(completedMode)
    }, TICK_MS)

    return () => clearInterval(intervalId)
  }, [status])
}
