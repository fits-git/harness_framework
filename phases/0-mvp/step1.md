# Step 1: core-types

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ADR.md`
- `CLAUDE.md`
- `src/app/page.tsx` (step 0에서 생성된 골격)
- `tsconfig.json`

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

`src/types/` 디렉토리에 이 앱의 핵심 도메인 타입을 정의한다. 이후 모든 step(서비스/라우트/UI)이 이 타입을 공유한다.

`src/types/index.ts`를 생성하고 아래 타입들을 export 한다. **시그니처(필드 구성)는 아래를 따르되, 주석/세부 표현은 재량이다.**

```ts
// 추천 카드 1개에 표시할 영상 정보 (서비스가 YouTube 응답을 가공한 결과)
export interface ChallengeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;     // 가장 적합한 해상도의 썸네일 URL
  viewCount: number;        // 정렬 기준
  publishedAt: string;      // ISO 8601 문자열
  videoUrl: string;         // https://www.youtube.com/watch?v=<videoId>
}

// 추천 요청 파라미터
export interface RecommendParams {
  keyword?: string;         // 미지정 시 기본 키워드 사용
  daysWindow?: number;      // 최근 N일 (기본 30)
  maxResults?: number;      // 반환 개수 (기본 12)
}

// API Route 응답 형태
export interface RecommendResponse {
  videos: ChallengeVideo[];
  generatedAt: string;      // ISO 8601
}
```

추가로, 기본값 상수를 같은 파일 또는 `src/types/index.ts`에서 export 한다:

```ts
export const DEFAULT_KEYWORD = "아이돌 챌린지";
export const DEFAULT_DAYS_WINDOW = 30;
export const DEFAULT_MAX_RESULTS = 12;
```

### 핵심 규칙 (반드시 준수)

- `viewCount`는 반드시 `number` 타입이다(문자열 아님). 이유: YouTube API는 조회수를 문자열로 주므로, 서비스 레이어(step 2)에서 숫자 변환할 것을 타입으로 강제한다.
- 타입 정의만 한다. 여기서 fetch 로직이나 React 컴포넌트를 만들지 마라.

## Acceptance Criteria

```bash
npm run build
```

타입스크립트 컴파일 에러 없이 빌드가 통과해야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 타입이 `src/types/`에 위치하는가? (ARCHITECTURE.md 구조)
   - ADR 기술 스택(TS strict)을 벗어나지 않았는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "정의한 타입/상수 한 줄 요약"`
   - 실패 → `"status": "error"`, `"error_message"` 기록
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 기록 후 중단

## 금지사항

- `src/services/`나 `src/components/`에 파일을 만들지 마라. 이유: 각각 step 2, step 4의 작업이다.
- 기존 테스트를 깨뜨리지 마라.
