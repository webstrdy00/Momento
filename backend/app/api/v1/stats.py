from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract, text
from datetime import datetime, date, timedelta
from typing import List
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.user_movie import UserMovie
from app.models.movie import Movie
from app.models.movie_tag import MovieTag
from app.models.tag import Tag
from app.schemas.stats import (
    StatsOverview, MonthlyStats, GenreStats, TagStats, BestMovie
)

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/", response_model=StatsOverview)
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
        .scalar() or 0
    )

    # Total watched this year
    yearly_watched = (
        db.query(func.count(UserMovie.id))
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
            extract("year", UserMovie.watch_date) == year,
        )
        .scalar() or 0
    )

    # Average rating
    avg_rating = (
        db.query(func.avg(UserMovie.rating))
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
            UserMovie.rating.isnot(None),
        )
        .scalar() or 0
    )

    # Total watch time
    total_watch_time = (
        db.query(func.sum(Movie.runtime))
        .join(UserMovie, UserMovie.movie_id == Movie.id)
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
        )
        .scalar() or 0
    )

    # Calculate streak
    current_streak = await calculate_streak(db, user_id)

    # Yearly goal progress
    yearly_goal = user.yearly_goal if user else 100
    yearly_goal_percentage = (yearly_watched / yearly_goal * 100) if yearly_goal > 0 else 0

    return StatsOverview(
        total_watched=total_watched,
        total_watch_time=int(total_watch_time),
        average_rating=round(float(avg_rating), 2) if avg_rating else 0.0,
        current_streak=current_streak,
        yearly_goal=yearly_goal,
        yearly_progress=yearly_watched,
        yearly_goal_percentage=round(yearly_goal_percentage, 1),
    )


@router.get("/monthly", response_model=List[MonthlyStats])
async def get_monthly_stats(
    months: int = Query(default=6, description="Number of months to fetch"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get monthly viewing statistics

    Returns movie count per month for the last N months
    """
    # Get monthly aggregation
    results = (
        db.query(
            func.to_char(UserMovie.watch_date, 'YYYY-MM').label('month'),
            func.count(UserMovie.id).label('count')
        )
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
            UserMovie.watch_date.isnot(None),
        )
        .group_by(text('month'))
        .order_by(text('month DESC'))
        .limit(months)
        .all()
    )

    return [
        MonthlyStats(month=row.month, count=row.count)
        for row in reversed(results)  # Reverse to show oldest first
    ]


@router.get("/genres", response_model=List[GenreStats])
async def get_genre_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get genre breakdown statistics

    Parses comma-separated genre field from movies
    """
    # Get all completed movies with genres
    movies = (
        db.query(Movie.genre)
        .join(UserMovie, UserMovie.movie_id == Movie.id)
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
            Movie.genre.isnot(None),
        )
        .all()
    )

    # Parse genres (comma-separated)
    genre_count = {}
    for (genre_str,) in movies:
        if genre_str:
            genres = [g.strip() for g in genre_str.split(",")]
            for genre in genres:
                if genre:
                    genre_count[genre] = genre_count.get(genre, 0) + 1

    # Calculate total for percentage
    total = sum(genre_count.values())

    # Sort by count and get top genres
    sorted_genres = sorted(genre_count.items(), key=lambda x: x[1], reverse=True)

    return [
        GenreStats(
            genre=genre,
            count=count,
            percentage=round((count / total * 100), 1) if total > 0 else 0
        )
        for genre, count in sorted_genres
    ]


@router.get("/tags", response_model=List[TagStats])
async def get_tag_stats(
    limit: int = Query(default=10, description="Number of top tags to return"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get most used tags
    """
    # Get tag usage counts
    results = (
        db.query(
            Tag.name,
            func.count(MovieTag.id).label('count')
        )
        .join(MovieTag, MovieTag.tag_id == Tag.id)
        .join(UserMovie, MovieTag.user_movie_id == UserMovie.id)
        .filter(UserMovie.user_id == user_id)
        .group_by(Tag.name)
        .order_by(text('count DESC'))
        .limit(limit)
        .all()
    )

    return [
        TagStats(tag=row.name, count=row.count)
        for row in results
    ]


@router.get("/best-movies", response_model=List[BestMovie])
async def get_best_movies(
    limit: int = Query(default=5, description="Number of best movies to return"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get user's best movies (is_life_movie = true)
    """
    best_movies = (
        db.query(UserMovie)
        .options(joinedload(UserMovie.movie))
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.is_life_movie == True,
        )
        .order_by(UserMovie.rating.desc(), UserMovie.watch_date.desc())
        .limit(limit)
        .all()
    )

    return [
        BestMovie(
            id=um.id,
            title=um.movie.title,
            director=um.movie.director,
            year=um.movie.year,
            poster_url=um.movie.poster_url or "",
            rating=um.rating or 0,
            review=um.review or "",
            watch_date=um.watch_date or date.today(),
        )
        for um in best_movies
    ]


async def calculate_streak(db: Session, user_id: str) -> int:
    """
    Calculate current viewing streak (consecutive days)

    Args:
        db: Database session
        user_id: User ID

    Returns:
        Current streak in days
    """
    # Get all watch dates, sorted descending
    watch_dates = (
        db.query(UserMovie.watch_date)
        .filter(
            UserMovie.user_id == user_id,
            UserMovie.status == "completed",
            UserMovie.watch_date.isnot(None),
        )
        .order_by(UserMovie.watch_date.desc())
        .distinct()
        .all()
    )

    if not watch_dates:
        return 0

    # Convert to list of dates
    dates = [row[0] for row in watch_dates]

    # Check if most recent date is today or yesterday
    today = date.today()
    if dates[0] not in [today, today - timedelta(days=1)]:
        return 0

    # Count consecutive days
    streak = 1
    for i in range(len(dates) - 1):
        diff = (dates[i] - dates[i + 1]).days
        if diff == 1:
            streak += 1
        elif diff == 0:
            # Same day, skip
            continue
        else:
            # Streak broken
            break

    return streak
