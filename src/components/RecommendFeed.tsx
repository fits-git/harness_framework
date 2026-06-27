"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChallengeVideo, RecommendResponse } from "@/types";
import { DEFAULT_KEYWORD } from "@/types";
import VideoGrid from "./VideoGrid";
import SkeletonGrid from "./SkeletonGrid";

type Status = "loading" | "success" | "error";

// 상단 키워드 칩. "전체"는 서비스 기본 키워드를 사용한다.
const KEYWORD_CHIPS: { label: string; keyword: string }[] = [
  { label: "전체", keyword: DEFAULT_KEYWORD },
  { label: "신곡 챌린지", keyword: "신곡 챌린지" },
  { label: "댄스챌린지", keyword: "댄스챌린지" },
];

// 사용자에게 보여줄 기본 에러 문구. 내부 에러/키 값은 절대 노출하지 않는다.
const FALLBACK_ERROR = "영상을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

/**
 * 추천 피드. 마운트 시 그리고 키워드 변경/새로고침 시 /api/recommend를 호출한다.
 * loading / success / empty / error 4상태를 각각 다른 UI로 렌더한다.
 *
 * 보안: 절대 @/services/youtube나 process.env에 직접 접근하지 않는다.
 * 외부 API 호출은 서버 라우트(/api/recommend)에만 둔다.
 */
export default function RecommendFeed() {
  const [keyword, setKeyword] = useState(DEFAULT_KEYWORD);
  const [status, setStatus] = useState<Status>("loading");
  const [videos, setVideos] = useState<ChallengeVideo[]>([]);

  const load = useCallback(async (kw: string) => {
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/recommend?keyword=${encodeURIComponent(kw)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        // 라우트가 주는 사용자용 문구만 표시. raw error는 사용하지 않는다.
        throw new Error("request failed");
      }
      const data = (await res.json()) as RecommendResponse;
      setVideos(data.videos ?? []);
      setStatus("success");
    } catch {
      setVideos([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(keyword);
  }, [keyword, load]);

  const isLoading = status === "loading";

  return (
    <section className="space-y-6">
      {/* 컨트롤 바: 키워드 칩 + 새로고침 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2" role="group" aria-label="키워드 선택">
          {KEYWORD_CHIPS.map((chip) => {
            const active = chip.keyword === keyword;
            return (
              <button
                key={chip.keyword}
                type="button"
                onClick={() => setKeyword(chip.keyword)}
                aria-pressed={active}
                className={
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500 " +
                  (active
                    ? "border-pink-500 bg-pink-500 text-white"
                    : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-500")
                }
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => load(keyword)}
          disabled={isLoading}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-1.5 text-sm font-medium text-neutral-200 transition hover:border-pink-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
        >
          {isLoading && (
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-500 border-t-pink-500"
            />
          )}
          새로고침
        </button>
      </div>

      {/* 상태별 본문 */}
      {isLoading && <SkeletonGrid />}

      {status === "success" && videos.length > 0 && (
        <VideoGrid videos={videos} />
      )}

      {status === "success" && videos.length === 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center">
          <p className="text-base font-medium text-neutral-200">
            조건에 맞는 영상이 없어요
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            다른 키워드를 골라보세요. 예: &ldquo;댄스챌린지&rdquo;
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center">
          <p className="text-base font-medium text-neutral-200">
            {FALLBACK_ERROR}
          </p>
          <button
            type="button"
            onClick={() => load(keyword)}
            className="mt-4 rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-500"
          >
            다시 시도
          </button>
        </div>
      )}
    </section>
  );
}
