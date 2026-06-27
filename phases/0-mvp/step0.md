# Step 0: project-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ADR.md`
- `CLAUDE.md`

이 step은 프로젝트의 첫 step이다. 아직 코드가 없으므로 위 문서만 읽고 시작하라.

## 작업

이 저장소 루트(`harness_framework/`)에 Next.js 15 앱을 셋업한다. **별도 하위 폴더를 만들지 말고 현재 저장소 루트에 직접** 셋업한다. 기존 `docs/`, `scripts/`, `phases/`, `CLAUDE.md`, `.gitignore`, `backup/` 등은 절대 삭제·이동하지 마라.

1. **package.json** 생성. Next.js 15, React 19, TypeScript, Tailwind CSS, vitest 의존성을 포함한다. 스크립트:
   - `dev`: `next dev`
   - `build`: `next build`
   - `lint`: `next lint`
   - `test`: `vitest run`

2. **TypeScript strict 설정** — `tsconfig.json` 생성. `strict: true`, 경로 alias `@/*` → `src/*`.

3. **Tailwind 셋업** — `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`(Tailwind 지시어 포함). `content` 경로에 `./src/**/*.{ts,tsx}` 포함.

4. **App Router 최소 골격**:
   - `src/app/layout.tsx` — `<html lang="ko">`, `globals.css` import, 다크 배경. metadata title "ChallengePick".
   - `src/app/page.tsx` — 임시 placeholder("ChallengePick" 헤더 한 줄). 다음 step에서 교체된다.

5. **환경변수 파일**:
   - `.env.example` 생성 — 내용은 정확히 다음 한 줄: `YOUTUBE_API_KEY=`
   - `.env.example` 위에 주석으로 발급 안내 한 줄 추가: `# YouTube Data API v3 키를 https://console.cloud.google.com 에서 발급받아 입력하세요`
   - **`.env.local` 파일은 생성하지 마라.** 실제 키는 사용자가 직접 넣는다.

6. **`.gitignore` 갱신** — 기존 `.gitignore`를 읽고, 없으면 다음 항목을 추가한다: `node_modules/`, `.next/`, `.env.local`, `.env*.local`. 기존 항목은 지우지 마라.

7. **vitest 설정** — `vitest.config.ts` 생성. `@/*` alias가 테스트에서도 동작하도록 resolve.alias 설정. 환경은 `node`.

8. **ESLint** — Next.js 기본 lint가 동작하도록 `eslint-config-next` 포함 및 `.eslintrc.json`(또는 flat config) 생성.

### 핵심 규칙 (반드시 준수)

- `npm install`을 실행해 의존성을 실제로 설치하라(빌드/lint AC를 통과해야 하므로).
- 패키지 매니저는 npm을 사용하라.
- `NEXT_PUBLIC_` 접두사가 붙은 환경변수를 만들지 마라. 이유: API 키가 클라이언트 번들에 노출된다.

## Acceptance Criteria

```bash
npm install
npm run build
npm run lint
```

빌드와 lint가 에러 없이 통과해야 한다. (placeholder 페이지만 있으면 됨.)

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - `src/app/` 구조가 ARCHITECTURE.md를 따르는가?
   - `.env.example`에 `YOUTUBE_API_KEY=`가 있고, 실제 키나 `.env.local`은 커밋되지 않는가?
   - CLAUDE.md CRITICAL 규칙(키 비노출)을 위반하지 않았는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "산출물 한 줄 요약 (생성된 주요 파일/설정 명시)"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- 기존 `docs/`, `scripts/`, `phases/`, `backup/`, `CLAUDE.md`, `scripts/execute.py`를 삭제·수정하지 마라. 이유: harness 프레임워크의 핵심 파일이다.
- `.env.local`을 생성하거나 커밋하지 마라. 이유: 실제 시크릿은 사용자만 넣어야 하며 절대 git에 들어가면 안 된다.
- 메인 페이지에 실제 추천 UI를 구현하지 마라. 이유: 그것은 step 4의 작업이다. 이 step은 셋업만 한다.
