"""
Core configuration — reads from environment variables.
Never hard-code secrets here.
"""

import os
from pydantic_settings import BaseSettings
from typing import List


def _parse_origins(raw: str) -> List[str]:
    """
    Accept either a JSON list or a comma-separated string so the env-var
    works easily in Render/Vercel dashboards:
      ALLOWED_ORIGINS=https://foo.vercel.app,https://bar.vercel.app
    """
    raw = raw.strip()
    if raw.startswith("["):
        import json
        return json.loads(raw)
    return [o.strip() for o in raw.split(",") if o.strip()]


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS — comma-separated or JSON list in env var
    # e.g. ALLOWED_ORIGINS=https://myapp.vercel.app,https://myapp-preview.vercel.app
    ALLOWED_ORIGINS_STR: str = (
        "http://localhost:3000,"
        "http://localhost:3001,"
        "https://studymind.vercel.app"
    )
    # Regex pattern for Vercel preview deployments (optional)
    ALLOWED_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"

    # AI
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_PROVIDER: str = "openai"          # "openai" | "gemini"
    AI_MODEL: str = "gpt-4o-mini"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/studymind"

    # File uploads
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "/tmp/studymind_uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return _parse_origins(self.ALLOWED_ORIGINS_STR)

    def validate_ai_config(self) -> None:
        """Raise a clear error at startup if no AI key is configured."""
        if self.AI_PROVIDER == "openai" and not self.OPENAI_API_KEY:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. "
                "Set it in your .env file or environment variables."
            )
        if self.AI_PROVIDER == "gemini" and not self.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. "
                "Set it in your .env file or environment variables."
            )


settings = Settings()
