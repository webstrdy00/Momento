"""
Stats Pydantic schemas
통계 관련 스키마
"""
from datetime import date
from pydantic import BaseModel


class StatsOverview(BaseModel):
    """전체 통계 개요"""
    total_watched: int
    total_watch_time: int  # minutes
    average_rating: float
    current_streak: int  # days
    yearly_goal: int
    yearly_progress: int  # 올해 본 영화 수
    yearly_goal_percentage: float


class MonthlyStats(BaseModel):
    """월별 통계"""
    month: str  # "2025-01"
    count: int


class GenreStats(BaseModel):
    """장르 통계"""
    genre: str
    count: int
    percentage: float


class TagStats(BaseModel):
    """태그 통계"""
    tag: str
    count: int


class BestMovie(BaseModel):
    """인생 영화"""
    id: int
    title: str
    director: str
    year: int
    poster_url: str
    rating: int
    review: str
    watch_date: date

    class Config:
        from_attributes = True
