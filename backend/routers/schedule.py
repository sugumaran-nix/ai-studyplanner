"""
/api/schedule — Smart scheduling, today's sessions, spaced repetition.
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from models.schemas import ScheduleUpdateRequest

router = APIRouter()


@router.get("/today")
async def get_today_schedule():
    """Return today's study sessions for the authenticated user."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    # In production: query DB for sessions where scheduled_at::date = today
    return {
        "date": today,
        "sessions": [],
        "completed_count": 0,
        "total_count": 0,
        "streak_days": 0,
        "message": "Connect DB + auth to return real schedule.",
    }


@router.patch("/sessions/{session_id}")
async def update_session(session_id: str, req: ScheduleUpdateRequest):
    """Mark a session as completed or skipped. Triggers spaced repetition recalculation."""
    if req.status not in ("completed", "skipped"):
        raise HTTPException(status_code=400, detail="Status must be 'completed' or 'skipped'.")

    next_review = None
    if req.status == "completed":
        # Simple SM-2-inspired intervals: 1, 3, 7, 14, 30 days
        intervals = [1, 3, 7, 14, 30]
        # In production: look up repetition_no from DB and pick interval
        next_review = (datetime.now(timezone.utc) + timedelta(days=intervals[0])).isoformat()

    return {
        "session_id": session_id,
        "status": req.status,
        "next_review": next_review,
        "message": "Session updated. DB write happens here in production.",
    }


@router.get("/upcoming")
async def upcoming_sessions(days: int = 7):
    """Return upcoming sessions for the next N days."""
    if days > 30:
        raise HTTPException(status_code=400, detail="Max 30 days lookahead.")
    return {"sessions": [], "days": days}
