"""
/api/planner — AI study plan generation endpoint.
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from models.schemas import PlannerRequest, StudyPlanResponse
from services.ai_service import generate_study_plan

router = APIRouter()


@router.post("/generate", response_model=dict)
async def generate_plan(req: PlannerRequest):
    """
    Generate a personalized AI study plan.
    In production: verify JWT, save plan to DB, return plan_id.
    """
    now = datetime.now(timezone.utc)
    exam_dt = req.exam_date
    if exam_dt.tzinfo is None:
        exam_dt = exam_dt.replace(tzinfo=timezone.utc)

    days_until = (exam_dt - now).days
    if days_until < 1:
        raise HTTPException(status_code=400, detail="Exam date must be in the future.")
    if days_until > 365:
        raise HTTPException(status_code=400, detail="Exam must be within 1 year.")

    try:
        plan_data = await generate_study_plan(
            subjects=req.subjects,
            exam_date=exam_dt.strftime("%Y-%m-%d"),
            daily_hours=req.daily_hours,
            weak_subjects=req.weak_subjects or [],
            difficulty=req.difficulty_preference or "balanced",
            days_until_exam=days_until,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return {
        "plan_id": str(uuid.uuid4()),
        "days_until_exam": days_until,
        **plan_data,
    }


@router.get("/plans")
async def list_plans():
    """List all study plans for the authenticated user. (DB query in production)"""
    return {"plans": [], "message": "Connect auth + DB to list real plans."}


@router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: str):
    """Delete a study plan by ID."""
    return {"deleted": plan_id}
