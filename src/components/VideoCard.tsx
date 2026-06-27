import Image from "next/image";
import type { ChallengeVideo } from "@/types";

/** 조회수를 "1.2만" / "3,456" 형태의 한국어 표기로 변환한다. */
function formatViewCount(count: number): string {
  if (count >= 100_000_000) {
    return `${(count / 100_000_000).toFixed(1).replace(/\.0$/, "")}억`;
  }
  if (count >= 10_000) {
    return `${(count / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  }
  return count.toLocaleString("ko-KR");
}

/** ISO 8601 업로드 시각을 "2026.06.27" 형태로 변환한다. */
function formatPublishedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 추천 영상 카드 1개. 데이터를 fetch 하지 않고 props만 렌더하는 순수 컴포넌트.
 * 카드 전체가 YouTube 영상으로 가는 링크(새 탭).
 */
export default function VideoCard({ video }: { video: ChallengeVideo }) {
  return (
    <a
      href={video.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-neutral-600"
          >
            썸네일 없음
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-100">
          {video.title}
        </h3>
        <p className="truncate text-xs text-neutral-400">{video.channelTitle}</p>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>조회수 {formatViewCount(video.viewCount)}</span>
          {video.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatPublishedAt(video.publishedAt)}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
