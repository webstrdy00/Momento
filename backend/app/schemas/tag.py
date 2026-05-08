"""
Tag Pydantic schemas
태그 관련 스키마
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


def _normalize_tag_name(value: str) -> str:
    stripped = value.strip()
    if not stripped:
        raise ValueError("태그 이름은 공백만 입력할 수 없습니다.")
    return stripped


class TagBase(BaseModel):
    """Tag 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=50)


class TagCreate(BaseModel):
    """Tag 생성 스키마"""
    name: str = Field(..., min_length=1, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return _normalize_tag_name(value)


class TagUpdate(BaseModel):
    """Tag 업데이트 스키마"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return _normalize_tag_name(value)


class TagResponse(TagBase):
    """Tag 응답 스키마"""
    id: int
    is_predefined: bool
    user_id: Optional[UUID] = None  # custom tag has user_id, predefined tag is None
    created_at: datetime

    class Config:
        from_attributes = True


class TagWithCount(TagResponse):
    """태그 사용 횟수 포함"""
    count: int
