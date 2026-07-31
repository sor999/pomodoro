import { useEffect, useState } from 'react'

/**
 * 주기적으로 갱신되는 현재 시각(epoch ms). 렌더 중 Date.now() 직접 호출(비순수)을 피하고,
 * "오늘"(로컬 자정) 경계가 시간이 지나도 최신으로 유지되게 한다.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(intervalId)
  }, [intervalMs])

  return now
}
