"""
Pydantic v2 schemas for request validation & API response shapes.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str


# ── Study Planner ─────────────────────────────────────────────────────────────

class PlannerRequest(BaseModel):
    subjects: List[str] = Field(min_length=1)
    exam_date: datetime
    daily_hours: float = Field(gt=0, le=16)
    difficulty_preference: Optional[str] = "balanced"  # "light" | "balanced" | "intensive"
    weak_subjects: Optional[List[str]] = []

class TopicBreakdown(BaseModel):
    topic: str
    estimated_hours: float
    priority: str       # "high" | "medium" | "low"
    repetitions: int

class DayPlan(BaseModel):
    date: str
    sessions: List[Dict[str, Any]]
    total_hours: float

class StudyPlanResponse(BaseModel):
    plan_id: str
    title: str
    total_days: int
    total_hours: float
    daily_schedule: List[DayPlan]
    topic_breakdown: List[TopicBreakdown]
    revision_schedule: List[Dict[str, Any]]
    tips: List[str]


# ── Weak Topic Analyzer ───────────────────────────────────────────────────────

class AnalyzeTextRequest(BaseModel):
    text: str = Field(min_length=50)
    subject: Optional[str] = None

class WeakTopic(BaseModel):
    topic: str
    confidence_score: float   # 0-1, lower = weaker
    priority: str             # "critical" | "needs_work" | "review"
    suggestions: List[str]

class AnalysisResponse(BaseModel):
    subject: Optional[str]
    weak_topics: List[WeakTopic]
    strong_topics: List[str]
    overall_readiness: float   # 0-100 percent
    improvement_plan: List[str]
    estimated_review_hours: float


# ── AI Chat ───────────────────────────────────────────────────────────────────

class ChatMode(str, Enum):
    explain   = "explain"
    summarize = "summarize"
    tips      = "tips"
    general   = "general"

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(min_length=1)
    mode: ChatMode = ChatMode.general
    context: Optional[str] = None    # Optional subject context

class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    mode: str
    tokens_used: int


# ── Schedule ──────────────────────────────────────────────────────────────────

class ScheduleUpdateRequest(BaseModel):
    # BUG FIX: removed duplicate session_id — it is already the path parameter
    # in PATCH /sessions/{session_id}. Having it in body AND path caused FastAPI
    # to require it twice, breaking client requests.
    status: str   # "completed" | "skipped"
    notes: Optional[str] = None

class TodayScheduleResponse(BaseModel):
    date: str
    sessions: List[Dict[str, Any]]
    completed_count: int
    total_count: int
    streak_days: int


# ── File Upload ───────────────────────────────────────────────────────────────

class FileAnalysisResponse(BaseModel):
    file_id: str
    filename: str
    summary: str
    key_topics: List[str]
    weak_areas: List[str]
    flashcard_suggestions: List[Dict[str, str]]   # [{question, answer}]
    word_count: int
