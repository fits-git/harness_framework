import { NextRequest, NextResponse } from "next/server";
import type { RecommendParams, RecommendResponse } from "@/types";
import { fetchChallengeVideos } from "@/services/youtube";

// 매 요청 시 최신 영상을 조회해야 하므로 빌드타임 캐싱을 막는다.
export const dynamic = "force-dynamic";

/** 쿼리스트링의 숫자 파라미터를 파싱한다. 없거나 NaN이면 undefined. */
function parseNumberParam(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const keyword = searchParams.get("keyword") ?? undefined;
  const params: RecommendParams = {
    keyword,
    daysWindow: parseNumberParam(searchParams.get("days")),
    maxResults: parseNumberParam(searchParams.get("max")),
  };

  try {
    const videos = await fetchChallengeVideos(params);
    const body: RecommendResponse = {
      videos,
      generatedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch (err) {
    // 원본 에러는 서버 로그로만 남기고 응답 본문에는 노출하지 않는다.
    console.error("[/api/recommend]", err);

    const message = err instanceof Error ? err.message : "";
    if (message.includes("YOUTUBE_API_KEY")) {
      return NextResponse.json(
        { error: "서버에 YouTube API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "추천 영상을 가져오지 못했습니다." },
      { status: 502 }
    );
  }
}
