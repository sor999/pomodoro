---
description: 변경을 Conventional Commits 컨벤션에 맞춰 커밋한다
---

당신은 지금 **커밋 모드**입니다. 사용자가 요청한 변경만 커밋합니다.

커밋 지시(선택):

$ARGUMENTS

## 절차

1. `git status`와 `git diff`로 변경 내용을 파악한다.
2. `main` 브랜치라면 먼저 브랜치를 판다(`git switch -c <type>/<이름>`).
3. 논리적으로 하나인 변경만 스테이징한다 — 무관한 변경을 섞지 않는다.
4. 아래 형식으로 커밋한다. 커밋·푸시는 사용자가 요청한 범위에서만.

## 커밋 메시지 (Conventional Commits)

형식: `type(scope): 제목` — **제목은 한국어, 명령형·현재형, 50자 이내, 마침표 없음**.

```
type(scope): 제목

본문(선택): 무엇을·왜 바꿨는지 한국어로. HOW보다 WHY.
```

- **type**: `feat`(기능) · `fix`(버그) · `docs`(문서) · `refactor`(리팩터) · `test`(테스트) · `style`(포맷) · `perf`(성능) · `chore`(빌드·설정)
- **scope**(선택): 변경 영역. feature 폴더명 권장 — `timer` · `sessions` · `stats` · `settings` · `notifications` · `ui`
- 예: `feat(timer): 집중 카운트다운 타이머 추가`, `fix(stats): 오늘 집계 자정 기준 오류 수정`
- 한 커밋은 한 가지 논리적 변경만. 이모지 금지.

## 주의

- 커밋 전 `npm run lint`·`npx tsc -b`가 통과하는지 확인한다.
- 여러 논리적 변경이 섞여 있으면 여러 커밋으로 나눈다.
