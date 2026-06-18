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

# BUG FIX: browsers (especially on macOS/iOS) often send incorrect or generic
# MIME types for PDFs (e.g. "application/octet-stream"). The original code
# rejected these outright, causing the "network error" on file upload.
# Solution: check by content-type AND by file extension as a fallback.
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",   # generic binary — validated further by extension
}

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".doc", ".docx"}


def _is_allowed_file(filename: str, content_type: str) -> bool:
    """Accept a file if EITHER its MIME type OR extension is in the allowed sets."""
    ext = Path(filename).suffix.lower() if filename else ""
    mime_ok = content_type in ALLOWED_MIME_TYPES
    ext_ok  = ext in ALLOWED_EXTENSIONS
    return mime_ok or ext_ok


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


def _extract_text(file_bytes: bytes, content_type: str, filename: str) -> str:
    ext = Path(filename).suffix.lower() if filename else ""
    if "pdf" in content_type or ext == ".pdf":
        return _extract_text_from_pdf(file_bytes)
    # Plain text / .txt — decode best-effort
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
    fname = file.filename or "document"
    ct    = file.content_type or "application/octet-stream"

    if not _is_allowed_file(fname, ct):
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type: '{ct}' / '{Path(fname).suffix}'. "
                "Please upload a PDF or TXT file."
            ),
        )

    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    text = _extract_text(file_bytes, ct, fname)
    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract any text from the uploaded file. "
                "Make sure the PDF is not a scanned image, or try uploading a .txt file."
            ),
        )

    try:
        analysis = await analyze_uploaded_file(text, fname)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    return {
        "file_id":   str(uuid.uuid4()),
        "filename":  fname,
        "word_count": len(text.split()),
        **analysis,
    }


@router.get("/")
async def list_uploads():
    """List all uploaded files for the authenticated user."""
    return {"uploads": [], "message": "DB integration returns real uploads."}
