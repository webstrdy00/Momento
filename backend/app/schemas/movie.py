"""
Movie Pydantic schemas
영화 관련 스키마
"""
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field

TITLE_MAX_LENGTH = 255
SHORT_TEXT_MAX_LENGTH = 255
EXTERNAL_ID_MAX_LENGTH = 50
URL_MAX_LENGTH = 2048
SYNOPSIS_MAX_LENGTH = 5000
REVIEW_MAX_LENGTH = 2000
PRODUCTION_YEAR_MIN = 0
PRODUCTION_YEAR_MAX = 2100
RUNTIME_MAX_MINUTES = 24 * 60 * 100
PROGRESS_MAX_MINUTES = 24 * 60 * 100


class MovieBase(BaseModel):
    """Movie 기본 스키마"""
    title: str = Field(..., alias="title_ko", min_length=1, max_length=TITLE_MAX_LENGTH)
    original_title: Optional[str] = Field(None, alias="title_original", max_length=TITLE_MAX_LENGTH)
    content_type: str = Field("movie", pattern="^(movie|series)$")
    release_channel: str = Field("unknown", pattern="^(theatrical|ott_original|tv|unknown)$")
    director: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    year: Optional[int] = Field(None, alias="production_year", ge=PRODUCTION_YEAR_MIN, le=PRODUCTION_YEAR_MAX)
    runtime: Optional[int] = Field(None, ge=0, le=RUNTIME_MAX_MINUTES)  # minutes
    total_episodes: Optional[int] = Field(None, ge=0, le=10000)
    genre: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)  # comma-separated
    poster_url: Optional[str] = Field(None, max_length=URL_MAX_LENGTH)
    backdrop_url: Optional[str] = Field(None, max_length=URL_MAX_LENGTH)
    synopsis: Optional[str] = Field(None, max_length=SYNOPSIS_MAX_LENGTH)
    kobis_code: Optional[str] = Field(None, max_length=EXTERNAL_ID_MAX_LENGTH)
    tmdb_id: Optional[int] = None
    kmdb_id: Optional[str] = Field(None, max_length=EXTERNAL_ID_MAX_LENGTH)

    class Config:
        from_attributes = True
        populate_by_name = True  # alias와 필드명 둘 다 허용


class MovieCreate(MovieBase):
    """Movie 생성 스키마 (외부 API에서 메타데이터 가져온 후)"""
    pass


class MovieUpdate(BaseModel):
    """Movie 업데이트 스키마 (메타데이터는 수정 불가, 사용자 데이터만 수정)"""
    pass


class MovieResponse(MovieBase):
    """Movie 응답 스키마"""
    id: int
    created_at: datetime
    updated_at: datetime


class UserMovieBase(BaseModel):
    """UserMovie 기본 스키마"""
    movie_id: int
    # 레거시(wishlist) + 현재 프론트(watchlist) 모두 허용
    status: str = Field(..., pattern="^(wishlist|watchlist|watching|completed)$")
    rating: Optional[float] = Field(None, ge=0, le=5)  # 0~5, 0.5 단위 허용
    one_line_review: Optional[str] = Field(None, max_length=REVIEW_MAX_LENGTH)  # 모델과 일치
    watch_date: Optional[date] = None
    progress: Optional[int] = Field(None, ge=0, le=PROGRESS_MAX_MINUTES)  # minutes watched
    current_season: Optional[int] = Field(None, ge=0, le=10000)
    current_episode: Optional[int] = Field(None, ge=0, le=100000)
    watch_method: Optional[str] = Field(None, pattern="^(theater|ott|tv|other)$")
    watch_location: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    watched_with: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    is_best_movie: bool = False  # 모델과 일치


class UserMovieCreate(UserMovieBase):
    """UserMovie 생성 스키마 (영화 추가)"""
    pass


class UserMovieUpdate(BaseModel):
    """UserMovie 업데이트 스키마"""
    status: Optional[str] = Field(None, pattern="^(wishlist|watchlist|watching|completed)$")
    rating: Optional[float] = Field(None, ge=0, le=5)
    one_line_review: Optional[str] = Field(None, max_length=REVIEW_MAX_LENGTH)
    watch_date: Optional[date] = None
    progress: Optional[int] = Field(None, ge=0, le=PROGRESS_MAX_MINUTES)
    current_season: Optional[int] = Field(None, ge=0, le=10000)
    current_episode: Optional[int] = Field(None, ge=0, le=100000)
    watch_method: Optional[str] = Field(None, pattern="^(theater|ott|tv|other)$")
    watch_location: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    watched_with: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    is_best_movie: Optional[bool] = None
    genre: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)  # Movie 테이블 업데이트용
    runtime: Optional[int] = Field(None, ge=0, le=RUNTIME_MAX_MINUTES)  # Movie 테이블 업데이트용
    content_type: Optional[str] = Field(None, pattern="^(movie|series)$")  # Movie 테이블 업데이트용
    release_channel: Optional[str] = Field(None, pattern="^(theatrical|ott_original|tv|unknown)$")  # Movie 테이블 업데이트용
    total_episodes: Optional[int] = Field(None, ge=0, le=10000)  # Movie 테이블 업데이트용


class UserMovieResponse(UserMovieBase):
    """UserMovie 응답 스키마 (중첩 구조)"""
    id: int
    user_id: UUID
    movie: MovieResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MovieTagItem(BaseModel):
    """영화 상세용 태그 요약 스키마"""
    id: int
    name: str


class FlatMovieResponse(BaseModel):
    """Frontend 호환 평평한 영화 응답 스키마"""
    # UserMovie 필드
    id: int  # UserMovie ID
    user_id: UUID
    status: str
    rating: Optional[float] = None
    review: Optional[str] = None  # one_line_review
    watch_date: Optional[date] = None
    progress: Optional[int] = None
    current_season: Optional[int] = None
    current_episode: Optional[int] = None
    watch_method: Optional[str] = None
    watch_location: Optional[str] = None
    watched_with: Optional[str] = None
    is_best_movie: bool = False

    # Movie 필드 (평평하게 - 필드명 변경)
    movie_id: int
    title: str = Field(..., min_length=1, max_length=TITLE_MAX_LENGTH)
    original_title: Optional[str] = Field(None, max_length=TITLE_MAX_LENGTH)
    content_type: str = "movie"
    release_channel: str = "unknown"
    poster: Optional[str] = None  # poster_url → poster
    backdrop: Optional[str] = None  # backdrop_url → backdrop
    year: Optional[int] = None
    runtime: Optional[int] = None
    total_episodes: Optional[int] = None
    genre: Optional[str] = None
    director: Optional[str] = None
    synopsis: Optional[str] = None
    kobis_code: Optional[str] = None
    tmdb_id: Optional[int] = None
    kmdb_id: Optional[str] = None
    tags: List[MovieTagItem] = Field(default_factory=list)

    # 메타데이터
    created_at: datetime
    updated_at: datetime


class MovieSearchResult(BaseModel):
    """외부 API 영화 검색 결과"""
    title: str
    original_title: Optional[str] = None
    content_type: str = Field("movie", pattern="^(movie|series)$")
    release_channel: str = Field("unknown", pattern="^(theatrical|ott_original|tv|unknown)$")
    director: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    year: int = Field(..., ge=PRODUCTION_YEAR_MIN, le=PRODUCTION_YEAR_MAX)
    runtime: Optional[int] = Field(None, ge=0, le=RUNTIME_MAX_MINUTES)
    total_episodes: Optional[int] = Field(None, ge=0, le=10000)
    genre: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    poster_url: Optional[str] = Field(None, max_length=URL_MAX_LENGTH)
    backdrop_url: Optional[str] = Field(None, max_length=URL_MAX_LENGTH)
    synopsis: Optional[str] = Field(None, max_length=SYNOPSIS_MAX_LENGTH)
    kobis_code: Optional[str] = Field(None, max_length=EXTERNAL_ID_MAX_LENGTH)
    tmdb_id: Optional[int] = None
    kmdb_id: Optional[str] = Field(None, max_length=EXTERNAL_ID_MAX_LENGTH)
    source: str  # "kobis", "tmdb", "kmdb"


class MovieMetadata(BaseModel):
    """영화 메타데이터 (외부 API에서 가져온 상세 정보)"""
    title: str = Field(..., min_length=1, max_length=TITLE_MAX_LENGTH)
    original_title: Optional[str] = Field(None, max_length=TITLE_MAX_LENGTH)
    content_type: str = Field("movie", pattern="^(movie|series)$")
    release_channel: str = Field("unknown", pattern="^(theatrical|ott_original|tv|unknown)$")
    director: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    year: Optional[int] = Field(None, ge=PRODUCTION_YEAR_MIN, le=PRODUCTION_YEAR_MAX)
    runtime: Optional[int] = Field(None, ge=0, le=RUNTIME_MAX_MINUTES)
    total_episodes: Optional[int] = Field(None, ge=0, le=10000)
    genre: Optional[str] = Field(None, max_length=SHORT_TEXT_MAX_LENGTH)
    poster_url: Optional[str] = Field(None, max_length=URL_MAX_LENGTH)
    backdrop_url: Optional[str] = Field(None, max_length=URL_MAX_LENGTH)
    synopsis: Optional[str] = Field(None, max_length=SYNOPSIS_MAX_LENGTH)
    kobis_code: Optional[str] = Field(None, max_length=EXTERNAL_ID_MAX_LENGTH)
    tmdb_id: Optional[int] = None
    kmdb_id: Optional[str] = Field(None, max_length=EXTERNAL_ID_MAX_LENGTH)
