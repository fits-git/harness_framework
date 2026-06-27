import { describe, it, expect } from "vitest";
import { mapAndRankVideos } from "./youtube";

// 실제 YouTube videos.list 응답 item 구조를 모방한 헬퍼
function makeRawItem(opts: {
  id: string;
  viewCount: string;
  thumbnails?: {
    high?: { url: string };
    medium?: { url: string };
    default?: { url: string };
  };
}) {
  return {
    id: opts.id,
    snippet: {
      title: `title-${opts.id}`,
      channelTitle: `channel-${opts.id}`,
      publishedAt: "2026-06-01T00:00:00Z",
      thumbnails: opts.thumbnails ?? { high: { url: `https://img/${opts.id}` } },
    },
    statistics: { viewCount: opts.viewCount },
  };
}

describe("mapAndRankVideos", () => {
  it("조회수 내림차순으로 정렬해 반환한다", () => {
    const raw = [
      makeRawItem({ id: "a", viewCount: "100" }),
      makeRawItem({ id: "b", viewCount: "300" }),
      makeRawItem({ id: "c", viewCount: "200" }),
    ];

    const result = mapAndRankVideos(raw, 10);

    expect(result.map((v) => v.videoId)).toEqual(["b", "c", "a"]);
    expect(result.map((v) => v.viewCount)).toEqual([300, 200, 100]);
  });

  it("maxResults로 개수가 잘린다", () => {
    const raw = [
      makeRawItem({ id: "a", viewCount: "100" }),
      makeRawItem({ id: "b", viewCount: "300" }),
      makeRawItem({ id: "c", viewCount: "200" }),
    ];

    const result = mapAndRankVideos(raw, 2);

    expect(result).toHaveLength(2);
    // 상위 2개(조회수 큰 순)만 남는다
    expect(result.map((v) => v.videoId)).toEqual(["b", "c"]);
  });

  it("viewCount를 number 타입으로 변환한다 ('9' < '10' 문자열 정렬 버그 방지)", () => {
    const raw = [
      makeRawItem({ id: "small", viewCount: "9" }),
      makeRawItem({ id: "big", viewCount: "10" }),
    ];

    const result = mapAndRankVideos(raw, 10);

    expect(typeof result[0].viewCount).toBe("number");
    // 숫자 비교라면 10 > 9 이므로 big이 먼저 와야 한다
    expect(result.map((v) => v.videoId)).toEqual(["big", "small"]);
  });

  it("썸네일 fallback: high가 없으면 medium을 사용한다", () => {
    const raw = [
      makeRawItem({
        id: "a",
        viewCount: "100",
        thumbnails: { medium: { url: "https://img/medium-a" } },
      }),
    ];

    const result = mapAndRankVideos(raw, 10);

    expect(result[0].thumbnailUrl).toBe("https://img/medium-a");
  });

  it("ChallengeVideo로 메타데이터와 videoUrl을 매핑한다", () => {
    const raw = [makeRawItem({ id: "xyz", viewCount: "500" })];

    const [video] = mapAndRankVideos(raw, 10);

    expect(video).toMatchObject({
      videoId: "xyz",
      title: "title-xyz",
      channelTitle: "channel-xyz",
      publishedAt: "2026-06-01T00:00:00Z",
      videoUrl: "https://www.youtube.com/watch?v=xyz",
    });
  });
});
