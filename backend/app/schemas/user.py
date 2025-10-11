"""
User Pydantic schemas
사용자 관련 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """User 기본 스키마"""
    email: EmailStr
    username: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """User 생성 스키마 (Supabase Auth에서 자동 생성)"""
    pass


class UserUpdate(BaseModel):
    """User 업데이트 스키마"""
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    yearly_goal: Optional[int] = None


class UserResponse(UserBase):
    """User 응답 스키마"""
    id: str  # UUID from Supabase
    yearly_goal: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
