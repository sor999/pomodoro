# 구현 계획: 뽀모도로 + 집중 세션 로그

- 상태: 확정
- 작성일: 2026-07-31
- 작성자: planner
- 참고: [pomodoro-focus-log-prd.md](./pomodoro-focus-log-prd.md)

## 목표

백엔드 없이 브라우저에서 완결되는 뽀모도로 타이머 + 로컬 집중 세션 로그·통계·알림 앱을, DESIGN.md 토큰과 React 19 규칙에 맞춰 feature 단위로 구현한다.

## 현황

- 현재 `src/App.tsx`는 Vite + React 19 스타터 보일러플레이트 상태.
- React 19 + TS만 설치됨. `index.css`는 `tailwindcss`·`tw-animate-css`를 import하지만 `package.json`엔 없음 → Tailwind/shadcn/zustand 미설치.
- `src/components/ui/` 미존재 (shadcn 프리미티브 없음).
- DESIGN.md 토큰은 `index.css`에 이미 매핑됨 (다크 캔버스, primary #5e6ad2).
- 서버가 없으므로 TanStack Query 불필요. 전역 상태는 zustand + persist.

## 확정된 결정

| 항목 | 결정 |
| --- | --- |
| 세션 종료 후 전환 | 0 도달 시 완료·알림 후 **모드만 전환, 시작은 수동**(사용자가 "시작" 누름) |
| 저장소 | **localStorage + zustand `persist`** (IndexedDB는 향후) |
| 백그라운드 스로틀링 | 카운터 감소 대신 **종료 시각(`endsAt`) 타임스탬프 저장 → `Date.now()`로 남은 시간 계산** |
| 알림 권한 요청 시점 | **첫 "시작" 클릭 시** 요청 |
| 탭 닫음 중 진행 세션 | 미완료로 폐기(복원 안 함) |
| 신규 의존성 | Tailwind + shadcn/ui, zustand, vitest (승인 완료) |

## 관련 파일 (신규/변경)

```
package.json                              (변경: tailwind/shadcn deps, zustand, vitest 추가)
components.json, tailwind 설정            (신규: shadcn 초기화 산출물)
src/App.tsx                               (변경: 스타터 → 앱 레이아웃 조립)
src/App.css                               (삭제/대체)
src/assets/*                              (스타터 에셋 정리)
src/components/ui/*                        (신규: button·card·input·label·badge 등 프리미티브)
src/lib/format-time.ts                     (신규: 초→mm:ss)
src/features/timer/timer-store.ts          (신규: zustand — mode·status·settings·endsAt)
src/features/timer/TimerCard.tsx           (신규)
src/features/timer/TimerDisplay.tsx        (신규)
src/features/timer/TimerControls.tsx       (신규)
src/features/sessions/session.ts           (신규: FocusSession interface)
src/features/sessions/session-log-store.ts (신규: zustand persist — 기록 배열)
src/features/sessions/SessionList.tsx      (신규: 최근 목록)
src/features/stats/session-stats.ts        (신규: 파생 통계 순수 함수)
src/features/stats/StatsPanel.tsx          (신규)
src/features/settings/DurationSettings.tsx (신규: 집중/휴식 분 입력+검증)
src/features/notifications/useSessionNotification.ts (신규)
src/features/notifications/NotificationBanner.tsx    (신규: 인앱 폴백)
```

## 단계 (각 단계는 독립 검증 가능)

1. **도구·의존성 셋업** — Tailwind v4 + shadcn 초기화, `zustand`·`vitest` 추가. 프리미티브(button, card, input, label, badge) 설치.
   - 검증: `npm run dev` 기동, 빈 페이지에 DESIGN 토큰(다크 캔버스) 적용 확인. `npm run lint`·`tsc -b` 통과. vitest 기동 확인.

2. **도메인 타입 + 저장소** — `session.ts`(`FocusSession { id, completedAt, focusMinutes }`), `session-log-store.ts`(persist, 추가/조회), `timer-store.ts`(mode·status·settings·endsAt·remainingMs).
   - 검증: 스토어 단위 동작 확인 — 기록 추가 후 새로고침 유지(localStorage 키 확인).

3. **시간 유틸 + 타이머 로직** — `format-time.ts`, 타임스탬프 기반 tick(1s interval에서 `endsAt - Date.now()` 계산). 시작/일시정지/재개/초기화 액션.
   - 검증: 일시정지 후 재개 시 멈춘 지점부터 진행, 초기화 시 초기 시간 복귀(기록 미생성).

4. **타이머 UI** — `TimerCard`/`TimerDisplay`(mm:ss + 집중/휴식 배지)/`TimerControls`. 100줄 초과 시 분리, DESIGN 토큰만 사용.
   - 검증: 수용 기준 "타이머" 5개 항목 수동 확인. 색만으로 상태 표현 안 함(아이콘+텍스트).

5. **세션 완료 → 기록 저장 연결** — 집중 카운트다운 0 도달 시에만 기록 1건 생성, 종료 후 모드만 전환(수동 시작). 초기화/취소는 미기록.
   - 검증: 완료 직후 새로고침 → 기록 유지 / 초기화 → 미기록 / 종료 후 다음 모드로 전환되나 자동 시작 안 됨.

6. **통계 패널 + 최근 목록** — `session-stats.ts`(오늘=로컬 자정 기준, 전체 합계 순수 함수), `StatsPanel`, `SessionList`(최근순, 안정적 id key).
   - 검증: 3회 완료 시 오늘=3, 전체 합계 일치, 최신 항목 최상단.

7. **집중/휴식 커스터마이즈 + 검증** — `DurationSettings` 분 단위 입력, 0 이하·비숫자 거부(이전 값 유지), 다음 세션부터 적용.
   - 검증: 유효/무효 입력 각각 수용 기준대로 동작.

8. **알림** — `useSessionNotification`(첫 시작 시 권한 요청, 집중 종료 Notification, 휴식 종료 Should), 권한 거부/미지원 시 `NotificationBanner` 인앱 폴백.
   - 검증: 권한 허용/거부/다른 탭 포커스 3가지 시나리오에서 인지 가능.

9. **앱 조립·정리** — `App.tsx`를 레이아웃(타이머·통계·설정)으로 교체, 스타터 `App.css`·미사용 에셋 제거. 로딩/빈 상태(기록 0건) 처리.
   - 검증: 빈 상태 UI 표시, `npm run build` 성공.

10. **(Could) 기록 관리** — 개별 삭제·전체 초기화. 여유 있으면 포함.
    - 검증: 삭제 후 통계 재계산 반영.

11. **검토·테스트** — `tester`가 순수 로직(`session-stats`, `format-time`, 스토어 리듀서) 테스트, `/review`로 규칙 검사.

## 리스크 / 미해결 질문

- **다중 탭 동시 사용**(중복 기록·상태 불일치)은 PRD 비목표 — 이번 스코프 제외, 리스크로만 남김.
- **`tw-animate-css`** 미설치 상태 — 1단계 셋업에서 함께 설치 필요.
- 타임스탬프 기반 타이머라도 1초 tick 표시와 실제 종료 시점 간 최대 1초 오차 존재 — 허용 범위로 간주.
