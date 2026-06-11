"""
SQLAlchemy async models — mirrors the PostgreSQL schema exactly.
"""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text,
    DateTime, ForeignKey, ARRAY, JSON, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()


def gen_uuid():
    return str(uuid.uuid4())


# ── Enums ─────────────────────────────────────────────────────────────────────

class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class SessionStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    skipped = "skipped"


# ── Users ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(UUID, primary_key=True, default=gen_uuid)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name     = Column(String(120))
    avatar_url    = Column(String(500))
    timezone      = Column(String(60), default="UTC")
    preferences   = Column(JSON, default={})
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    plans         = relationship("StudyPlan",  back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    uploads       = relationship("UploadedFile", back_populates="user", cascade="all, delete-orphan")


# ── Study Plans ───────────────────────────────────────────────────────────────

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id            = Column(UUID, primary_key=True, default=gen_uuid)
    user_id       = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    title         = Column(String(255), nullable=False)
    subjects      = Column(ARRAY(String), nullable=False)   # ["Maths", "Physics"]
    exam_date     = Column(DateTime(timezone=True), nullable=False)
    daily_hours   = Column(Float, nullable=False)
    plan_data     = Column(JSON, nullable=False)             # Generated schedule JSON
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user          = relationship("User", back_populates="plans")
    sessions      = relationship("StudySession", back_populates="plan", cascade="all, delete-orphan")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id            = Column(UUID, primary_key=True, default=gen_uuid)
    plan_id       = Column(UUID, ForeignKey("study_plans.id"), nullable=False, index=True)
    subject       = Column(String(120), nullable=False)
    topic         = Column(String(255), nullable=False)
    scheduled_at  = Column(DateTime(timezone=True), nullable=False)
    duration_min  = Column(Integer, nullable=False)
    difficulty    = Column(SAEnum(DifficultyLevel), default=DifficultyLevel.medium)
    status        = Column(SAEnum(SessionStatus),   default=SessionStatus.pending)
    notes         = Column(Text)
    repetition_no = Column(Integer, default=1)      # Spaced repetition counter
    next_review   = Column(DateTime(timezone=True))

    plan          = relationship("StudyPlan", back_populates="sessions")


# ── AI Chat ───────────────────────────────────────────────────────────────────

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id         = Column(UUID, primary_key=True, default=gen_uuid)
    user_id    = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    title      = Column(String(255), default="New Chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user       = relationship("User", back_populates="chat_sessions")
    messages   = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id         = Column(UUID, primary_key=True, default=gen_uuid)
    session_id = Column(UUID, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role       = Column(String(20), nullable=False)   # "user" | "assistant"
    content    = Column(Text, nullable=False)
    tokens     = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session    = relationship("ChatSession", back_populates="messages")


# ── Uploaded Files ────────────────────────────────────────────────────────────

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id          = Column(UUID, primary_key=True, default=gen_uuid)
    user_id     = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    filename    = Column(String(255), nullable=False)
    file_type   = Column(String(20))      # "pdf" | "txt" | "docx"
    file_size   = Column(Integer)
    storage_key = Column(String(500))     # S3 / Supabase storage path
    analysis    = Column(JSON)            # AI-extracted summary, topics, weak areas
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user        = relationship("User", back_populates="uploads")
