import api, { unwrapResponse } from '../lib/api';

// ===========================
// Movie Service
// ===========================

export interface UserMovieCreate {
  movie_id: number;
  status: 'watching' | 'completed' | 'watchlist';
  rating?: number;
  one_line_review?: string;
  watch_date?: string;
  progress?: number;
  current_season?: number;
  current_episode?: number;
  watch_method?: 'theater' | 'ott' | 'tv' | 'other';
  watch_location?: string;
  watched_with?: string;
  is_best_movie?: boolean;
}

export interface UserMovieUpdate {
  status?: 'watching' | 'completed' | 'watchlist';
  rating?: number;
  one_line_review?: string;
  watch_date?: string;
  progress?: number;
  current_season?: number;
  current_episode?: number;
  watch_method?: 'theater' | 'ott' | 'tv' | 'other';
  watch_location?: string;
  watched_with?: string;
  is_best_movie?: boolean;
  genre?: string;
  runtime?: number;
  content_type?: 'movie' | 'series';
  release_channel?: 'theatrical' | 'ott_original' | 'tv' | 'unknown';
  total_episodes?: number;
}

export interface MovieSearchParams {
  q: string;
}

export interface MovieMetadata {
  title: string;
  original_title?: string | null;
  content_type?: 'movie' | 'series';
  release_channel?: 'theatrical' | 'ott_original' | 'tv' | 'unknown';
  director?: string | null;
  year?: number | null;
  runtime?: number | null;
  total_episodes?: number | null;
  genre?: string | null;
  poster_url?: string | null;
  backdrop_url?: string | null;
  synopsis?: string | null;
  kobis_code?: string | null;
  tmdb_id?: number | null;
  kmdb_id?: string | null;
}

const normalizeMovie = (movie: any) => ({
  ...movie,
  poster: movie?.poster ?? movie?.poster_url ?? movie?.backdrop_url ?? movie?.backdrop ?? null,
  backdrop: movie?.backdrop ?? movie?.backdrop_url ?? null,
  poster_url: movie?.poster_url ?? movie?.poster ?? movie?.backdrop_url ?? movie?.backdrop ?? null,
  backdrop_url: movie?.backdrop_url ?? movie?.backdrop ?? null,
  review: movie?.review ?? movie?.one_line_review ?? '',
  content_type: movie?.content_type ?? 'movie',
  release_channel: movie?.release_channel ?? 'unknown',
  total_episodes: movie?.total_episodes ?? null,
  current_season: movie?.current_season ?? null,
  current_episode: movie?.current_episode ?? null,
});

// ===========================
// API Functions
// ===========================

export const getMovies = async (
  status?: string,
  filters?: { content_type?: 'movie' | 'series'; release_channel?: 'theatrical' | 'ott_original' | 'tv' | 'unknown' }
) => {
  const params = { ...(status ? { status } : {}), ...(filters ?? {}) };
  const response = await api.get('/api/v1/movies/', { params });
  return unwrapResponse<any[]>(response).map(normalizeMovie);
};

export const getMovieDetail = async (movieId: number) => {
  const response = await api.get(`/api/v1/movies/${movieId}`);
  return normalizeMovie(unwrapResponse<any>(response));
};

export const addMovie = async (data: UserMovieCreate) => {
  const response = await api.post('/api/v1/movies/', data);
  return normalizeMovie(unwrapResponse<any>(response));
};

export const updateMovie = async (movieId: number, data: UserMovieUpdate) => {
  const response = await api.put(`/api/v1/movies/${movieId}`, data);
  return normalizeMovie(unwrapResponse<any>(response));
};

export const deleteMovie = async (movieId: number) => {
  const response = await api.delete(`/api/v1/movies/${movieId}`);
  return unwrapResponse<any>(response);
};

export const searchMovies = async (query: string) => {
  const response = await api.get('/api/v1/movies/search', {
    params: { q: query },
  });
  return unwrapResponse<any[]>(response);
};

export const getMovieMetadata = async (source: 'kobis' | 'tmdb' | 'tmdb_tv', movieId: string | number) => {
  const response = await api.get(`/api/v1/movies/metadata/${source}/${movieId}`);
  return unwrapResponse<MovieMetadata>(response);
};

export const mergeMovieMetadata = async (searchResult: any) => {
  const response = await api.post('/api/v1/movies/metadata/merge', searchResult);
  return unwrapResponse<MovieMetadata>(response);
};

export const createMovieFromMetadata = async (metadata: any) => {
  const response = await api.post('/api/v1/movies/from-metadata', metadata);
  return unwrapResponse<any>(response);
};
