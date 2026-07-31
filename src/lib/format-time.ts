const MS_PER_MINUTE = 60_000
const MS_PER_SECOND = 1_000

export function minutesToMs(minutes: number): number {
  return minutes * MS_PER_MINUTE
}

/** 남은 밀리초 → "mm:ss" (음수는 0으로 클램프, 올림해 마지막 1초 구간이 00:01로 보이게) */
export function formatClock(ms: number): string {
  const safeMs = ms > 0 ? ms : 0
  const totalSeconds = Math.ceil(safeMs / MS_PER_SECOND)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${pad(minutes)}:${pad(seconds)}`
}

/** 집중 시간 합계(분) → 사람이 읽는 라벨. 60분 미만은 "N분", 이상은 "N시간 M분". */
export function formatMinutesLabel(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}분`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`
}

/** 완료 시각(epoch ms) → "오후 2:05" 형태의 로컬 시간. */
export function formatCompletedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}
