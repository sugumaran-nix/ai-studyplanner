# StudyMind AI — Full-Stack AI Learning Platform

> **Production-ready** AI-powered study planner and smart learning assistant.  
> Built with Next.js 14 · FastAPI · OpenAI/Gemini · PostgreSQL · GSAP

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│                                                                 │
│   Next.js 14 App Router (TypeScript + Tailwind + GSAP)          │
│   ┌──────────┐ ┌───────────┐ ┌─────────────┐ ┌─────────────┐    │
│   │Dashboard │ │  Planner  │ │AI Assistant │ │  Analytics  │    │
│   └──────────┘ └───────────┘ └─────────────┘ └─────────────┘    │
│                    Zustand Global State                         │
│                    Axios API Client (JWT auth)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST / JSON
┌───────────────────────────▼─────────────────────────────────────┐
│                         API LAYER                               │
│                                                                 │
│   FastAPI (Python 3.12)                                         │
│   ┌─────────┐ ┌──────────┐ ┌──────┐ ┌───────┐ ┌──────────┐      │
│   │/planner │ │/analyzer │ │/chat │ │/files │ │/schedule │      │
│   └─────────┘ └──────────┘ └──────┘ └───────┘ └──────────┘      │
│               JWT Auth  ·  CORS  ·  Rate Limiting               │
└─────────────┬──────────────────┬────────────────────────────────┘
              │                  │
┌─────────────▼──────┐  ┌────────▼──────────────────────────────┐
│   AI LAYER         │  │        DATA LAYER                     │
│                    │  │                                       │
│   ai_service.py    │  │  PostgreSQL (Supabase)                │
│   ┌─────────────┐  │  │  ┌────────┐ ┌──────────┐ ┌────────┐   │
│   │OpenAI GPT-4 │  │  │  │ users  │ │  plans   │ │  chat  │   │
│   │    OR       │  │  │  └────────┘ └──────────┘ └────────┘   │
│   │Gemini 1.5   │  │  │  ┌─────────────┐ ┌──────────────────┐ │
│   └─────────────┘  │  │  │   sessions  │ │  uploaded_files  │ │
└────────────────────┘  │  └─────────────┘ └──────────────────┘ │
                        └───────────────────────────────────────┘
```

---

## Project Structure

```
studymind/
├── frontend/                      # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout + ThemeProvider
│   │   │   ├── page.tsx            # Redirect → /dashboard
│   │   │   ├── globals.css         # Tailwind + CSS variables
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx      # Sidebar + TopBar shell
│   │   │   │   └── page.tsx        # Dashboard home
│   │   │   ├── planner/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx        # Planner tabs
│   │   │   ├── assistant/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx        # AI Chat UI
│   │   │   └── analytics/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx        # Progress charts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx     # Collapsible sidebar
│   │   │   │   ├── TopBar.tsx      # Header bar
│   │   │   │   └── ThemeProvider.tsx
│   │   │   ├── planner/
│   │   │   │   ├── PlannerForm.tsx       # AI plan generator form
│   │   │   │   ├── StudyPlanView.tsx     # Generated plan display
│   │   │   │   ├── TodayScheduleCard.tsx # Today's sessions
│   │   │   │   ├── FileUploadZone.tsx    # Drag & drop upload
│   │   │   │   └── WeakTopicAnalyzer.tsx # Note analysis
│   │   │   ├── assistant/
│   │   │   │   └── AIRecommendationsPanel.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── StatsRow.tsx
│   │   │   │   └── RecentActivityFeed.tsx
│   │   │   └── ui/
│   │   │       └── QuickActions.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios client + all API calls
│   │   │   ├── store.ts            # Zustand global state
│   │   │   ├── animations.ts       # GSAP helpers
│   │   │   └── utils.ts            # cn(), formatDate(), etc.
│   │   └── types/
│   │       └── index.ts            # All TypeScript interfaces
│   ├── tailwind.config.ts          # Custom design system
│   ├── next.config.js
│   └── package.json
│
└── backend/                        # FastAPI Python App
    ├── main.py                     # App entry, middleware, routers
    ├── core/
    │   └── config.py               # Pydantic settings from .env
    ├── models/
    │   ├── db_models.py            # SQLAlchemy ORM models
    │   └── schemas.py              # Pydantic request/response
    ├── routers/
    │   ├── auth.py                 # /api/auth — JWT login/register
    │   ├── planner.py              # /api/planner — plan generation
    │   ├── analyzer.py             # /api/analyzer — weak topic
    │   ├── chat.py                 # /api/chat — AI chat
    │   ├── files.py                # /api/files — PDF upload
    │   └── schedule.py             # /api/schedule — sessions
    ├── services/
    │   └── ai_service.py           # OpenAI/Gemini abstraction
    ├── requirements.txt
    └── Dockerfile
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/planner/generate` | Generate AI study plan |
| GET | `/api/planner/plans` | List user's plans |
| POST | `/api/analyzer/text` | Analyze notes for weak topics |
| POST | `/api/chat/message` | Send chat message, get AI reply |
| DELETE | `/api/chat/sessions/{id}` | Clear chat history |
| POST | `/api/files/upload` | Upload PDF/TXT, get AI analysis |
| GET | `/api/schedule/today` | Today's scheduled sessions |
| PATCH | `/api/schedule/sessions/{id}` | Mark session complete/skipped |
| GET | `/api/schedule/upcoming` | Upcoming N days |
| GET | `/api/health` | Health check |

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120),
  timezone      VARCHAR(60) DEFAULT 'UTC',
  preferences   JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Study plans
CREATE TABLE study_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  subjects      TEXT[] NOT NULL,
  exam_date     TIMESTAMPTZ NOT NULL,
  daily_hours   FLOAT NOT NULL,
  plan_data     JSONB NOT NULL,    -- Full AI-generated schedule
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Individual study sessions (from plans)
CREATE TABLE study_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  subject       VARCHAR(120) NOT NULL,
  topic         VARCHAR(255) NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INTEGER NOT NULL,
  difficulty    VARCHAR(20) DEFAULT 'medium',
  status        VARCHAR(20) DEFAULT 'pending',  -- pending|completed|skipped
  repetition_no INTEGER DEFAULT 1,
  next_review   TIMESTAMPTZ,  -- Spaced repetition next date
  notes         TEXT
);

-- AI chat sessions
CREATE TABLE chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL,  -- user|assistant
  content    TEXT NOT NULL,
  tokens     INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded files and analysis
CREATE TABLE uploaded_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  filename    VARCHAR(255) NOT NULL,
  file_type   VARCHAR(20),
  file_size   INTEGER,
  storage_key VARCHAR(500),
  analysis    JSONB,    -- AI summary, topics, weak_areas, flashcards
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## AI Prompt Design

### Study Plan Generator
```
System: Expert academic coach using spaced repetition + interleaving
Input:  Subjects, exam date, daily hours, weak subjects, difficulty
Output: JSON with daily_schedule[], topic_breakdown[], revision_schedule[], tips[]
```

### Weak Topic Analyzer
```
System: Learning diagnostics expert
Input:  Student notes (up to 4000 chars), subject
Output: JSON with weak_topics[{confidence_score, priority, suggestions}],
        strong_topics[], overall_readiness, improvement_plan
```

### File Analyzer
```
System: Academic document intelligence
Input:  Extracted text (up to 5000 chars), filename
Output: JSON with summary, key_topics[], weak_areas[], flashcard_suggestions[]
```

### Chat Modes
| Mode | System Persona |
|------|---------------|
| `general` | Friendly study assistant |
| `explain` | Expert tutor with analogies |
| `summarize` | Note condenser with markdown |
| `tips` | Evidence-based study coach |

---

## Data Flow

```
User fills PlannerForm
    → plannerApi.generate(formData)       [POST /api/planner/generate]
    → FastAPI validates with Pydantic
    → ai_service.generate_study_plan()
    → OpenAI / Gemini → JSON plan
    → Response serialized to StudyPlan type
    → Zustand setActivePlan(plan)
    → StudyPlanView renders plan
```

---

## Local Development

```bash
# 1. Clone and configure
cp .env.example backend/.env
cp .env.example frontend/.env.local
# Edit both files — add your OPENAI_API_KEY

# 2. Start with Docker Compose
docker-compose up --build

# OR run manually:

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
vercel --prod
# Set: NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend → Railway / Render / Fly.io
```bash
# Set all env vars in the platform dashboard
# Railway auto-detects Dockerfile
railway up
```

### Database → Supabase
```
1. Create project at supabase.com
2. Copy DATABASE_URL from Settings → Database
3. Run schema SQL in Supabase SQL editor
4. Update DATABASE_URL in backend .env
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript (.tsx) |
| Styling | Tailwind CSS + CSS variables |
| Animations | GSAP 3 |
| State | Zustand + persist middleware |
| HTTP Client | Axios with interceptors |
| Backend | FastAPI + Uvicorn |
| AI Provider | OpenAI GPT-4o-mini / Gemini 1.5 Flash |
| Auth | JWT (python-jose + bcrypt) |
| ORM | SQLAlchemy 2 (async) |
| Database | PostgreSQL (Supabase) |
| File Parsing | pypdf |
| Containers | Docker + docker-compose |
| Deployment | Vercel (FE) + Railway (BE) |

---

*Built by Sugumaran — StudyMind AI v1.0.0*
