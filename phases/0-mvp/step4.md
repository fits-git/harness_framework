# Step 4: ui

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md` (디자인 방향: 다크모드 고정, 미니멀, 핑크 포인트)
- `docs/ARCHITECTURE.md` (Server Component 기본, Client는 인터랙션만)
- `CLAUDE.md`
- `src/types/index.ts` (step 1 — `ChallengeVideo`, `RecommendResponse`)
- `src/services/youtube.ts` (step 2)
- `src/app/api/recommend/route.ts` (step 3 — 응답 형태)
- `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css` (step 0 골격)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

## 작업

추천 영상을 카드 그리드로 보여주는 메인 화면을, ARCHITECTURE.md의 **"사용자 흐름 (UX)"** 섹션에 맞춰 완성한다. 로딩/성공/빈결과/에러 4가지 상태를 모두 친절하게 처리하는 것이 이 step의 핵심이다.

### 0. 화면 구조 결정 (중요)

UX(로딩 스켈레톤, 새로고침, 키워드 전환)를 제공하기 위해 **클라이언트 주도 데이터 로딩**으로 구성한다:

- `src/app/page.tsx` — Server Component(쉘). 헤더/레이아웃만 그리고, 추천 영역은 Client Component `<RecommendFeed />`에 위임한다. `page.tsx`에서 직접 데이터를 fetch하지 않는다.
- `src/components/RecommendFeed.tsx` — `"use client"`. 마운트 시 그리고 키워드 변경/새로고침 시 **`/api/recommend`(step 3 라우트)** 를 `fetch` 한다. **절대 `fetchChallengeVideos`(서비스)나 `process.env`를 직접 import/접근하지 마라** — 클라이언트에서 API 키가 노출되기 때문이다.

### 1. RecommendFeed — 상태 머신

`useState`로 다음 4상태를 관리하고 각각 다른 UI를 렌더한다:

- `loading` → `<SkeletonGrid />`(회색 placeholder 카드 N개). 빈 화면/깜빡임 금지.
- `success` & 결과 있음 → `<VideoGrid videos={...} />`
- `success` & 결과 0개 → 빈 상태: "조건에 맞는 영상이 없어요" + 다른 키워드 제안.
- `error` → 친절한 안내: "영상을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." + "다시 시도" 버튼. **API 응답의 raw error 문자열을 그대로 노출하지 마라**(키 미설정 시 라우트가 주는 사용자용 문구만 표시).

상단 컨트롤 바:
- **키워드 칩**: 최소 3개(예: "전체"/`DEFAULT_KEYWORD`, "신곡 챌린지", "댄스챌린지"). 선택 시 해당 키워드로 재요청. 현재 선택 칩은 핑크 액센트로 강조.
- **새로고침 버튼**: 현재 키워드로 재요청. 요청 중에는 비활성화/스피너.

### 2. 표시 컴포넌트 (순수, fetch 금지)

`src/components/VideoCard.tsx` — props `{ video: ChallengeVideo }`.
- 썸네일(`next/image` 사용 시 `next.config`에 `i.ytimg.com` 허용, 또는 `<img>` + lint 경고 처리), 제목(2줄 말줄임), 채널명, 조회수("1.2만"/천 단위 콤마), 업로드일.
- 카드 전체가 `video.videoUrl` 링크: `target="_blank"`, `rel="noopener noreferrer"`. 이미지에 `alt`(제목) 제공.
- 호버 시 살짝 강조(커서 pointer, 미세한 스케일/보더). 터치 타깃 충분히 크게.

`src/components/VideoGrid.tsx` — `{ videos: ChallengeVideo[] }`를 반응형 그리드(모바일 1열 → sm 2열 → lg 3~4열)로 렌더.

`src/components/SkeletonGrid.tsx` — 로딩용. `VideoGrid`와 동일한 그리드 형태로 회색 펄스 카드를 렌더.

### 3. 디자인 (PRD 준수)

- 다크 배경(예: `bg-neutral-950`), 밝은 텍스트, 충분한 명도 대비(접근성).
- 포인트 컬러는 핑크 계열 1가지(예: `pink-500`). 과하게 쓰지 마라.
- 헤더: "ChallengePick" + 부제("지금 핫한 아이돌 챌린지 댄스"). 미니멀하게.

### 핵심 규칙 (반드시 준수)

- `RecommendFeed`는 `/api/recommend`만 호출한다. `@/services/youtube`나 `process.env`를 클라이언트에서 import/접근하지 마라. 이유: ARCHITECTURE.md / CLAUDE.md CRITICAL — API 키가 클라이언트 번들에 노출된다.
- `VideoCard`/`VideoGrid`/`SkeletonGrid`는 데이터를 fetch 하지 마라. props만 렌더한다.
- 4가지 상태(loading/success/empty/error)를 빠짐없이 구현하라. 이유: UX 원칙 2 — 상태가 항상 명확해야 한다.
- 에러/빈 상태에서 사용자를 탓하는 문구나 내부 에러/키 값을 노출하지 마라.

## Acceptance Criteria

```bash
npm run build
npm run lint
```

빌드와 lint가 에러 없이 통과해야 한다. (API 키가 없어도 빌드는 통과해야 하며, 런타임에 안내 메시지가 표시되는 구조여야 한다.)

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - 컴포넌트가 `src/components/`에 있는가?
   - `page.tsx`는 Server Component 쉘이고, 클라이언트 `RecommendFeed`는 `/api/recommend`만 호출하는가? (외부 API/서비스/`process.env` 직접 접근 없음 — CLAUDE.md CRITICAL)
   - 4가지 상태(loading/success/empty/error)가 모두 구현됐는가? (ARCHITECTURE.md UX 흐름)
   - PRD 디자인(다크모드, 핑크 포인트, 미니멀) + 접근성(명도 대비, alt)을 따르는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "page 쉘 + RecommendFeed(4상태) + VideoCard/VideoGrid/SkeletonGrid, 키워드칩/새로고침 UX 완성"`
   - 실패 → `"status": "error"`, `"error_message"` 기록
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason"` 기록 후 중단

## 금지사항

- `next/image` 사용 시 도메인 설정을 빠뜨리지 마라(빌드/런타임 에러 발생). 또는 `<img>`를 쓰고 lint 경고를 처리하라.
- 컴포넌트에서 `process.env`나 API 키에 접근하지 마라. 이유: 클라이언트 노출 위험.
- 기존 테스트(step 2)를 깨뜨리지 마라.
