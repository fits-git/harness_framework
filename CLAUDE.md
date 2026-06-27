# 프로젝트: ChallengePick

요즘 핫하고 바이럴한 아이돌 챌린지/댄스 영상을 YouTube에서 찾아 추천하는 웹 앱.

## 기술 스택
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- 테스트: vitest

## 아키텍처 규칙
- CRITICAL: `YOUTUBE_API_KEY`는 서버 사이드(API Route / Server Component)에서만 사용한다. 클라이언트 번들에 절대 노출하지 말 것. `NEXT_PUBLIC_` 접두사로 노출 금지.
- CRITICAL: 외부 API(YouTube) 호출 로직은 `src/services/`에만 둔다. 클라이언트 컴포넌트에서 직접 외부 API를 호출하지 말 것.
- 컴포넌트는 `src/components/`에, 타입은 `src/types/`에 분리한다.
- 기본은 Server Component. 인터랙션이 필요한 곳만 Client Component(`"use client"`).

## 개발 프로세스
- 단위 테스트는 `src/services/youtube.ts`의 정렬/파싱 로직에 한정해 작성한다(fetch는 mock). MVP 속도를 위해 UI/라우트 테스트는 생략한다.
- 커밋 메시지는 conventional commits 형식을 따를 것 (feat:, fix:, docs:, refactor:, chore:).

## 명령어
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npm run test     # vitest (run 모드)
