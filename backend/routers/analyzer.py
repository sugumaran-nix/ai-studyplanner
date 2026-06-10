"""
/api/analyzer — Weak topic analysis from text or uploaded notes.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeTextRequest, AnalysisResponse
from services.ai_service import analyze_weak_topics

router = APIRouter()


@router.post("/text", response_model=dict)
async def analyze_text(req: AnalyzeTextRequest):
    """Analyze submitted text notes for weak areas and knowledge gaps."""
    if len(req.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Notes too short. Please provide at least 50 characters.")

    try:
        result = await analyze_weak_topics(req.text, req.subject)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return result


@router.get("/history")
async def analysis_history():
    """Return past analysis results for the authenticated user."""
    return {"analyses": [], "message": "DB integration returns real history."}
