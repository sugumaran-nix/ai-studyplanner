"""
/api/auth — JWT-based authentication endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import uuid

from models.schemas import RegisterRequest, LoginRequest, TokenResponse
from core.config import settings

router = APIRouter()
security = HTTPBearer()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Mock user store (replace with DB queries) ─────────────────────────────────
_users: dict = {}


def _hash(password: str) -> str:
    return pwd_ctx.hash(password)

def _verify(password: str, hashed: str) -> bool:
    return pwd_ctx.verify(password, hashed)

def _create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    if req.email in _users:
        raise HTTPException(status_code=409, detail="Email already registered.")
    user_id = str(uuid.uuid4())
    _users[req.email] = {
        "id": user_id,
        "email": req.email,
        "full_name": req.full_name,
        "hashed_password": _hash(req.password),
    }
    token = _create_token(user_id, req.email)
    return TokenResponse(access_token=token, user_id=user_id, full_name=req.full_name)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = _users.get(req.email)
    if not user or not _verify(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = _create_token(user["id"], req.email)
    return TokenResponse(access_token=token, user_id=user["id"], full_name=user["full_name"])


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency — validates JWT and returns user payload."""
    try:
        payload = jwt.decode(creds.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
