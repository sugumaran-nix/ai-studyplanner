// ── Shared domain types across the entire frontend ────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  timezone: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ── Study Planner ─────────────────────────────────────────────────────────────

export interface StudySession {
  subject: string;
  topic: string;
  duration_min: number;
  session_type: "learn" | "review" | "practice" | "mock_test";
  notes?: string;
}

export interface DayPlan {
  date: string;
  sessions: StudySession[];
  total_hours: number;
}

export interface TopicBreakdown {
  topic: string;
  subject: string;
  estimated_hours: number;
  priority: "high" | "medium" | "low";
  repetitions: number;
}

export interface RevisionEntry {
  date: string;
  subjects: string[];
  revision_type: "quick_recap" | "deep_review" | "full_mock";
}

export interface StudyPlan {
  plan_id: string;
  title: string;
  total_days: number;
  total_hours: number;
  days_until_exam: number;
  daily_schedule: DayPlan[];
  topic_breakdown: TopicBreakdown[];
  revision_schedule: RevisionEntry[];
  tips: string[];
}

export interface PlannerFormData {
  subjects: string[];
  exam_date: string;
  daily_hours: number;
  difficulty_preference: "light" | "balanced" | "intensive";
  weak_subjects: string[];
}

// ── Weak Topic Analyzer ───────────────────────────────────────────────────────

export interface WeakTopic {
  topic: string;
  confidence_score: number;
  priority: "critical" | "needs_work" | "review";
  evidence?: string;
  suggestions: string[];
}

export interface AnalysisResult {
  weak_topics: WeakTopic[];
  strong_topics: string[];
  overall_readiness: number;
  improvement_plan: string[];
  estimated_review_hours: number;
  subject?: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export type ChatMode = "explain" | "summarize" | "tips" | "general";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  mode?: ChatMode;
}

export interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
}

// ── File Upload ───────────────────────────────────────────────────────────────

export interface Flashcard {
  question: string;
  answer: string;
}

export interface FileAnalysis {
  file_id: string;
  filename: string;
  summary: string;
  key_topics: string[];
  weak_areas: string[];
  flashcard_suggestions: Flashcard[];
  word_count: number;
  difficulty_level?: string;
  estimated_study_hours?: number;
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export interface ScheduledSession {
  id: string;
  subject: string;
  topic: string;
  scheduled_at: string;
  duration_min: number;
  status: "pending" | "completed" | "skipped";
  difficulty: "easy" | "medium" | "hard";
  repetition_no: number;
}

export interface TodaySchedule {
  date: string;
  sessions: ScheduledSession[];
  completed_count: number;
  total_count: number;
  streak_days: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface ProgressData {
  date: string;
  hours_studied: number;
  sessions_completed: number;
  topics_covered: number;
}

export interface SubjectProgress {
  subject: string;
  completion_percent: number;
  total_hours: number;
  sessions_done: number;
  color: string;
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export type Theme = "light" | "dark";

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ApiError {
  detail: string;
  status: number;
}
