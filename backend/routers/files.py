"""
/api/files — PDF/text upload, extraction, and AI analysis.
"""

import os
import uuid
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from core.config import settings
from services.ai_service import analyze_uploaded_file

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pypdf."""
    try:
        import pypdf
        import io
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""


def _extract_text(file_bytes: bytes, content_type: str) -> str:
    if "pdf" in content_type:
        return _extract_text_from_pdf(file_bytes)
    # Plain text / unknown — decode best-effort
    for enc in ("utf-8", "latin-1"):
        try:
            return file_bytes.decode(enc)
        except UnicodeDecodeError:
            continue
    return ""


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a study note (PDF or TXT).
    Returns AI-generated: summary, key topics, weak areas, flashcards.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Use PDF or TXT.",
        )

    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f}MB). Max {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    text = _extract_text(file_bytes, file.content_type or "")
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from file.")

    try:
        analysis = await analyze_uploaded_file(text, file.filename or "document")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    return {
        "file_id":  str(uuid.uuid4()),
        "filename": file.filename,
        "word_count": len(text.split()),
        **analysis,
    }


@router.get("/")
async def list_uploads():
    """List all uploaded files for the authenticated user."""
    return {"uploads": [], "message": "DB integration returns real uploads."}
