# 🍅 집중 뽀모도로

백엔드 없이 **브라우저 안에서 완결**되는 뽀모도로 타이머 + 집중 세션 로그 앱입니다.  
집중/휴식 세션을 반복하고, 완료한 세션을 로컬에 누적 기록해 오늘·전체 집중 통계를 보여줍니다.


<img width="753" height="1013" alt="스크린샷 2026-07-31 오후 4 25 57" src="https://github.com/user-attachments/assets/77c81437-18d6-41e6-b342-21d098665581" />

## 주요 기능

| 기능 | 설명 |
|------|------|
| ⏱️ **타이머** | 집중(기본 25분) / 휴식(기본 5분) 카운트다운. 시작 · 일시정지 · 재개 · 초기화 지원 |
| 📊 **통계** | 오늘·전체 완료 횟수, 총 집중 시간을 한눈에 확인 |
| 📝 **세션 기록** | 집중 세션 완료 시 자동 기록. localStorage 기반으로 새로고침 후에도 유지 |
| 🔔 **알림** | Notification API로 세션 종료 알림. 권한 거부 시 인앱 배너로 대체 |
| ⚙️ **시간 설정** | 집중/휴식 시간을 분 단위로 커스텀. 변경은 다음 세션부터 적용 |

## 기술 스택

- **React 19** + **TypeScript 6**
- **Vite 8** (빌드 · HMR)
- **Tailwind CSS 4** + **shadcn/ui** + **Radix UI**
- **Zustand** (전역 상태 관리)
- **Vitest** + **Testing Library** (단위 테스트)
- **lucide-react** (아이콘)

## 시작하기

### 요구 사항

- Node.js ≥ 20
- npm ≥ 10

### 설치 & 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (HMR) |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run preview` | 프로덕션 빌드 미리보기 |
| `npm run lint` | ESLint 실행 |
| `npm run test` | Vitest 단위 테스트 실행 |
| `npm run test:watch` | Vitest 감시 모드 |

## 프로젝트 구조

```
src/
├── components/ui/       # shadcn/ui 프리미티브 (Button, Card, Input 등)
├── features/
│   ├── timer/           # 타이머 상태 머신, 스토어, 런타임 훅, UI
│   ├── sessions/        # 세션 모델, localStorage 기반 로그 스토어, 목록 UI
│   ├── stats/           # 오늘·전체 통계 계산 로직, 패널 UI
│   ├── settings/        # 집중/휴식 시간 설정 폼
│   └── notifications/   # Notification API 훅, 인앱 배너 UI
├── lib/                 # 시간 포맷팅, 유틸리티 훅
├── test/                # 테스트 설정
├── App.tsx              # 앱 루트 컴포넌트
├── main.tsx             # 엔트리 포인트
└── index.css            # 글로벌 스타일 · CSS 변수
```

## 데이터 저장

모든 데이터는 **브라우저 localStorage**에 저장됩니다.

- 서버 · 회원가입 불필요
- 새로고침 · 재방문 시에도 세션 기록 유지
- 브라우저 데이터를 삭제하면 기록도 함께 삭제됩니다

## 관련 문서

- [PRD (기획서)](./docs/pomodoro-focus-log-prd.md)
- [DESIGN.md (디자인 시스템)](./DESIGN.md)

