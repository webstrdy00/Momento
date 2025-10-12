from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import jwt
import json
from typing import Dict, Any
from app.config import settings
from app.services.redis_service import redis_service

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    """
    Validate Supabase JWT token and return user_id

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        user_id (str): Supabase user ID (UUID)

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials

    try:
        # Fetch JWKS from Supabase (should be cached in production)
        jwks = await fetch_supabase_jwks()

        # Decode and verify JWT
        payload = jwt.decode(
            token,
            jwks,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
        )

        # Extract user_id from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )


async def fetch_supabase_jwks() -> Dict[str, Any]:
    """
    Fetch JWKS (JSON Web Key Set) from Supabase

    Uses Redis caching for performance (1 hour cache)

    Returns:
        JWKS dictionary
    """
    cache_key = "supabase_jwks"

    # Try to get from cache
    cached_jwks = await redis_service.get(cache_key)
    if cached_jwks:
        return json.loads(cached_jwks)

    # Fetch from Supabase
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(settings.SUPABASE_JWKS_URL)
            response.raise_for_status()
            jwks = response.json()

            # Cache for 1 hour (3600 seconds)
            await redis_service.set(cache_key, json.dumps(jwks), ttl=3600)

            return jwks

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch JWKS from Supabase: {str(e)}",
        )


# Optional security for routes that allow optional authentication
security_optional = HTTPBearer(auto_error=False)


# Alias for consistency (get_current_user_id is the same as get_current_user)
get_current_user_id = get_current_user


# Optional: Dependency for routes that allow optional authentication
async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Security(security_optional),
) -> str | None:
    """
    Get current user if token is provided, otherwise return None

    Useful for routes that work with or without authentication
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
