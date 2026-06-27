/**
 * 로딩 상태용 스켈레톤. VideoGrid와 동일한 그리드 형태로
 * 회색 펄스 카드를 렌더해 화면 깜빡임/빈 화면을 방지한다. 순수 컴포넌트.
 */
export default function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
        >
          <div className="aspect-video w-full animate-pulse bg-neutral-800" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-800" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-neutral-800" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
