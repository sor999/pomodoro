import { minutesToMs } from '@/lib/format-time'

export type TimerMode = 'focus' | 'break'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerSettings {
  focusMinutes: number
  breakMinutes: number
}

/** 타이머의 순수 상태 스냅샷. 남은 시간은 endsAt(진행 중) 또는 remainingMs(정지)로 산출. */
export interface TimerSnapshot {
  mode: TimerMode
  status: TimerStatus
  settings: TimerSettings
  endsAt: number | null // 진행 중일 때 종료 epoch ms, 그 외 null
  remainingMs: number // 정지 시 권위값, 진행 중엔 tick으로 갱신되는 표시값
  sessionMinutes: number // 시작 시점에 고정된 현재 세션 길이(분). 완료 기록의 권위값
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  breakMinutes: 5,
}

export function minutesFor(mode: TimerMode, settings: TimerSettings): number {
  return mode === 'focus' ? settings.focusMinutes : settings.breakMinutes
}

export function durationMsFor(
  mode: TimerMode,
  settings: TimerSettings,
): number {
  return minutesToMs(minutesFor(mode, settings))
}

export function createInitialTimer(
  settings: TimerSettings = DEFAULT_SETTINGS,
): TimerSnapshot {
  return {
    mode: 'focus',
    status: 'idle',
    settings,
    endsAt: null,
    remainingMs: durationMsFor('focus', settings),
    sessionMinutes: minutesFor('focus', settings),
  }
}

/** idle → running. 남은 시간이 소진돼 있으면 현재 모드 전체 시간으로 재설정 후 시작. */
export function start(snapshot: TimerSnapshot, now: number): TimerSnapshot {
  if (snapshot.status === 'running') return snapshot
  const remainingMs =
    snapshot.remainingMs > 0
      ? snapshot.remainingMs
      : durationMsFor(snapshot.mode, snapshot.settings)
  return {
    ...snapshot,
    status: 'running',
    endsAt: now + remainingMs,
    remainingMs,
    sessionMinutes: minutesFor(snapshot.mode, snapshot.settings),
  }
}

/** running → paused. 멈춘 지점의 남은 시간을 고정한다. */
export function pause(snapshot: TimerSnapshot, now: number): TimerSnapshot {
  if (snapshot.status !== 'running' || snapshot.endsAt === null) return snapshot
  return {
    ...snapshot,
    status: 'paused',
    remainingMs: clampMs(snapshot.endsAt - now),
    endsAt: null,
  }
}

/** paused → running. 고정해둔 남은 시간부터 이어서 진행. */
export function resume(snapshot: TimerSnapshot, now: number): TimerSnapshot {
  if (snapshot.status !== 'paused') return snapshot
  return {
    ...snapshot,
    status: 'running',
    endsAt: now + snapshot.remainingMs,
  }
}

/** 현재 모드의 초기 시간으로 되돌린다. 기록은 생성하지 않는다. */
export function reset(snapshot: TimerSnapshot): TimerSnapshot {
  return {
    ...snapshot,
    status: 'idle',
    endsAt: null,
    remainingMs: durationMsFor(snapshot.mode, snapshot.settings),
    sessionMinutes: minutesFor(snapshot.mode, snapshot.settings),
  }
}

/** 진행 중일 때 endsAt 기준으로 표시용 남은 시간을 다시 계산한다. */
export function tick(snapshot: TimerSnapshot, now: number): TimerSnapshot {
  if (snapshot.status !== 'running' || snapshot.endsAt === null) return snapshot
  return { ...snapshot, remainingMs: clampMs(snapshot.endsAt - now) }
}

/** 진행 중이며 종료 시각에 도달했는지. */
export function hasReachedZero(snapshot: TimerSnapshot, now: number): boolean {
  return (
    snapshot.status === 'running' &&
    snapshot.endsAt !== null &&
    snapshot.endsAt - now <= 0
  )
}

/** 완료 후 다음 모드로 전환하되 시작은 하지 않는다(수동 시작). */
export function advanceToNextMode(snapshot: TimerSnapshot): TimerSnapshot {
  const nextMode: TimerMode = snapshot.mode === 'focus' ? 'break' : 'focus'
  return {
    ...snapshot,
    mode: nextMode,
    status: 'idle',
    endsAt: null,
    remainingMs: durationMsFor(nextMode, snapshot.settings),
    sessionMinutes: minutesFor(nextMode, snapshot.settings),
  }
}

/** 설정 변경. 정지 상태면 표시 시간도 새 값으로, 진행 중이면 다음 세션부터 적용. */
export function applySettings(
  snapshot: TimerSnapshot,
  settings: TimerSettings,
): TimerSnapshot {
  if (snapshot.status === 'idle') {
    return {
      ...snapshot,
      settings,
      remainingMs: durationMsFor(snapshot.mode, settings),
      sessionMinutes: minutesFor(snapshot.mode, settings),
    }
  }
  return { ...snapshot, settings }
}

function clampMs(ms: number): number {
  return ms > 0 ? ms : 0
}
