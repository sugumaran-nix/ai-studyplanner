/**
 * Global application state via Zustand.
 * Slices: auth, theme, study plan, chat, schedule.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  Theme,
  StudyPlan,
  ChatMessage,
  ChatMode,
  TodaySchedule,
  AnalysisResult,
  FileAnalysis,
} from "@/types";

// ── Auth slice ─────────────────────────────────────────────────────────────────

interface AuthSlice {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

// ── Theme slice ────────────────────────────────────────────────────────────────

interface ThemeSlice {
  theme: Theme;
  toggleTheme: () => void;
}

// ── Planner slice ──────────────────────────────────────────────────────────────

interface PlannerSlice {
  activePlan: StudyPlan | null;
  setActivePlan: (plan: StudyPlan | null) => void;
}

// ── Chat slice ─────────────────────────────────────────────────────────────────

interface ChatSlice {
  sessionId: string | null;
  messages: ChatMessage[];
  chatMode: ChatMode;
  isTyping: boolean;
  setSessionId: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setTyping: (v: boolean) => void;
  setChatMode: (m: ChatMode) => void;
  clearChat: () => void;
}

// ── Schedule slice ─────────────────────────────────────────────────────────────

interface ScheduleSlice {
  todaySchedule: TodaySchedule | null;
  setTodaySchedule: (s: TodaySchedule) => void;
}

// ── Analyzer slice ─────────────────────────────────────────────────────────────

interface AnalyzerSlice {
  lastAnalysis: AnalysisResult | null;
  lastFileAnalysis: FileAnalysis | null;
  setAnalysis: (a: AnalysisResult) => void;
  setFileAnalysis: (a: FileAnalysis) => void;
}

// ── Combined store ─────────────────────────────────────────────────────────────

type AppStore = AuthSlice &
  ThemeSlice &
  PlannerSlice &
  ChatSlice &
  ScheduleSlice &
  AnalyzerSlice;

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("sm_token", token);
        }
        set({ user, token });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sm_token");
        }
        set({ user: null, token: null });
      },

      // Theme
      theme: "dark",
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      // Planner
      activePlan: null,
      setActivePlan: (plan) => set({ activePlan: plan }),

      // Chat
      sessionId: null,
      messages: [],
      chatMode: "general",
      isTyping: false,
      setSessionId: (id) => set({ sessionId: id }),
      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),
      setTyping: (v) => set({ isTyping: v }),
      setChatMode: (m) => set({ chatMode: m }),
      clearChat: () =>
        set({ messages: [], sessionId: null }),

      // Schedule
      todaySchedule: null,
      setTodaySchedule: (s) => set({ todaySchedule: s }),

      // Analyzer
      lastAnalysis: null,
      lastFileAnalysis: null,
      setAnalysis: (a) => set({ lastAnalysis: a }),
      setFileAnalysis: (a) => set({ lastFileAnalysis: a }),
    }),
    {
      name: "studymind-store",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        theme: s.theme,
        activePlan: s.activePlan,
      }),
    }
  )
);
