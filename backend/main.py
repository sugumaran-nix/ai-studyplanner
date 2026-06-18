"""
StudyMind AI — FastAPI Backend
Production-ready entry point with CORS, error handling, and router registration.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from routers import planner, analyzer, chat, files, auth, schedule
from core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StudyMind AI API",
    description="AI-powered study planning and learning assistant backend.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# allow_origins covers explicitly listed origins;
# allow_origin_regex additionally covers all Vercel preview URLs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=settings.ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup validation ────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    try:
        settings.validate_ai_config()
        logger.info(
            f"StudyMind started — provider={settings.AI_PROVIDER}, "
            f"model={settings.AI_MODEL}, env={settings.APP_ENV}"
        )
    except RuntimeError as e:
        logger.error(f"⚠ STARTUP WARNING: {e}")
        # Don't crash the server — return 503 on AI calls instead

# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(round(time.time() - start, 4))
    return response

# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(planner.router,  prefix="/api/planner",  tags=["Study Planner"])
app.include_router(analyzer.router, prefix="/api/analyzer", tags=["Weak Topic Analyzer"])
app.include_router(chat.router,     prefix="/api/chat",     tags=["AI Chat"])
app.include_router(files.router,    prefix="/api/files",    tags=["File Processing"])
app.include_router(schedule.router, prefix="/api/schedule", tags=["Smart Schedule"])

@app.get("/api/health")
async def health():
    provider_ok = bool(
        (settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY) or
        (settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY)
    )
    return {
        "status": "ok",
        "version": "1.0.0",
        "ai_provider": settings.AI_PROVIDER,
        "ai_ready": provider_ok,
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
