/**
 * Centralized API client.
 * All requests go through here — auth headers, error normalization, base URL.
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import type {
  StudyPlan,
  PlannerFormData,
  AnalysisResult,
  ChatMessage,
  FileAnalysis,
  TodaySchedule,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Axios instance ─────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000, // AI calls can take ~30s
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sm_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// BUG FIX: distinguish network failures (backend unreachable) from API errors
// (backend reachable but returned an error). Previously both showed the same
// generic "Network Error" from Axios, giving users no actionable info.
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ detail: string }>) => {
    let message: string;
    if (!err.response) {
      // No response at all — server is down or CORS preflight failed
      message =
        "Cannot reach the server. Please check your internet connection " +
        "or try again in a moment.";
    } else {
      // Server responded with an error status
      message =
        err.response.data?.detail ??
        err.message ??
        "Something went wrong. Please try again.";
    }
    return Promise.reject(new Error(message));
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post("/api/auth/register", data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data).then((r) => r.data),
};

// ── Study Planner ──────────────────────────────────────────────────────────────

export const plannerApi = {
  generate: (data: PlannerFormData): Promise<StudyPlan> =>
    api.post("/api/planner/generate", data).then((r) => r.data),

  listPlans: () =>
    api.get("/api/planner/plans").then((r) => r.data),

  deletePlan: (planId: string) =>
    api.delete(`/api/planner/plans/${planId}`).then((r) => r.data),
};

// ── Weak Topic Analyzer ────────────────────────────────────────────────────────

export const analyzerApi = {
  analyzeText: (data: {
    text: string;
    subject?: string;
  }): Promise<AnalysisResult> =>
    api.post("/api/analyzer/text", data).then((r) => r.data),

  getHistory: () =>
    api.get("/api/analyzer/history").then((r) => r.data),
};

// ── AI Chat ────────────────────────────────────────────────────────────────────

export const chatApi = {
  sendMessage: (data: {
    session_id?: string;
    message: string;
    mode?: string;
    context?: string;
  }) => api.post("/api/chat/message", data).then((r) => r.data),

  getSessions: () =>
    api.get("/api/chat/sessions").then((r) => r.data),

  clearSession: (sessionId: string) =>
    api.delete(`/api/chat/sessions/${sessionId}`).then((r) => r.data),
};

// ── File Upload ────────────────────────────────────────────────────────────────

export const filesApi = {
  upload: (file: File): Promise<FileAnalysis> => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post("/api/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  listUploads: () =>
    api.get("/api/files/").then((r) => r.data),
};

// ── Schedule ───────────────────────────────────────────────────────────────────

export const scheduleApi = {
  getToday: (): Promise<TodaySchedule> =>
    api.get("/api/schedule/today").then((r) => r.data),

  updateSession: (
    sessionId: string,
    data: { status: string; notes?: string }
  ) => api.patch(`/api/schedule/sessions/${sessionId}`, data).then((r) => r.data),

  getUpcoming: (days = 7) =>
    api.get(`/api/schedule/upcoming?days=${days}`).then((r) => r.data),
};

export default api;
