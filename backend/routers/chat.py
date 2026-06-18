"""
/api/chat — AI chat assistant with session history and streaming.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import uuid
import json

from models.schemas import ChatRequest, ChatResponse
from services.ai_service import chat_with_ai  # _get_openai_client removed (unused import)
from core.config import settings

router = APIRouter()

# In-memory session store — replace with Redis/DB in production
_sessions: dict = {}


@router.post("/message", response_model=ChatResponse)
async def send_message(req: ChatRequest):
    """Send a message to the AI study assistant."""
    session_id = req.session_id or str(uuid.uuid4())

    # Load or init history
    history = _sessions.get(session_id, [])

    # Trim history to last 20 exchanges to stay within context limits
    if len(history) > 40:
        history = history[-40:]

    try:
        reply, tokens = await chat_with_ai(
            message=req.message,
            mode=req.mode.value,
            history=history,
            context=req.context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

    # Persist to session
    history.append({"role": "user",      "content": req.message})
    history.append({"role": "assistant", "content": reply})
    _sessions[session_id] = history

    return ChatResponse(
        session_id=session_id,
        reply=reply,
        mode=req.mode.value,
        tokens_used=tokens,
    )


@router.get("/sessions")
async def list_sessions():
    """List all chat sessions for authenticated user."""
    return {
        "sessions": [
            {"session_id": k, "message_count": len(v) // 2}
            for k, v in _sessions.items()
        ]
    }


@router.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear a chat session's history."""
    _sessions.pop(session_id, None)
    return {"cleared": session_id}
