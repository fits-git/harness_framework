import "server-only";

import type { ChallengeVideo, RecommendParams } from "@/types";
import {
  DEFAULT_KEYWORD,
  DEFAULT_DAYS_WINDOW,
  DEFAULT_MAX_RESULTS,
} from "@/types";

// YouTube Data API v3 엔드포인트
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

// 검색은 후보를 넉넉히 확보한 뒤 정확한 조회수로 재정렬한다.
// search.list maxResults 상한이 50이므로 그 범위 내에서 maxResults의 3배를 확보한다.
const SEARCH_CANDIDATE_CAP = 50;

/**
 * videos.list API의 raw item 배열을 받아 ChallengeVideo[]로 변환한다.
 * - viewCount를 number로 변환
 * - 조회수 내림차순 정렬
 * - 상위 maxResults개로 절단
 *
 * 순수 함수(네트워크 없음) — 단위 테스트 대상.
 */
export function mapAndRankVideos(
  rawItems: unknown[],
  maxResults: number
): ChallengeVideo[] {
  const videos = rawItems.map(toChallengeVideo);
  videos.sort((a, b) => b.viewCount - a.viewCount);
  return videos.slice(0, maxResults);
}

/**
 * YouTube에서 챌린지 영상을 조회해 추천 순서(조회수 내림차순)로 반환한다.
 * 서버 전용. API 키는 process.env.YOUTUBE_API_KEY에서만 읽는다.
 */
export async function fetchChallengeVideos(
  params: RecommendParams
): Promise<ChallengeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not set");
  }

  const keyword = params.keyword ?? DEFAULT_KEYWORD;
  const daysWindow = params.daysWindow ?? DEFAULT_DAYS_WINDOW;
  const maxResults = params.maxResults ?? DEFAULT_MAX_RESULTS;

  const publishedAfter = new Date(
    Date.now() - daysWindow * 24 * 60 * 60 * 1000
  ).toISOString();

  const candidateCount = Math.min(maxResults * 3, SEARCH_CANDIDATE_CAP);

  // 1. search.list — 후보 videoId 확보 (viewCount는 여기서 정확히 주지 않음)
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: keyword,
    type: "video",
    order: "viewCount",
    publishedAfter,
    maxResults: String(candidateCount),
    key: apiKey,
  });
  const searchRes = await fetch(`${SEARCH_URL}?${searchParams.toString()}`);
  if (!searchRes.ok) {
    throw new Error(`YouTube search.list failed: ${searchRes.status}`);
  }
  const searchData = (await searchRes.json()) as {
    items?: { id?: { videoId?: string } }[];
  };

  const videoIds = (searchData.items ?? [])
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) {
    return [];
  }

  // 2. videos.list — 정확한 statistics(viewCount)와 메타데이터 조회
  const videosParams = new URLSearchParams({
    part: "snippet,statistics",
    id: videoIds.join(","),
    key: apiKey,
  });
  const videosRes = await fetch(`${VIDEOS_URL}?${videosParams.toString()}`);
  if (!videosRes.ok) {
    throw new Error(`YouTube videos.list failed: ${videosRes.status}`);
  }
  const videosData = (await videosRes.json()) as { items?: unknown[] };

  // 3. 매핑 + 정렬 + 절단
  return mapAndRankVideos(videosData.items ?? [], maxResults);
}

// --- 내부 헬퍼 ---

interface RawVideoItem {
  id?: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  statistics?: {
    viewCount?: string | number;
  };
}

/** videos.list raw item 1개를 ChallengeVideo로 변환한다. */
function toChallengeVideo(raw: unknown): ChallengeVideo {
  const item = raw as RawVideoItem;
  const videoId = item.id ?? "";
  const snippet = item.snippet ?? {};
  const thumbnails = snippet.thumbnails ?? {};

  // 가장 높은 해상도 우선: high → medium → default
  const thumbnailUrl =
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    "";

  return {
    videoId,
    title: snippet.title ?? "",
    channelTitle: snippet.channelTitle ?? "",
    thumbnailUrl,
    viewCount: Number(item.statistics?.viewCount ?? 0),
    publishedAt: snippet.publishedAt ?? "",
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}
