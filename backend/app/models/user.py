from sqlalchemy import Column, String, Integer, TIMESTAMP, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(100))
    avatar_url = Column(String)
    yearly_goal = Column(Integer, default=100)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    user_movies = relationship("UserMovie", back_populates="user", cascade="all, delete-orphan")
    user_images = relationship("UserImage", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    custom_tags = relationship("Tag", back_populates="user", cascade="all, delete-orphan")
