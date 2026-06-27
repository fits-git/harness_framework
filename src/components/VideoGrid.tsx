import type { ChallengeVideo } from "@/types";
import VideoCard from "./VideoCard";

/**
 * 추천 영상 카드들을 반응형 그리드로 렌더한다.
 * 모바일 1열 → sm 2열 → lg 3열 → xl 4열. 순수 컴포넌트(fetch 없음).
 */
export default function VideoGrid({ videos }: { videos: ChallengeVideo[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} />
      ))}
    </div>
  );
}
