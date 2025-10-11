from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.collection import Collection
from app.models.collection_movie import CollectionMovie

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("/")
async def get_user_collections(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get all collections for the current user with movie count
    """
    collections = (
        db.query(
            Collection,
            func.count(CollectionMovie.id).label("movie_count"),
        )
        .outerjoin(CollectionMovie, Collection.id == CollectionMovie.collection_id)
        .filter(Collection.user_id == user_id)
        .group_by(Collection.id)
        .order_by(Collection.created_at.desc())
        .all()
    )

    result = []
    for collection, movie_count in collections:
        collection_dict = {
            "id": collection.id,
            "name": collection.name,
            "description": collection.description,
            "is_auto": collection.is_auto,
            "auto_rule": collection.auto_rule,
            "movie_count": movie_count,
            "created_at": collection.created_at,
            "updated_at": collection.updated_at,
        }
        result.append(collection_dict)

    return {
        "total": len(result),
        "collections": result,
    }


@router.get("/{collection_id}")
async def get_collection_detail(
    collection_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Get detailed information about a specific collection
    """
    collection = (
        db.query(Collection)
        .filter(Collection.id == collection_id, Collection.user_id == user_id)
        .first()
    )

    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )

    return collection


@router.post("/")
async def create_collection(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Create a new collection

    TODO: Implement with proper request body (Pydantic schema)
    """
    return {
        "message": "Collection created successfully",
        "user_id": user_id,
    }


@router.put("/{collection_id}")
async def update_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Update collection information

    TODO: Implement with proper request body (Pydantic schema)
    """
    collection = (
        db.query(Collection)
        .filter(Collection.id == collection_id, Collection.user_id == user_id)
        .first()
    )

    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )

    return {
        "message": "Collection updated successfully",
        "collection_id": collection_id,
    }


@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Delete a collection
    """
    collection = (
        db.query(Collection)
        .filter(Collection.id == collection_id, Collection.user_id == user_id)
        .first()
    )

    if not collection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collection not found",
        )

    db.delete(collection)
    db.commit()

    return {"message": "Collection deleted successfully"}


@router.post("/{collection_id}/movies/{movie_id}")
async def add_movie_to_collection(
    collection_id: int,
    movie_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Add a movie to a collection

    TODO: Implement full logic
    """
    return {
        "message": "Movie added to collection",
        "collection_id": collection_id,
        "movie_id": movie_id,
    }


@router.delete("/{collection_id}/movies/{movie_id}")
async def remove_movie_from_collection(
    collection_id: int,
    movie_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Remove a movie from a collection

    TODO: Implement full logic
    """
    return {
        "message": "Movie removed from collection",
        "collection_id": collection_id,
        "movie_id": movie_id,
    }
