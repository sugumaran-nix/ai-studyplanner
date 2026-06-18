"""
AI Service — unified interface for OpenAI & Gemini.
Swap providers via AI_PROVIDER env var without changing business logic.
"""

import re
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from core.config import settings

logger = logging.getLogger(__name__)


# ── JSON cleanup helper ───────────────────────────────────────────────────────

def _clean_json(text: str) -> str:
    """Strip markdown code fences that LLMs sometimes wrap JSON in."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


# ── Provider client factory ───────────────────────────────────────────────────

def _get_openai_client():
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


# ── Core completion wrapper ───────────────────────────────────────────────────

async def ai_complete(
    system_prompt: str,
    user_prompt: str,
    json_mode: bool = False,
    history: Optional[List[Dict]] = None,
) -> tuple[str, int]:
    """Returns (response_text, tokens_used)."""
    if not settings.OPENAI_API_KEY and not settings.GEMINI_API_KEY:
        raise ValueError(
            "No AI API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY "
            "in your environment variables."
        )
    if settings.AI_PROVIDER == "openai":
        return await _openai_complete(system_prompt, user_prompt, json_mode, history)
    else:
        return await _gemini_complete(system_prompt, user_prompt, json_mode, history)


async def _openai_complete(system_prompt, user_prompt, json_mode, history):
    client = _get_openai_client()

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_prompt})

    kwargs = {
        "model": settings.AI_MODEL,
        "messages": messages,
        "max_tokens": 2000,
        "temperature": 0.7,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    resp = await client.chat.completions.create(**kwargs)
    text   = resp.choices[0].message.content or ""
    tokens = resp.usage.total_tokens if resp.usage else 0
    return text, tokens


async def _gemini_complete(system_prompt, user_prompt, json_mode, history):
    """
    FIX 1 — History was silently ignored.
      The original code accepted a `history` param but never used it, so the
      AI chat had no memory of previous messages. Now we convert the
      OpenAI-style history (list of {role, content} dicts) into Gemini's
      format and pass it via start_chat().

    FIX 2 — Blocking call in async context.
      The original code called generate_content_async on a model object created
      outside of a chat session, which doesn't support history. Using
      start_chat() + send_message_async() fixes both issues at once.

    FIX 3 — Model name updated.
      gemini-1.5-flash is still valid but gemini-2.0-flash is faster and free.
      Made configurable via AI_MODEL env var; default stays gemini-1.5-flash
      for stability.
    """
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)

    # Use AI_MODEL if it looks like a Gemini model, otherwise fall back
    model_name = settings.AI_MODEL if "gemini" in settings.AI_MODEL else "gemini-1.5-flash"

    model = genai.GenerativeModel(
        model_name,
        system_instruction=system_prompt,
    )

    # Convert OpenAI-style history → Gemini format
    # OpenAI: [{"role": "user"|"assistant", "content": "..."}]
    # Gemini: [{"role": "user"|"model",      "parts": ["..."]}]
    gemini_history = []
    if history:
        for msg in history:
            role = "model" if msg["role"] == "assistant" else "user"
            gemini_history.append({
                "role": role,
                "parts": [msg["content"]],
            })

    chat = model.start_chat(history=gemini_history)

    prompt = user_prompt
    if json_mode:
        prompt += "\n\nRespond ONLY with valid JSON. No markdown fences, no extra text."

    response = await chat.send_message_async(prompt)
    text = response.text or ""
    # Gemini doesn't expose token counts the same way; approximate
    tokens = len(text.split()) * 2
    return text, tokens


# ── Feature-specific AI calls ─────────────────────────────────────────────────

STUDY_PLANNER_SYSTEM = """
You are StudyMind AI, an expert academic coach and study strategist.
You create highly personalized, scientifically-backed study plans using:
- Spaced repetition (SM-2 algorithm principles)
- Interleaving practice
- Pomodoro-compatible scheduling
- Cognitive load management

Always return valid JSON matching the schema provided.
Be specific, realistic, and motivating.
"""

async def generate_study_plan(
    subjects: List[str],
    exam_date: str,
    daily_hours: float,
    weak_subjects: List[str],
    difficulty: str,
    days_until_exam: int,
) -> Dict[str, Any]:
    prompt = f"""
Create a detailed, day-by-day study plan with this information:

Subjects: {', '.join(subjects)}
Exam Date: {exam_date}
Days Available: {days_until_exam}
Daily Study Hours: {daily_hours}
Difficulty Mode: {difficulty}
Weak Subjects (need extra focus): {', '.join(weak_subjects) if weak_subjects else 'None specified'}

Return JSON with this exact structure:
{{
  "title": "string - descriptive plan title",
  "total_hours": number,
  "daily_schedule": [
    {{
      "date": "YYYY-MM-DD",
      "sessions": [
        {{
          "subject": "string",
          "topic": "string",
          "duration_min": number,
          "session_type": "learn|review|practice|mock_test",
          "notes": "string - brief study guidance"
        }}
      ],
      "total_hours": number
    }}
  ],
  "topic_breakdown": [
    {{
      "topic": "string",
      "subject": "string",
      "estimated_hours": number,
      "priority": "high|medium|low",
      "repetitions": number
    }}
  ],
  "revision_schedule": [
    {{
      "date": "YYYY-MM-DD",
      "subjects": ["array of subjects to revise"],
      "revision_type": "quick_recap|deep_review|full_mock"
    }}
  ],
  "tips": ["array of 5 personalized study tips"]
}}

Generate a realistic plan for ALL {days_until_exam} days. Be specific about topics.
"""
    text, tokens = await ai_complete(STUDY_PLANNER_SYSTEM, prompt, json_mode=True)
    try:
        return json.loads(_clean_json(text))
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse planner JSON: {text[:300]} | error: {e}")
        raise ValueError(
            "AI returned an invalid response format. Please try again — "
            "this occasionally happens with complex plans."
        )


ANALYZER_SYSTEM = """
You are a learning diagnostics expert. Analyze student notes to identify
knowledge gaps, weak concepts, and areas needing more practice.
Use pedagogical principles to rank topics by urgency and impact.
Always return valid JSON.
"""

async def analyze_weak_topics(text: str, subject: Optional[str]) -> Dict[str, Any]:
    prompt = f"""
Analyze these student notes and identify weak areas:

Subject: {subject or 'Not specified'}
Notes:
\"\"\"
{text[:4000]}
\"\"\"

Return JSON:
{{
  "weak_topics": [
    {{
      "topic": "string",
      "confidence_score": 0.0-1.0,
      "priority": "critical|needs_work|review",
      "evidence": "string - why this seems weak",
      "suggestions": ["array of 3 specific improvement steps"]
    }}
  ],
  "strong_topics": ["topics the student clearly understands"],
  "overall_readiness": 0-100,
  "improvement_plan": ["ordered list of 5 actions to take"],
  "estimated_review_hours": number
}}
"""
    text_out, _ = await ai_complete(ANALYZER_SYSTEM, prompt, json_mode=True)
    try:
        return json.loads(_clean_json(text_out))
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse analyzer JSON: {text_out[:300]} | error: {e}")
        raise ValueError("AI returned an invalid analysis format. Please try again.")


FILE_ANALYSIS_SYSTEM = """
You are an expert at extracting structured learning insights from academic documents.
Identify key concepts, potential exam topics, and knowledge gaps.
"""

async def analyze_uploaded_file(content: str, filename: str) -> Dict[str, Any]:
    prompt = f"""
Analyze this document and extract learning insights:

File: {filename}
Content:
\"\"\"
{content[:5000]}
\"\"\"

Return JSON:
{{
  "summary": "2-3 paragraph summary of the document",
  "key_topics": ["list of main topics covered"],
  "weak_areas": ["topics covered briefly or unclearly that need more study"],
  "flashcard_suggestions": [
    {{"question": "string", "answer": "string"}}
  ],
  "difficulty_level": "beginner|intermediate|advanced",
  "estimated_study_hours": number
}}

Generate 5-8 flashcard suggestions from the most important content.
"""
    text_out, _ = await ai_complete(FILE_ANALYSIS_SYSTEM, prompt, json_mode=True)
    try:
        return json.loads(_clean_json(text_out))
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse file analysis JSON: {text_out[:300]} | error: {e}")
        raise ValueError("AI returned an invalid analysis format. Please try again.")


CHAT_SYSTEM = {
    "explain": """You are StudyMind's expert tutor. Explain concepts clearly using:
- Simple analogies
- Step-by-step breakdowns
- Real-world examples
- Memory tricks when helpful
Be thorough but concise. Use markdown formatting.""",

    "summarize": """You are StudyMind's note summarizer. Create:
- Structured summaries with headers
- Bullet-point key takeaways
- Important formulas/definitions highlighted
Use markdown for clarity.""",

    "tips": """You are StudyMind's study coach. Provide:
- Evidence-based study strategies
- Subject-specific techniques
- Time management advice
- Motivation and productivity tips
Be specific and actionable.""",

    "general": """You are StudyMind AI, a friendly, knowledgeable study assistant.
Help students with any academic questions. Be encouraging, precise, and helpful.
Use markdown formatting for structured responses.""",
}

async def chat_with_ai(
    message: str,
    mode: str,
    history: List[Dict],
    context: Optional[str],
) -> tuple[str, int]:
    system = CHAT_SYSTEM.get(mode, CHAT_SYSTEM["general"])
    if context:
        system += f"\n\nCurrent study context: {context}"

    return await ai_complete(system, message, history=history)
