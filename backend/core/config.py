"""
Core configuration — reads from environment variables.
Never hard-code secrets here.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://studymind.vercel.app",
    ]

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


settings = Settings()
