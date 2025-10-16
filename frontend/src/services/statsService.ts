import api from '../lib/api';

// ===========================
// Stats Service
// ===========================

export interface OverallStats {
  total_watched: number;
  total_watch_time: number; // 분
  average_rating: number;
  current_streak: number; // 연속 기록 일수
  yearly_goal?: number;
  yearly_progress: number;
}

export interface MonthlyData {
  month: string; // "2025-01"
  count: number;
}

export interface GenreStats {
  genre: string;
  count: number;
  percentage: number;
}

export interface TagStats {
  tag: string;
  count: number;
}

export interface BestMovie {
  id: number;
  title: string;
  poster_url: string;
  rating: number;
  year?: number;
}

// ===========================
// API Functions
// ===========================

/**
 * 전체 통계 조회
 */
export const getOverallStats = async (): Promise<OverallStats> => {
  const response = await api.get('/api/v1/stats');
  return response.data;
};

/**
 * 월별 관람 추이 조회
 * @param months - 조회할 개월 수 (기본값: 6)
 */
export const getMonthlyStats = async (months: number = 6): Promise<MonthlyData[]> => {
  const response = await api.get('/api/v1/stats/monthly', {
    params: { months },
  });
  return response.data;
};

/**
 * 장르 통계 조회
 * @param limit - 조회할 장르 개수 (기본값: 5)
 */
export const getGenreStats = async (limit: number = 5): Promise<GenreStats[]> => {
  const response = await api.get('/api/v1/stats/genres', {
    params: { limit },
  });
  return response.data;
};

/**
 * 태그 통계 조회
 * @param limit - 조회할 태그 개수 (기본값: 10)
 */
export const getTagStats = async (limit: number = 10): Promise<TagStats[]> => {
  const response = await api.get('/api/v1/stats/tags', {
    params: { limit },
  });
  return response.data;
};

/**
 * 인생 영화 목록 조회
 * @param limit - 조회할 영화 개수 (기본값: 10)
 */
export const getBestMovies = async (limit: number = 10): Promise<BestMovie[]> => {
  const response = await api.get('/api/v1/stats/best-movies', {
    params: { limit },
  });
  return response.data;
};
