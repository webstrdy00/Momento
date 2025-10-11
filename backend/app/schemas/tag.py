"""
Tag Pydantic schemas
태그 관련 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TagBase(BaseModel):
    """Tag 기본 스키마"""
    name: str
    type: str  # "predefined" or "custom"


class TagCreate(TagBase):
    """Tag 생성 스키마"""
    pass


class TagUpdate(BaseModel):
    """Tag 업데이트 스키마"""
    name: Optional[str] = None


class TagResponse(TagBase):
    """Tag 응답 스키마"""
    id: int
    user_id: Optional[str] = None  # custom tag has user_id, predefined tag is None
    created_at: datetime

    class Config:
        from_attributes = True


class TagWithCount(TagResponse):
    """태그와 사용 횟수"""
    count: int
