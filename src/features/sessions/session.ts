/** 완료된 집중 세션 1건. 휴식·중단·초기화는 기록하지 않는다. */
export interface FocusSession {
  id: string
  completedAt: number // epoch ms (로컬 자정 기준 통계 계산에 사용)
  focusMinutes: number
}

/** 완료 시점 정보로 새 기록을 만든다. crypto.randomUUID 미지원 환경은 fallback. */
export function createFocusSession(
  focusMinutes: number,
  completedAt: number = Date.now(),
): FocusSession {
  return {
    id: generateId(),
    completedAt,
    focusMinutes,
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
