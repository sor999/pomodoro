import { useState } from 'react'

import type { TimerMode } from '@/features/timer/timer-state'

export type NotificationSupport = NotificationPermission | 'unsupported'

export interface SessionNotice {
  mode: TimerMode
  title: string
  body: string
}

export interface SessionNotification {
  permission: NotificationSupport
  isSupported: boolean
  banner: SessionNotice | null
  requestPermission: () => void
  notify: (mode: TimerMode) => void
  dismissBanner: () => void
}

const NOTICE_COPY: Record<TimerMode, { title: string; body: string }> = {
  focus: {
    title: '집중 세션 완료',
    body: '집중 시간이 끝났어요. 잠시 휴식을 가져보세요.',
  },
  break: {
    title: '휴식 완료',
    body: '휴식이 끝났어요. 다음 집중을 시작해 볼까요?',
  },
}

const isNotificationSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window

/** 세션 종료 알림: 권한 허용 시 OS 알림, 그 외엔 인앱 배너 폴백. 권한은 첫 시작 시 요청. */
export function useSessionNotification(): SessionNotification {
  const [permission, setPermission] = useState<NotificationSupport>(() =>
    isNotificationSupported() ? Notification.permission : 'unsupported',
  )
  const [banner, setBanner] = useState<SessionNotice | null>(null)

  const requestPermission = () => {
    if (!isNotificationSupported() || Notification.permission !== 'default') {
      return
    }
    void Notification.requestPermission().then(setPermission)
  }

  const notify = (mode: TimerMode) => {
    const copy = NOTICE_COPY[mode]
    if (isNotificationSupported() && Notification.permission === 'granted') {
      new Notification(copy.title, { body: copy.body })
      return
    }
    // 미지원·미허용 → 화면 내 폴백으로 반드시 인지되게 한다.
    setBanner({ mode, ...copy })
  }

  const dismissBanner = () => setBanner(null)

  return {
    permission,
    isSupported: isNotificationSupported(),
    banner,
    requestPermission,
    notify,
    dismissBanner,
  }
}
