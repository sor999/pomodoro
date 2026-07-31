import { Bell, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { SessionNotice } from './useSessionNotification'

interface NotificationBannerProps {
  notice: SessionNotice
  onDismiss: () => void
}

/** OS 알림이 불가(미허용·미지원)할 때의 화면 내 폴백. 색이 아닌 아이콘+텍스트로 알림을 전달. */
export function NotificationBanner({
  notice,
  onDismiss,
}: NotificationBannerProps) {
  return (
    <Card role="status" aria-live="polite" className="border-primary/40">
      <CardContent className="flex items-start gap-3 py-1">
        <Bell className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-sm font-medium text-ink">{notice.title}</p>
          <p className="text-sm text-ink-subtle">{notice.body}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="알림 닫기"
          onClick={onDismiss}
        >
          <X aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}
