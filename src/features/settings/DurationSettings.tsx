import { useState, type FormEvent } from 'react'
import { AlertCircle, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTimerStore } from '@/features/timer/timer-store'

/** 문자열 입력 → 양의 정수만 허용, 그 외(0 이하·비숫자)는 null. */
function parsePositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null
  const parsed = Number(value)
  return parsed > 0 ? parsed : null
}

export function DurationSettings() {
  const settings = useTimerStore((state) => state.settings)
  const setSettings = useTimerStore((state) => state.setSettings)

  const [focusInput, setFocusInput] = useState(String(settings.focusMinutes))
  const [breakInput, setBreakInput] = useState(String(settings.breakMinutes))
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const focusMinutes = parsePositiveInt(focusInput)
    const breakMinutes = parsePositiveInt(breakInput)

    if (focusMinutes === null || breakMinutes === null) {
      // 잘못된 값은 적용하지 않고 이전 값으로 되돌린다.
      setFocusInput(String(settings.focusMinutes))
      setBreakInput(String(settings.breakMinutes))
      setError('1 이상의 정수를 입력해 주세요. 이전 값이 유지됩니다.')
      return
    }

    setSettings({ focusMinutes, breakMinutes })
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="size-4 text-ink-subtle" aria-hidden="true" />
          세션 시간 설정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="focus-minutes">집중 (분)</Label>
              <Input
                id="focus-minutes"
                inputMode="numeric"
                value={focusInput}
                aria-invalid={error !== null}
                onChange={(event) => setFocusInput(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="break-minutes">휴식 (분)</Label>
              <Input
                id="break-minutes"
                inputMode="numeric"
                value={breakInput}
                aria-invalid={error !== null}
                onChange={(event) => setBreakInput(event.target.value)}
              />
            </div>
          </div>

          {error !== null && (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <p className="text-xs text-ink-subtle">
            변경한 값은 다음 세션부터 적용됩니다.
          </p>
          <Button type="submit" variant="secondary" className="self-start">
            적용
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
