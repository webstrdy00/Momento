from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.user_movie import UserMovie
from app.models.movie import Movie

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/")
async def get_user_stats(
    year: int = Query(default=datetime.now().year, description="Year for statistics"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get overall statistics for the user

    Returns:
    - Total watched movies
    - Average rating
    - Total watch time (minutes)
    - Current streak
    - Yearly goal progress
    """
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()

    # Total watched movies
    total_watched = (
        db.query(func.count(UserMovie.id))
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
        )
        .scalar()
    )

    # Total watched this year
    yearly_watched = (
        db.query(func.count(UserMovie.id))
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
            extract("year", UserMovie.watch_date) == year,
        )
        .scalar()
    )

    # Average rating
    avg_rating = (
        db.query(func.avg(UserMovie.rating))
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
            UserMovie.rating.isnot(None),
        )
        .scalar()
    )

    # Total watch time
    total_watch_time = (
        db.query(func.sum(Movie.runtime))
        .join(UserMovie, UserMovie.movie_id == Movie.id)
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
        )
        .scalar()
    )

    # Yearly goal progress
    yearly_goal_percentage = 0
    if user and user.yearly_goal:
        yearly_goal_percentage = (yearly_watched / user.yearly_goal) * 100

    return {
        "total_watched": total_watched or 0,
        "yearly_watched": yearly_watched or 0,
        "yearly_goal": user.yearly_goal if user else 100,
        "yearly_goal_percentage": round(yearly_goal_percentage, 1),
        "average_rating": round(float(avg_rating), 1) if avg_rating else 0,
        "total_watch_time_minutes": total_watch_time or 0,
        "total_watch_time_hours": round((total_watch_time or 0) / 60, 1),
        "current_streak": 0,  # TODO: Implement streak calculation
    }


@router.get("/monthly")
async def get_monthly_stats(
    months: int = Query(default=6, description="Number of months to fetch"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get monthly viewing statistics

    Returns movie count per month for the last N months
    """
    # TODO: Implement proper monthly aggregation query
    return {
        "months": months,
        "data": [
            {"month": "2025-01", "count": 5},
            {"month": "2025-02", "count": 8},
            {"month": "2025-03", "count": 6},
            {"month": "2025-04", "count": 10},
            {"month": "2025-05", "count": 7},
            {"month": "2025-06", "count": 12},
        ],
    }


@router.get("/genres")
async def get_genre_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get genre breakdown statistics

    TODO: Implement proper genre aggregation
    (need to parse comma-separated genre field)
    """
    return {
        "genres": [
            {"genre": "드라마", "count": 25},
            {"genre": "액션", "count": 18},
            {"genre": "코미디", "count": 15},
            {"genre": "스릴러", "count": 12},
            {"genre": "로맨스", "count": 10},
        ],
    }


@router.get("/tags")
async def get_tag_stats(
    limit: int = Query(default=10, description="Number of top tags to return"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get most used tags

    TODO: Implement proper tag aggregation query
    """
    return {
        "top_tags": [
            {"tag": "명작", "count": 15},
            {"tag": "감동", "count": 12},
            {"tag": "여운", "count": 10},
            {"tag": "재관람", "count": 8},
            {"tag": "추천", "count": 7},
        ],
    }


@router.get("/best-movies")
async def get_best_movies(
    limit: int = Query(default=5, description="Number of best movies to return"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get user's best movies (is_best_movie = true)
    """
    best_movies = (
        db.query(UserMovie)
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.is_best_movie == True,
        )
        .order_by(UserMovie.rating.desc(), UserMovie.watch_date.desc())
        .limit(limit)
        .all()
    )

    return {
        "total": len(best_movies),
        "best_movies": best_movies,
    }
