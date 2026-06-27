# Step 2: youtube-service

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ADR.md` (특히 ADR-002 키 격리, ADR-003 추천 로직, ADR-004 테스트 범위)
- `CLAUDE.md`
- `src/types/index.ts` (step 1에서 정의된 타입/상수 — 반드시 재사용)
- `vitest.config.ts`, `package.json`

이전 step에서 만들어진 타입을 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

`src/services/youtube.ts`를 생성한다. YouTube Data API v3를 호출해 챌린지 영상을 조회하고, 추천 순서로 정렬한 `ChallengeVideo[]`를 반환하는 **서버 전용** 모듈이다.

### 1. 공개 함수 시그니처

```ts
import type { ChallengeVideo, RecommendParams } from "@/types";

export async function fetchChallengeVideos(
  params: RecommendParams
): Promise<ChallengeVideo[]>;
```

동작:
1. `params`의 미지정 값은 `src/types`의 기본 상수(`DEFAULT_KEYWORD`/`DEFAULT_DAYS_WINDOW`/`DEFAULT_MAX_RESULTS`)로 채운다.
2. **search.list** 호출: `part=snippet`, `q=<keyword>`, `type=video`, `order=viewCount`, `publishedAfter=<지금-daysWindow일, RFC3339>`, `maxResults` (검색은 후보 확보 위해 넉넉히, 예: maxResults의 2~3배 또는 최대 50).
3. search 결과의 videoId들을 모아 **videos.list** 호출: `part=snippet,statistics`로 정확한 `viewCount`(statistics.viewCount)와 메타데이터를 가져온다. (search.list는 viewCount를 주지 않으므로 이 2차 호출이 필요하다.)
4. 응답을 `ChallengeVideo`로 매핑한다. `viewCount`는 `Number(...)`로 숫자 변환. `thumbnailUrl`은 사용 가능한 가장 높은 해상도(`high`→`medium`→`default` 순 fallback). `videoUrl`은 `https://www.youtube.com/watch?v=${videoId}`.
5. `viewCount` **내림차순 정렬** 후 상위 `maxResults`개로 잘라 반환한다.

### 2. 정렬/매핑 로직 분리 (테스트 대상)

테스트 가능하도록 순수 함수를 **export** 한다:

```ts
// videos.list API의 raw item 배열을 받아 ChallengeVideo[]로 변환 + 조회수 내림차순 정렬 + 상위 N개 절단
export function mapAndRankVideos(rawItems: unknown[], maxResults: number): ChallengeVideo[];
```

`fetchChallengeVideos`는 내부적으로 이 함수를 사용한다.

### 3. API 키 처리 (CRITICAL)

- API 키는 `process.env.YOUTUBE_API_KEY`로만 읽는다.
- 키가 없으면 명확한 에러를 throw 한다: `throw new Error("YOUTUBE_API_KEY is not set")`.
- 파일 최상단에 `import "server-only";`를 추가해 이 모듈이 클라이언트 번들에 포함되지 않도록 강제한다. (`server-only` 패키지를 의존성에 추가하라.)

### 4. 단위 테스트

`src/services/youtube.test.ts`를 생성한다. **`mapAndRankVideos`만 테스트**한다(네트워크 호출 없음). 최소 케이스:
- videos.list raw item 3개(조회수 섞인 순서)를 넣으면 → 조회수 내림차순으로 정렬되어 반환된다.
- `maxResults`로 개수가 잘린다.
- `viewCount`가 `number` 타입으로 변환된다.
- 썸네일 fallback(`high` 없고 `medium`만 있을 때 `medium` 사용)이 동작한다.

raw item 형태는 실제 YouTube videos.list 응답 구조를 모방하라:
```
{ id, snippet: { title, channelTitle, publishedAt, thumbnails: { high?: {url}, medium?: {url}, default?: {url} } }, statistics: { viewCount } }
```

### 핵심 규칙 (반드시 준수)

- `import "server-only";`를 반드시 포함하라. 이유: ADR-002 — 이 모듈이 클라이언트로 새어나가면 API 키 노출 위험.
- `viewCount`는 반드시 숫자로 변환하라. 문자열 정렬 시 "9" > "10"이 되어 추천 순서가 깨진다.
- 실제 네트워크를 때리는 테스트를 작성하지 마라. fetch를 호출하는 `fetchChallengeVideos`는 테스트하지 말고, 순수 함수 `mapAndRankVideos`만 테스트하라.

## Acceptance Criteria

```bash
npm run build
npm test
```

빌드 통과 + 모든 테스트 통과.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 서비스가 `src/services/`에 있는가?
   - `import "server-only"`가 있고, `NEXT_PUBLIC_` 노출이 없는가? (CLAUDE.md CRITICAL)
   - step 1의 타입/상수를 재사용했는가? (중복 정의 금지)
3. 결과에 따라 `phases/0-mvp/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "fetchChallengeVideos/mapAndRankVideos 구현 및 테스트 통과"`
   - 실패 → `"status": "error"`, `"error_message"` 기록
   - 사용자 개입 필요(예: 키 없이 빌드는 되지만 실행 불가는 정상 — blocked 아님) → 해당 시에만 `"blocked"`

## 금지사항

- API Route나 UI를 만들지 마라. 이유: step 3, 4의 작업이다.
- step 1의 타입을 다시 정의하지 마라. `@/types`에서 import 하라.
- 기존 테스트를 깨뜨리지 마라.
