# 아키텍처

## 디렉토리 구조
```
src/
├── app/
│   ├── page.tsx              # 메인 페이지 (Server Component)
│   ├── layout.tsx            # 루트 레이아웃
│   ├── globals.css           # Tailwind 엔트리
│   └── api/
│       └── recommend/
│           └── route.ts      # 추천 API 라우트 핸들러
├── components/               # UI 컴포넌트 (VideoCard 등)
├── types/                    # TypeScript 타입 정의
└── services/                 # 외부 API 래퍼 (youtube.ts)
```

## 패턴
- App Router 기반. 기본은 Server Component, 인터랙션이 필요한 곳(검색/새로고침 버튼 등)만 Client Component.
- 외부 API 호출 로직은 `src/services/`에만 둔다. 컴포넌트가 직접 fetch 하지 않는다.
- API 키가 필요한 외부 호출은 반드시 서버 사이드(API Route 또는 Server Component)에서만 수행한다.

## 데이터 흐름
```
사용자 (브라우저)
  → API Route (/api/recommend)          # 서버 사이드, 여기서만 API 키 사용
    → services/youtube.ts               # YouTube Data API v3 호출 + 정렬
      → YouTube Data API v3
    ← ChallengeVideo[]
  ← JSON 응답
→ page.tsx / VideoCard 렌더링
```

## 상태 관리
- 서버 상태(추천 목록)는 Server Component에서 직접 fetch 하거나 API Route 응답을 사용.
- 클라이언트 인터랙션(키워드 선택, 새로고침)은 최소한의 useState로 관리. 전역 상태 라이브러리 미사용.

## 사용자 흐름 (UX)
사용자 친화성을 최우선으로 한다. 사용자가 한눈에 무엇을 보는지/무엇을 할 수 있는지 알 수 있어야 한다.

```
[첫 진입]
  → 헤더(서비스명 + 한 줄 설명) + 키워드 칩(예: "전체", "신곡 챌린지", "댄스챌린지")
  → 기본 키워드로 추천 카드 그리드 즉시 표시 (추가 클릭 없이 바로 가치 전달)

[로딩 중]
  → 카드 자리에 스켈레톤(회색 placeholder)을 보여줘 화면 깜빡임/빈 화면을 방지

[결과 있음]
  → 카드 클릭 → 새 탭에서 YouTube 영상 열림 (앱 이탈 없이 돌아오기 쉬움)
  → "새로고침" 버튼으로 최신 목록 재요청

[결과 없음]
  → "조건에 맞는 영상이 없어요" 안내 + 다른 키워드 제안

[에러 / 키 미설정]
  → 사용자를 탓하지 않는 친절한 안내 문구 + 복구 방법 1줄
  → 내부 에러 메시지/키 값은 절대 노출하지 않음
```

UX 원칙:
1. **즉시 가치** — 진입 즉시 추천이 보인다. 빈 검색창에서 시작하지 않는다.
2. **명확한 상태** — 로딩/성공/빈결과/에러 4가지 상태를 항상 구분해 표시한다.
3. **이탈 최소화** — 영상은 새 탭으로 열어 사용자가 추천 목록으로 쉽게 돌아온다.
4. **접근성** — 충분한 명도 대비, 키보드 포커스 가능한 링크/버튼, 이미지 `alt` 제공.
5. **모바일 우선** — 한 손 사용 기준. 터치 타깃 충분히 크게, 1열→다열 반응형.
