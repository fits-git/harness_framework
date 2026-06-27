import RecommendFeed from "@/components/RecommendFeed";

/**
 * 메인 페이지 — Server Component 쉘.
 * 헤더/레이아웃만 그리고, 추천 데이터 로딩은 Client Component RecommendFeed에 위임한다.
 * 여기서 직접 데이터를 fetch 하지 않는다.
 */
export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-50 sm:text-3xl">
          Challenge<span className="text-pink-500">Pick</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          지금 핫한 아이돌 챌린지 댄스
        </p>
      </header>

      <RecommendFeed />
    </main>
  );
}
