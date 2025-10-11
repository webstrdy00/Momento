"""
Redis 캐싱 서비스
JWKS, 외부 API 응답 캐싱
"""
import json
from typing import Optional
import redis.asyncio as redis
from app.config import settings


class RedisService:
    """Redis 캐싱 서비스"""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None

    async def connect(self):
        """Redis 연결"""
        if not self.redis_client:
            self.redis_client = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )

    async def disconnect(self):
        """Redis 연결 종료"""
        if self.redis_client:
            await self.redis_client.close()

    async def get(self, key: str) -> Optional[str]:
        """
        캐시에서 값 가져오기

        Args:
            key: 캐시 키

        Returns:
            캐시된 값 (없으면 None)
        """
        if not self.redis_client:
            await self.connect()

        return await self.redis_client.get(key)

    async def set(self, key: str, value: str, ttl: int = 3600):
        """
        캐시에 값 저장

        Args:
            key: 캐시 키
            value: 저장할 값
            ttl: Time To Live (초 단위, default: 3600 = 1시간)
        """
        if not self.redis_client:
            await self.connect()

        await self.redis_client.set(key, value, ex=ttl)

    async def delete(self, key: str):
        """
        캐시에서 값 삭제

        Args:
            key: 캐시 키
        """
        if not self.redis_client:
            await self.connect()

        await self.redis_client.delete(key)

    async def get_json(self, key: str) -> Optional[dict]:
        """
        JSON 형식으로 캐시 가져오기

        Args:
            key: 캐시 키

        Returns:
            dict 형식의 캐시 (없으면 None)
        """
        value = await self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return None
        return None

    async def set_json(self, key: str, value: dict, ttl: int = 3600):
        """
        JSON 형식으로 캐시 저장

        Args:
            key: 캐시 키
            value: dict 형식의 값
            ttl: Time To Live (초 단위)
        """
        json_str = json.dumps(value, ensure_ascii=False)
        await self.set(key, json_str, ttl)


# Singleton instance
redis_service = RedisService()


async def get_redis_service() -> RedisService:
    """
    Redis 서비스 인스턴스 가져오기 (Dependency)
    """
    if not redis_service.redis_client:
        await redis_service.connect()
    return redis_service
