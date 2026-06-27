// ChallengePick 핵심 도메인 타입
// 서비스(step 2) / API 라우트(step 3) / UI(step 4)가 공유한다.

/**
 * 추천 카드 1개에 표시할 영상 정보.
 * 서비스 레이어가 YouTube Data API v3 응답을 가공한 결과물.
 */
export interface ChallengeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  /** 카드에 표시할, 가장 적합한 해상도의 썸네일 URL */
  thumbnailUrl: string;
  /** 정렬 기준. YouTube는 문자열로 주므로 서비스 레이어에서 number로 변환할 것 */
  viewCount: number;
  /** 업로드 시각 (ISO 8601 문자열) */
  publishedAt: string;
  /** https://www.youtube.com/watch?v=<videoId> */
  videoUrl: string;
}

/**
 * 추천 요청 파라미터. 모든 필드는 선택이며, 미지정 시 아래 기본값 상수를 사용한다.
 */
export interface RecommendParams {
  /** 검색 키워드. 미지정 시 DEFAULT_KEYWORD 사용 */
  keyword?: string;
  /** 최근 N일 이내 업로드만 대상. 미지정 시 DEFAULT_DAYS_WINDOW 사용 */
  daysWindow?: number;
  /** 반환할 영상 개수. 미지정 시 DEFAULT_MAX_RESULTS 사용 */
  maxResults?: number;
}

/**
 * API Route(/api/recommend) 응답 형태.
 */
export interface RecommendResponse {
  videos: ChallengeVideo[];
  /** 추천 목록을 생성한 시각 (ISO 8601 문자열) */
  generatedAt: string;
}

// 기본값 상수
export const DEFAULT_KEYWORD = "아이돌 챌린지";
export const DEFAULT_DAYS_WINDOW = 30;
export const DEFAULT_MAX_RESULTS = 12;
