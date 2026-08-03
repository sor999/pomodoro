# 구현 계획: 달력 UI + 통계 탭 분리

- 상태: 확정
- 작성일: 2026-07-31
- 작성자: planner
- 참고: [pomodoro-focus-log-prd.md](./pomodoro-focus-log-prd.md), [pomodoro-focus-log-plan.md](./pomodoro-focus-log-plan.md)

## 목표

기존 뽀모도로·세션 로그·알림 기능을 유지한 채, **통계/기록을 별도 탭으로 분리**하고 **월 단위 달력으로 날짜별 집중 이력을 탐색**할 수 있게 한다. 파일 가져오기/내보내기(파일 I/O)는 제외한다.

## 현황 요약

기존 `pomodoro-focus-log-plan.md` 1~10단계는 사실상 완료 상태다.

| 영역 | 상태 |
| --- | --- |
| 타이머 · 기록 저장 · 알림 · 설정 | 완료 |
| 통계 4타일 (오늘/전체) | 완료 — 타이머와 같은 단일 스크롤 |
| 세션 목록 · 개별/전체 삭제 | 완료 |
| 라우터 | 없음 |
| 달력 UI | 없음 |
| 파일 I/O | 없음 → 이번에도 비목표 |

현재 `App.tsx`는 한 페이지에 타이머 → 통계 → 설정+목록이 모두 붙어 있다. 이번 작업은 **정보 구조 재배치 + 달력**이다.

## 확정된 결정

| 항목 | 결정 |
| --- | --- |
| 네비게이션 | **인앱 탭** (라우터·react-router 없음) |
| 탭 구성 | `timer` (타이머) / `stats` (기록·통계) |
| 공통 셸 | 헤더 · 알림 배너 · `useTimerRuntime`은 탭 바깥 |
| 달력 | 순수 월 그리드, **외부 달력 라이브러리 없음** |
| 요일 시작 | **일요일** |
| 탭 새로고침 유지 | 비유지 (항상 타이머 탭으로 시작). hash 복원은 Could |
| 신규 deps | 추가하지 않음 (pill 탭은 Button 기반 커스텀) |
| 세션 스키마 | 변경 없음 (`FocusSession { id, completedAt, focusMinutes }`) |
| 파일 I/O | 명시적 비목표 (JSON/CSV export·import, 파일 업로드) |

### 탭 배치

| 탭 id | 라벨 | 내용 |
| --- | --- | --- |
| `timer` | 타이머 | TimerCard + DurationSettings + TodaySummary(오늘 1줄) |
| `stats` | 기록·통계 | StatsPanel + FocusCalendar + (날짜 필터) SessionList |

### 달력 범위

**Must**

- 월 단위 7×N 그리드, 이전/다음 달, `YYYY년 M월` 헤더
- 날짜 셀: 완료 횟수 표시 (0이면 생략)
- 오늘 표시: primary 링/보더 + 텍스트/aria (색만으로 상태 표현 금지)
- 날짜 클릭 → 선택 하이라이트 + 해당 일 세션 목록·요약(횟수·합계 분)
- 기록 0건 / 선택일 0건 빈 상태
- DESIGN 토큰만 사용. 히트맵용 다단계 유채색 금지

**Should**

- 셀에 집중 분 합계 caption
- “오늘로” 점프 버튼
- 선택일 세션에서 기존 개별 삭제 재사용

**비목표**

- 주간/월간 차트, CSV/JSON export·import, 파일 업로드
- 드래그 범위 선택, 다중 월 뷰, 외부 달력 라이브러리
- 세션 라벨/태그, 롱브레이크 규칙

### 패딩 셀(다른 달) 클릭

클릭 시 **그 달로 이동하며 해당 일을 선택**한다.

### clearAll

필터와 무관하게 **전체 기록**을 지운다. 라벨을 “전체 기록 삭제”로 명확히 한다.

## 관련 파일

### 변경

```
src/App.tsx
src/features/sessions/SessionList.tsx
src/features/stats/StatsPanel.tsx   (위치·조립만, 로직 최소)
src/lib/format-time.ts              (선택: 월/일 라벨)
```

### 신규

```
src/features/app-shell/AppTabs.tsx
src/features/app-shell/TimerView.tsx      (선택, App 비대화 방지)
src/features/app-shell/StatsView.tsx      (선택)
src/features/calendar/month-grid.ts
src/features/calendar/day-sessions.ts
src/features/calendar/month-grid.test.ts
src/features/calendar/day-sessions.test.ts
src/features/calendar/FocusCalendar.tsx
src/features/calendar/DayCell.tsx
src/features/stats/TodaySummary.tsx
```

### 건드리지 않음

- `timer-*`, `useTimerRuntime`, `notifications/*`, `session-log-store` API
- 파일 I/O 관련 코드 신설 금지

## 단계 (각 단계는 독립 검증 가능)

1. **일/월 파생 로직** — `buildMonthGrid`, `filterSessionsOnDay`, `summarizeDay`. 로컬 자정, 기존 `isSameLocalDay` 재사용.
   - 검증: vitest — 월 경계 패딩, 같은 날 합산, 빈 배열, 다른 날 제외.

2. **앱 탭 셸** — `timer` | `stats` pill 탭. DESIGN surface/ink 토큰. `role="tablist"`, `aria-selected`. runtime 훅은 셸에 고정.
   - 검증: 탭 전환 후에도 진행 중 타이머·완료 기록 정상. focus-visible · 터치 타깃 ≥44px.

3. **통계·목록 이동 + TodaySummary** — 타이머 탭: TimerCard + DurationSettings + 오늘 1줄. 통계 탭: StatsPanel + (이후) 달력 + SessionList.
   - 검증: 삭제/빈 상태/설정 반영 회귀 없음. 타이머 탭에 4타일 중복 없음.

4. **달력 UI** — FocusCalendar + DayCell. 월 네비, 요일 헤더, 횟수 표시, 오늘/선택 강조.
   - 검증: 월 이동, 오늘 식별, 세션 있는 날 숫자, 좁은 폭 레이아웃, 색+텍스트 병행.

5. **날짜 선택 ↔ 세션 목록** — 선택일 state → SessionList 필터. 삭제 시 달력 count·StatsPanel 즉시 갱신. clearAll 라벨 명확화.
   - 검증: 일별 필터, 0건 빈 문구, 삭제 연동.

6. **조립·반응형·빌드** — 통계 탭 스택: Stats → Calendar → Day list. 빈 상태·spacing 정리.
   - 검증: `npm run lint` · `tsc -b` · `npm test` · `npm run build` + 수동 스모크.

7. **테스트·리뷰** — tester: calendar 순수 함수 보강. reviewer: DESIGN·a11y·100줄·deps 무단 추가.

```
순수 함수 → 탭 셸 → 통계 이동 → 달력 → 날짜 연동 → 마무리 → 테스트/리뷰
```

## 구현 순서 요약 (implementer용)

```
1 순수 함수(month/day) + 테스트
2 App 탭 셸 (runtime은 셸에 고정)
3 통계 이동 + TodaySummary
4 FocusCalendar UI
5 날짜 선택 ↔ SessionList
6 레이아웃·빈 상태·빌드
7 tester / reviewer 핸드오프
```

## 리스크 / 미해결 질문

- **다중 브라우저 탭** — 기존과 동일, 스코프 외.
- **자정/월 경계** — 기존 stats와 같이 로컬 `Date` 고정.
- **세션 수천 건** — 전수 스캔은 보통 OK. 병목 측정 후에만 최적화 (습관적 useMemo 금지).
- **clearAll 확인 다이얼로그** — 현재 즉시 삭제. 이번 스코프에서는 문구 명확화만; 확인 UI는 후속 Should.
- **PRD 비목표와 달력** — PRD의 “주간/월간 차트”는 차트/CSV를 가리킴. 숫자 있는 월 그리드는 사용자 요청 범위로 포함.
- **파일 I/O** — 어떤 단계에서도 추가하지 않음.
