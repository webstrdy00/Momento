from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user_movie import UserMovie
from app.models.movie import Movie
from app.models.movie_tag import MovieTag
from app.models.tag import Tag
from app.schemas.movie import (
    UserMovieCreate, UserMovieUpdate, UserMovieResponse, FlatMovieResponse,
    MovieCreate, MovieResponse, MovieSearchResult, MovieMetadata
)
from app.schemas.common import BaseResponse
from app.services.external_api_service import external_api_service
from app.services.auto_collection_service import auto_collection_service

router = APIRouter(prefix="/movies", tags=["movies"])


def build_tag_items(user_movie: UserMovie) -> list[dict]:
    """UserMovie 관계에서 태그 요약 목록을 생성."""
    if not getattr(user_movie, "movie_tags", None):
        return []
    return [
        {"id": mt.tag.id, "name": mt.tag.name}
        for mt in user_movie.movie_tags
        if mt.tag is not None
    ]


def build_flat_movie_response(user_movie: UserMovie) -> FlatMovieResponse:
    """UserMovie + Movie 관계를 프론트엔드 호환 flat 응답으로 변환."""
    movie = user_movie.movie
    return FlatMovieResponse(
        # UserMovie 필드
        id=user_movie.id,
        user_id=user_movie.user_id,
        status=normalize_status_output(user_movie.status),
        rating=float(user_movie.rating) if user_movie.rating is not None else None,
        review=user_movie.one_line_review,
        watch_date=user_movie.watch_date,
        progress=user_movie.progress,
        current_season=user_movie.current_season,
        current_episode=user_movie.current_episode,
        watch_method=user_movie.watch_method,
        watch_location=user_movie.watch_location,
        watched_with=user_movie.watched_with,
        is_best_movie=user_movie.is_best_movie,

        # Movie 필드 (평평하게 + 필드명 변경)
        movie_id=movie.id,
        title=movie.title,
        original_title=movie.original_title,
        content_type=movie.content_type,
        release_channel=movie.release_channel or "unknown",
        poster=movie.poster_url,
        backdrop=movie.backdrop_url,
        year=movie.year,
        runtime=movie.runtime,
        total_episodes=movie.total_episodes,
        genre=movie.genre,
        director=movie.director,
        synopsis=movie.synopsis,
        kobis_code=movie.kobis_code,
        tmdb_id=movie.tmdb_id,
        kmdb_id=movie.kmdb_id,
        tags=build_tag_items(user_movie),

        # 메타데이터
        created_at=user_movie.created_at,
        updated_at=user_movie.updated_at,
    )


def normalize_status_input(status: Optional[str]) -> Optional[str]:
    """레거시 상태값(wishlist)을 watchlist로 정규화."""
    if status in ("wishlist", "watchlist"):
        return "watchlist"
    return status


def normalize_status_output(status: Optional[str]) -> Optional[str]:
    """응답 상태값은 watchlist로 통일."""
    if status in ("wishlist", "watchlist"):
        return "watchlist"
    return status


def parse_external_numeric_id(raw_id: str, source: str) -> int:
    try:
        return int(raw_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{source} ID는 숫자여야 합니다.",
        )


@router.get("/", response_model=BaseResponse[List[FlatMovieResponse]])
async def get_user_movies(
    status: Optional[str] = Query(None, description="Filter by status: watchlist, watching, completed"),
    content_type: Optional[str] = Query(None, description="Filter by content type: movie, series"),
    release_channel: Optional[str] = Query(None, description="Filter by release channel: theatrical, ott_original, tv, unknown"),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get user's movie library (flat structure for Frontend compatibility)

    Query Parameters:
    - status: Filter by movie status (watchlist, watching, completed)
    - content_type: Filter by content type (movie, series)
    - release_channel: Filter by release channel (theatrical, ott_original, tv, unknown)
    """
    query = db.query(UserMovie).options(joinedload(UserMovie.movie)).filter(UserMovie.user_id == user_id)

    if status:
        normalized_status = normalize_status_input(status)
        if normalized_status == "watchlist":
            query = query.filter(UserMovie.status.in_(["watchlist", "wishlist"]))
        else:
            query = query.filter(UserMovie.status == normalized_status)

    if content_type or release_channel:
        query = query.join(Movie)

    if content_type:
        query = query.filter(Movie.movie_type == content_type)

    if release_channel:
        query = query.filter(Movie.release_channel == release_channel)

    user_movies = query.order_by(UserMovie.updated_at.desc(), UserMovie.created_at.desc()).all()

    result = [build_flat_movie_response(um) for um in user_movies]

    return BaseResponse(
        success=True,
        message="Movies retrieved successfully",
        data=result
    )


@router.get("/search", response_model=BaseResponse[List[MovieSearchResult]])
async def search_movies(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    user_id: str = Depends(get_current_user),
):
    """
    Search movies from external APIs (KOBIS, TMDb, KMDb)

    Query Parameters:
    - q: Search query (movie title)

    Returns:
    - List of movie search results from multiple sources (KOBIS, TMDb, KMDb)
    """
    results = await external_api_service.search_movies(q)
    return BaseResponse(
        success=True,
        message="Search completed successfully",
        data=results
    )


@router.get("/{user_movie_id}", response_model=BaseResponse[FlatMovieResponse])
async def get_movie_detail(
    user_movie_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get detailed information about a specific movie (flat structure for Frontend compatibility)
    """
    user_movie = (
        db.query(UserMovie)
        .options(
            joinedload(UserMovie.movie),
            joinedload(UserMovie.movie_tags).joinedload(MovieTag.tag),
        )
        .filter(UserMovie.user_id == user_id, UserMovie.id == user_movie_id)
        .first()
    )

    if not user_movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in your library",
        )

    movie_data = build_flat_movie_response(user_movie)

    return BaseResponse(
        success=True,
        message="Movie retrieved successfully",
        data=movie_data
    )


@router.post("/", response_model=BaseResponse[FlatMovieResponse], status_code=status.HTTP_201_CREATED)
async def add_movie(
    user_movie_data: UserMovieCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Add a movie to user's library (flat structure for Frontend compatibility)

    Request Body:
    - movie_id: ID of the movie (must exist in movies table)
    - status: "wishlist", "watching", or "completed"
    - rating: 0-5 (0.5 단위, optional)
    - one_line_review: Review text (optional)
    - watch_date: Date watched (optional)
    - progress: Minutes watched (optional, for "watching" status)
    - is_best_movie: Mark as best movie (default: false)
    """
    # Check if movie exists
    movie = db.query(Movie).filter(Movie.id == user_movie_data.movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found. Please add movie metadata first.",
        )

    # Check if user already added this movie
    existing = db.query(UserMovie).filter(
        UserMovie.user_id == user_id,
        UserMovie.movie_id == user_movie_data.movie_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie already exists in your library",
        )

    payload = user_movie_data.model_dump()
    payload["status"] = normalize_status_input(payload.get("status"))
    if payload.get("status") == "completed" and payload.get("watch_date") is None:
        payload["watch_date"] = date.today()

    # Create user movie
    user_movie = UserMovie(
        user_id=user_id,
        **payload
    )

    db.add(user_movie)
    db.commit()
    db.refresh(user_movie)

    # Load movie relationship
    user_movie = (
        db.query(UserMovie)
        .options(
            joinedload(UserMovie.movie),
            joinedload(UserMovie.movie_tags).joinedload(MovieTag.tag),
        )
        .filter(UserMovie.id == user_movie.id)
        .first()
    )

    movie_data = build_flat_movie_response(user_movie)

    # 자동 컬렉션 동기화
    try:
        auto_collection_service.sync_all_for_user(user_id, db)
    except Exception:
        pass

    return BaseResponse(
        success=True,
        message="Movie added successfully",
        data=movie_data
    )


@router.put("/{user_movie_id}", response_model=BaseResponse[FlatMovieResponse])
async def update_movie(
    user_movie_id: int,
    update_data: UserMovieUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Update movie information (rating, review, status, etc.) - flat structure for Frontend compatibility

    Request Body:
    - status: "wishlist", "watching", or "completed" (optional)
    - rating: 0-5 (0.5 단위, optional)
    - one_line_review: Review text (optional)
    - watch_date: Date watched (optional)
    - progress: Minutes watched (optional)
    - is_best_movie: Mark as best movie (optional)
    """
    user_movie = (
        db.query(UserMovie)
        .filter(UserMovie.user_id == user_id, UserMovie.id == user_movie_id)
        .first()
    )

    if not user_movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in your library",
        )

    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)
    if "status" in update_dict:
        update_dict["status"] = normalize_status_input(update_dict["status"])
    next_status = update_dict.get("status", user_movie.status)
    if next_status == "completed" and "watch_date" not in update_dict and user_movie.watch_date is None:
        update_dict["watch_date"] = date.today()

    # genre, runtime, 작품 형식/공개 방식은 Movie 테이블에 저장
    movie_updates = {}
    if "genre" in update_dict:
        movie_updates["genre"] = update_dict.pop("genre")
    if "runtime" in update_dict:
        movie_updates["runtime"] = update_dict.pop("runtime")
    if "content_type" in update_dict:
        movie_updates["movie_type"] = update_dict.pop("content_type")
    if "release_channel" in update_dict:
        movie_updates["release_channel"] = update_dict.pop("release_channel")
    if "total_episodes" in update_dict:
        movie_updates["total_episodes"] = update_dict.pop("total_episodes")
    if movie_updates:
        shared_by_other_users = (
            db.query(func.count(UserMovie.id))
            .filter(
                UserMovie.movie_id == user_movie.movie_id,
                UserMovie.user_id != user_id,
            )
            .scalar()
            or 0
        )
        if shared_by_other_users > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="다른 사용자도 저장한 작품의 공통 메타데이터는 수정할 수 없습니다.",
            )

        movie = db.query(Movie).filter(Movie.id == user_movie.movie_id).first()
        if movie:
            for field, value in movie_updates.items():
                setattr(movie, field, value)

    for field, value in update_dict.items():
        setattr(user_movie, field, value)

    db.commit()
    db.refresh(user_movie)

    # Load movie relationship
    user_movie = (
        db.query(UserMovie)
        .options(
            joinedload(UserMovie.movie),
            joinedload(UserMovie.movie_tags).joinedload(MovieTag.tag),
        )
        .filter(UserMovie.id == user_movie.id)
        .first()
    )

    movie_data = build_flat_movie_response(user_movie)

    # 자동 컬렉션 동기화
    try:
        auto_collection_service.sync_all_for_user(user_id, db)
    except Exception:
        pass

    return BaseResponse(
        success=True,
        message="Movie updated successfully",
        data=movie_data
    )


@router.delete("/{user_movie_id}", response_model=BaseResponse[dict])
async def delete_movie(
    user_movie_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Remove a movie from user's library
    """
    user_movie = (
        db.query(UserMovie)
        .filter(UserMovie.user_id == user_id, UserMovie.id == user_movie_id)
        .first()
    )

    if not user_movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found in your library",
        )

    db.delete(user_movie)
    db.commit()

    # 자동 컬렉션 동기화
    try:
        auto_collection_service.sync_all_for_user(user_id, db)
    except Exception:
        pass

    return BaseResponse(
        success=True,
        message="Movie deleted successfully",
        data={"user_movie_id": user_movie_id}
    )


@router.get("/metadata/{source}/{id}", response_model=BaseResponse[MovieMetadata])
async def get_movie_metadata(
    source: str = Path(..., pattern="^(kobis|tmdb|tmdb_tv)$", description="Source: 'kobis', 'tmdb', or 'tmdb_tv'"),
    id: str = Path(..., min_length=1, max_length=100, description="Movie ID (kobis_code or tmdb_id)"),
    user_id: str = Depends(get_current_user),
):
    """
    Get detailed movie metadata from external API

    Path Parameters:
    - source: "kobis", "tmdb", or "tmdb_tv"
    - id: Movie ID (KOBIS code or TMDb ID)

    Returns:
    - Detailed movie metadata
    """
    if source == "tmdb":
        metadata = await external_api_service.get_tmdb_metadata(parse_external_numeric_id(id, "TMDb"))
    elif source == "tmdb_tv":
        metadata = await external_api_service.get_tmdb_tv_metadata(parse_external_numeric_id(id, "TMDb TV"))
    elif source == "kobis":
        metadata = await external_api_service.get_kobis_metadata(id)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid source. Must be 'kobis', 'tmdb', or 'tmdb_tv'"
        )

    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie metadata not found"
        )

    return BaseResponse(
        success=True,
        message="Movie metadata fetched successfully",
        data=metadata,
    )


@router.post("/metadata/merge", response_model=BaseResponse[MovieMetadata])
async def merge_movie_metadata(
    search_result: MovieSearchResult,
    user_id: str = Depends(get_current_user),
):
    """
    Merge a search result with available source-specific detail metadata.

    Request Body:
    - search_result: Search result item with available external IDs

    Returns:
    - Canonical merged movie metadata for editor/save flow
    """
    metadata = await external_api_service.build_canonical_metadata_from_search_result(search_result)

    return BaseResponse(
        success=True,
        message="Movie metadata merged successfully",
        data=metadata,
    )


@router.post("/from-metadata", response_model=BaseResponse[MovieResponse], status_code=status.HTTP_201_CREATED)
async def create_movie_from_metadata(
    metadata: MovieMetadata,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Create a new movie in the database from metadata

    Request Body:
    - metadata: MovieMetadata from external API
      - title → title_ko
      - original_title → title_original
      - year → production_year

    Returns:
    - Created movie (returns existing if already in DB)
    """
    # Check if movie already exists by external IDs (tmdb/kobis/kmdb)
    existing = None
    duplicate_filters = []

    if metadata.tmdb_id is not None:
        duplicate_filters.append(and_(Movie.tmdb_id == metadata.tmdb_id, Movie.movie_type == metadata.content_type))
    if metadata.kobis_code:
        duplicate_filters.append(Movie.kobis_code == metadata.kobis_code)
    if metadata.kmdb_id:
        duplicate_filters.append(Movie.kmdb_id == metadata.kmdb_id)

    if duplicate_filters:
        existing = db.query(Movie).filter(or_(*duplicate_filters)).first()

    if existing:
        return BaseResponse(
            success=True,
            message="Movie already exists",
            data=existing
        )

    # Create new movie with field mapping
    # MovieMetadata 필드 → Movie 모델 필드 매핑
    movie = Movie(
        title_ko=metadata.title,
        title_original=metadata.original_title,
        movie_type=metadata.content_type,
        release_channel=metadata.release_channel,
        production_year=metadata.year if metadata.year else None,
        director=metadata.director,
        runtime=metadata.runtime,
        total_episodes=metadata.total_episodes,
        genre=metadata.genre,
        poster_url=metadata.poster_url,
        backdrop_url=metadata.backdrop_url,
        synopsis=metadata.synopsis,
        kobis_code=metadata.kobis_code,
        tmdb_id=metadata.tmdb_id,
        kmdb_id=metadata.kmdb_id,
    )

    db.add(movie)
    db.commit()
    db.refresh(movie)

    return BaseResponse(
        success=True,
        message="Movie created successfully",
        data=movie
    )
