# Step 3: api-route

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md` (데이터 흐름)
- `docs/ADR.md` (ADR-002 키 격리)
- `CLAUDE.md`
- `src/types/index.ts` (step 1)
- `src/services/youtube.ts` (step 2 — `fetchChallengeVideos` 시그니처)

이전 step에서 만들어진 서비스/타입을 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

`src/app/api/recommend/route.ts`를 생성한다. 클라이언트가 추천 목록을 받아가는 서버 사이드 엔드포인트다.

### 시그니처/동작

```ts
import { NextRequest, NextResponse } from "next/server";
import type { RecommendResponse } from "@/types";
import { fetchChallengeVideos } from "@/services/youtube";

export async function GET(req: NextRequest): Promise<NextResponse>;
```

1. 쿼리스트링에서 선택 파라미터를 파싱한다: `keyword`(string), `days`(number → `daysWindow`), `max`(number → `maxResults`). 없으면 서비스 기본값에 위임(undefined 전달).
2. `fetchChallengeVideos(params)`를 호출한다.
3. 성공 시 `RecommendResponse` 형태(`{ videos, generatedAt: new Date().toISOString() }`)로 `NextResponse.json(...)` 반환 (200).
4. 서비스가 throw 하면:
   - 메시지에 `YOUTUBE_API_KEY`가 포함되면 → 500, body `{ error: "서버에 YouTube API 키가 설정되지 않았습니다." }`.
   - 그 외 → 502, body `{ error: "추천 영상을 가져오지 못했습니다." }`. (원본 에러는 `console.error`로만 로깅, 응답 본문에 노출 금지.)

### 동적 렌더링

라우트 상단에 `export const dynamic = "force-dynamic";`를 추가한다. 이유: 매 요청 시 최신 영상을 조회해야 하며 빌드타임 캐싱되면 안 된다.

### 핵심 규칙 (반드시 준수)

- API 키를 이 라우트에서 직접 읽지 마라. 반드시 `fetchChallengeVideos`(서비스)에 위임하라. 이유: ADR-002 — 키 접근 지점을 서비스 한 곳으로 일원화.
- 에러 응답 본문에 raw 에러 메시지/스택을 절대 포함하지 마라. 이유: 내부 정보 노출 방지.
- `숫자` 파싱 시 `Number()` 결과가 `NaN`이면 해당 파라미터는 무시(undefined 처리)하라.

## Acceptance Criteria

```bash
npm run build
```

빌드가 통과해야 한다. (라우트가 타입 에러 없이 컴파일되어야 한다.)

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 라우트가 `src/app/api/recommend/route.ts`에 있는가? (ARCHITECTURE.md)
   - 키를 서비스에 위임했는가? 라우트에서 `process.env.YOUTUBE_API_KEY`를 직접 읽지 않는가? (CLAUDE.md CRITICAL)
   - 응답 타입이 step 1의 `RecommendResponse`를 따르는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 3을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "/api/recommend GET 라우트 구현 (서비스 위임, 에러 핸들링)"`
   - 실패 → `"status": "error"`, `"error_message"` 기록
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 기록 후 중단

## 금지사항

- UI 컴포넌트를 만들지 마라. 이유: step 4의 작업이다.
- 서비스 로직(YouTube 호출/정렬)을 라우트에 다시 구현하지 마라. `fetchChallengeVideos`를 호출만 하라.
- 기존 테스트를 깨뜨리지 마라.
