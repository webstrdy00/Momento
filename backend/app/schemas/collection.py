"""
Collection Pydantic schemas
컬렉션 관련 스키마
"""
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

if TYPE_CHECKING:
    from .movie import MovieResponse


class CollectionBase(BaseModel):
    """Collection 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    is_auto: bool = False  # True: 자동 수집, False: 수동 수집
    cover_image_url: Optional[str] = Field(None, max_length=500)
    auto_rules: Optional[dict] = None  # JSONB - 자동 수집 규칙

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("컬렉션 이름은 공백만 입력할 수 없습니다.")
        return stripped


class CollectionCreate(CollectionBase):
    """Collection 생성 스키마"""
    pass


class CollectionUpdate(BaseModel):
    """Collection 업데이트 스키마"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    cover_image_url: Optional[str] = Field(None, max_length=500)
    auto_rules: Optional[dict] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        stripped = value.strip()
        if not stripped:
            raise ValueError("컬렉션 이름은 공백만 입력할 수 없습니다.")
        return stripped


class CollectionResponse(CollectionBase):
    """Collection 응답 스키마"""
    id: int
    user_id: UUID
    movie_count: int  # 영화 개수 (JOIN으로 계산)
    preview_posters: List[str] = []  # 최대 3개 포스터 URL (홈 화면 미리보기용)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SimpleMovieInCollection(BaseModel):
    """컬렉션 내 영화 간소화 스키마 (Frontend 호환)"""
    id: int  # UserMovie ID
    title: str
    poster_url: Optional[str] = None
    rating: Optional[float] = None
    year: Optional[int] = None
    status: Optional[str] = None
    content_type: str = "movie"
    release_channel: str = "unknown"


class CollectionWithMovies(CollectionResponse):
    """Collection with movies 응답 스키마"""
    movies: List[SimpleMovieInCollection]
