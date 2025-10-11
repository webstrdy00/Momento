from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user_movie import UserMovie
from app.models.movie import Movie

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/")
async def get_user_movies(
    status_filter: Optional[str] = Query(None, description="Filter by status: wishlist, watching, completed"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get user's movie library

    Query Parameters:
    - status: Filter by movie status (wishlist, watching, completed)
    """
    query = db.query(UserMovie).filter(UserMovie.user_id == user_id)

    if status_filter:
        query = query.filter(UserMovie.status == status_filter)

    user_movies = query.order_by(UserMovie.created_at.desc()).all()

    return {
        "total": len(user_movies),
        "movies": user_movies,
    }


@router.get("/{movie_id}")
async def get_movie_detail(
    movie_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get detailed information about a specific movie
    """
    user_movie = (
        db.query(UserMovie)
        .filter(UserMovie.user_id == user_id, UserMovie.id == movie_id)
        .first()
    )

    if not user_movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in your library",
        )

    return user_movie


@router.post("/")
async def add_movie(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Add a movie to user's library

    TODO: Implement with proper request body (Pydantic schema)
    """
    # Placeholder implementation
    return {
        "message": "Movie added successfully",
        "user_id": user_id,
    }


@router.put("/{movie_id}")
async def update_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Update movie information (rating, review, status, etc.)

    TODO: Implement with proper request body (Pydantic schema)
    """
    user_movie = (
        db.query(UserMovie)
        .filter(UserMovie.user_id == user_id, UserMovie.id == movie_id)
        .first()
    )

    if not user_movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in your library",
        )

    return {
        "message": "Movie updated successfully",
        "movie_id": movie_id,
    }


@router.delete("/{movie_id}")
async def delete_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Remove a movie from user's library
    """
    user_movie = (
        db.query(UserMovie)
        .filter(UserMovie.user_id == user_id, UserMovie.id == movie_id)
        .first()
    )

    if not user_movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in your library",
        )

    db.delete(user_movie)
    db.commit()

    return {"message": "Movie deleted successfully"}


@router.get("/search")
async def search_movies(
    q: str = Query(..., description="Search query"),
    user_id: str = Depends(get_current_user),
):
    """
    Search movies from external APIs (KOBIS, TMDb, KMDb)

    TODO: Implement external API integration
    """
    return {
        "message": "Search functionality coming soon",
        "query": q,
    }
