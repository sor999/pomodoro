# About

백엔드 없이 브라우저 안에서 완결되는 **뽀모도로 타이머 + 집중 세션 로그** 앱이다. 집중/휴식 세션을 반복하고, 완료한 세션을 로컬에 누적 기록해 오늘·전체 집중 통계를 보여준다. 자세한 내용은 [`docs/pomodoro-focus-log-prd.md`](./docs/pomodoro-focus-log-prd.md).

# Design System

모든 UI 작업 — 레이아웃, 색, 타이포그래피, 간격, 컴포넌트 선택, UX 동작 — 은 [`DESIGN.md`](./DESIGN.md)를 따른다. `DESIGN.md`의 토큰(`colors` · `typography` · `rounded` · `spacing` · `components`)을 canonical source로 삼고, `src/components/ui/`의 shadcn 프리미티브를 사용한다. 역할이 이미 정의된 색·폰트 크기·그림자 단계를 새로 만들지 않는다. `DESIGN.md` 토큰은 `src/index.css`의 CSS 변수(shadcn `--background`·`--primary`·`--ring` 등)로 구현해 Tailwind로 참조한다. `DESIGN.md`가 다루지 않는 경우 그 문서의 "Do's and Don'ts"와 "Iteration Guide"를 기준으로 판단하고, 그래도 애매하면 임의로 만들지 말고 사용자에게 확인한다.

# Stack

- **React + TypeScript 전용.** 다른 언어·프레임워크를 도입하지 않는다.
- **UI:** shadcn/ui + Tailwind CSS + Radix + lucide-react. 시각 토큰은 `DESIGN.md`(Linear 기반, 다크 캔버스).
- **최신 React(19+):** 함수 컴포넌트 + 훅만(클래스 금지). `forwardRef` 미사용(`ref`는 일반 prop), 비동기 데이터는 `use()` + Suspense, 폼은 Actions / `useActionState` / `useOptimistic`. React Compiler 전제로 습관적 `useMemo`/`useCallback`/`memo` 금지(측정된 병목에만). `useEffect`는 외부 시스템 동기화 전용 — 파생 상태는 렌더 중 계산하고 이벤트는 핸들러에서 처리한다. 훅은 최상위에서만 호출한다.
- **파일 구조:** 기능(feature) 단위 콜로케이션.
- **상태:** 서버 상태는 **TanStack Query**, 전역 클라이언트 상태는 **Zustand**. Redux/RTK는 지양(정말 필요한 규모에서만).

# Style

## Concise/Brief Non-obvious comments ONLY

- DO NOT: 장황하게 쓰기, 자명한 것 설명, 코드 나열("HOW" 나열)
- DO: 간결하게. 가능하면 1줄. "WHY not HOW".

## File and Module Naming

`helpers`, `utils`, `common`, `misc`, `shared` 같은 모호한 이름을 파일·폴더·모듈에 쓰지 않는다 — 정보가 0이고 잡동사니 창고가 된다. 파일은 _실제로 담고 있는 것_ 으로 명명한다: 일반 역할(`tab-helpers.ts`)보다 구체적 도메인 개념(`tab-group-state.ts`)을 선호. `helpers`에 손이 간다면 그 파일은 책임이 둘 이상이라 분리해야 하거나, 코드 안에 더 나은 이름이 숨어 있는 것이다.

컴포넌트/타입은 `PascalCase`, 훅은 `use*`, 변수·함수는 `camelCase`, 불리언은 `is/has/should` 접두.

## Type Declarations: Prefer `.ts` Over `.d.ts`

`.d.ts` 앰비언트 선언보다 실제 `.ts` 모듈을 선호한다. `tsconfig`는 `strict: true` — `any` 금지(불가피하면 `unknown` 후 좁히기), `!` non-null 단언 지양. **데이터 구조(객체 형태)는 `interface`로 정의**하고, 유니온·리터럴·매핑은 `type`으로 정의한다.

## Components

- 컴포넌트가 **100줄을 넘으면 분리**한다 — 파일당 단일 책임. 조건부 UI가 커지면 하위 컴포넌트로 뺀다.
- 리스트 `key`에 **배열 index를 쓰지 않는다** — 안정적 고유 id를 쓴다.

## Lint Rules: Fix, Don't Disable

문제를 숨기려고 lint 규칙을 인라인으로 비활성(`eslint-disable …`)하지 않는다. 규칙을 끄지 말고 코드를 고친다.

# Considerations

## Accessibility

인터랙티브 요소는 `:focus-visible` 링(shadcn 기본이 처리 — 지우지 않기), 키보드 조작, 적절한 `aria-*`/`role`을 기본 포함한다. 색만으로 상태를 표현하지 않는다(아이콘/텍스트 병행). 최소 터치 타깃 44×44px.

## Theme

`DESIGN.md`는 **다크 캔버스**(`{colors.canvas}` #010102) 기준이다. 라벤더-블루(`{colors.primary}` #5e6ad2)는 브랜드 마크·주요 CTA·포커스 링·링크 강조에만 쓰고, 두 번째 유채색이나 대기성 그라디언트를 넣지 않는다. 계층은 4단계 surface 사다리(canvas → surface-1 → … → surface-4)와 헤어라인 보더로 만들고, 다크 위 드롭섀도우는 피한다.

## Responsive

`DESIGN.md`의 브레이크포인트를 따른다. 넓은 콘텐츠(표·다이어그램)는 자체 컨테이너에서 가로 스크롤하고, 페이지 본문은 가로 스크롤하지 않는다. 상대 단위를 사용한다.

## Data & State

raw `fetch`를 컴포넌트에 흩뿌리지 않고 데이터 계층(`lib/` 또는 TanStack Query hooks)으로 캡슐화한다. **로딩 / 에러 / 빈 상태를 항상** 처리한다(성공 경로만 만들지 않기).

## Scope & Change Discipline

- **구현 전, 변경할 파일 목록과 작업 순서를 먼저 제시**한다.
- **요청하지 않은 파일을 수정하지 않는다.** 요청받지 않은 리팩터링도 끼워 넣지 않는다.
- **파일 전체를 재작성하지 않는다** — 대상 지점만 국소 수정한다.
- **라이브러리를 임의로 추가하지 않는다** — 새 의존성은 먼저 제안하고 승인받는다.
- 커밋·푸시는 사용자가 명시적으로 요청할 때만. 불확실하면 추측하지 말고 먼저 확인한다.

# Agents & Workflow

역할별로 쓰기 권한을 나눈다. 상세 규칙은 [`CLAUDE.md`](./CLAUDE.md).

| 상황 | 사용 | 쓰기 |
| --- | --- | --- |
| 기획(요구사항·범위·수용 기준, What/Why) | `product-planner` | 기획 문서(md)만 |
| 구현 계획 · 단계 분해(How) | `planner` / `/plan` | 없음 |
| 코드 작성 · 수정 | `implementer` | 있음 |
| 규칙 검사 | `reviewer` / `/review` | 없음 |
| 테스트 작성 | `tester` | 테스트 파일만 |
| 코드 · 개념 설명 | `/explain` | 없음 |
| 커밋 (컨벤션 준수) | `/commit` | git |
| PR 생성 (템플릿 준수) | `/pr` | git |

```
product-planner → planner → implementer → tester → /review → reviewer
```

커밋 · PR 규칙은 항상 로드하지 않는다 — 필요할 때 `/commit` · `/pr`가 온디맨드로 불러온다.
