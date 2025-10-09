/**
 * TypeScript Type Definitions for Filmory App
 *
 * 모든 데이터 모델과 인터페이스 정의
 */

// ============================================
// Movie Related Types
// ============================================

export type MovieStatus = "wishlist" | "watching" | "completed"

export interface Movie {
  id: number
  title: string
  originalTitle?: string
  poster: string
  backdrop?: string
  year?: number
  runtime?: number // minutes
  genre?: string
  director?: string
  synopsis?: string
  rating?: number // 0-5 (0.5 단위)
  status: MovieStatus
  watchDate?: Date | string
  createdAt?: Date | string
}

export interface MovieDetail extends Movie {
  actors?: string
  oneLineReview?: string
  detailedReview?: string
  tags?: string[]
  watchLocation?: string
  watchMethod?: "theater" | "ott" | "tv" | "other"
  watchedWith?: string
  isBestMovie?: boolean
  progress?: number // minutes watched (for status: "watching")
}

// ============================================
// User Related Types
// ============================================

export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  yearlyGoal?: number
  createdAt?: Date | string
}

// ============================================
// Statistics Types
// ============================================

export interface MonthlyData {
  month: string // "1월", "2월", etc.
  count: number
}

export interface GenreStat {
  genre: string
  count: number
  color: string
}

export interface TagStat {
  tag: string
  count: number
}

export interface UserStats {
  totalWatched: number
  totalWatchTime: number // minutes
  averageRating: number
  currentStreak: number // days
  yearlyGoal: number
  currentYearCount: number
  monthlyData: MonthlyData[]
  genreBreakdown: GenreStat[]
  topTags: TagStat[]
}

// ============================================
// Collection Types
// ============================================

export interface Collection {
  id: number
  name: string
  description?: string
  movieCount: number
  isAuto?: boolean
  createdAt?: Date | string
}

export interface CollectionDetail extends Collection {
  movies: Movie[]
}

// ============================================
// Navigation Types
// ============================================

export type RootStackParamList = {
  Main: undefined
  MovieDetail: { id: number }
  MovieSearch: undefined
  CollectionDetail: { id: number }
}

export type TabParamList = {
  Home: undefined
  Movies: undefined
  Stats: undefined
  Profile: undefined
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
}

// ============================================
// Form Types
// ============================================

export interface MovieFormData {
  rating?: number
  oneLineReview?: string
  detailedReview?: string
  watchDate?: Date
  watchLocation?: string
  watchMethod?: "theater" | "ott" | "tv" | "other"
  watchedWith?: string
  isBestMovie?: boolean
  tags?: string[]
  status: MovieStatus
}

// ============================================
// UI Component Types
// ============================================

export interface MovieCardProps {
  movie: Movie
  onPress?: (movie: Movie) => void
}

export interface StatCardProps {
  title: string
  value: string | number
  icon?: keyof typeof import("@expo/vector-icons").Ionicons["glyphMap"]
  color?: string
}

export interface FilterChipProps {
  label: string
  isActive: boolean
  onPress: () => void
}
