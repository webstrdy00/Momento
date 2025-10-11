from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import jwt
from typing import Dict, Any
from app.config import settings

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

    In production, this should be cached in Redis for performance

    Returns:
        JWKS dictionary
    """
    # TODO: Add Redis caching for JWKS (cache for 1 hour)
    # Example:
    # cached_jwks = await redis_client.get("supabase_jwks")
    # if cached_jwks:
    #     return json.loads(cached_jwks)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(settings.SUPABASE_JWKS_URL)
            response.raise_for_status()
            jwks = response.json()

            # TODO: Cache in Redis
            # await redis_client.setex("supabase_jwks", 3600, json.dumps(jwks))

            return jwks

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch JWKS from Supabase: {str(e)}",
        )


# Optional security for routes that allow optional authentication
security_optional = HTTPBearer(auto_error=False)


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
