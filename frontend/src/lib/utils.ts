import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

// ── Class name merger ──────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date helpers ───────────────────────────────────────────────────────────────
export function formatDate(dateStr: string, fmt = "MMM d, yyyy"): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Text helpers ───────────────────────────────────────────────────────────────
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + "…";
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Number helpers ─────────────────────────────────────────────────────────────
export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

// ── Priority color mapping ─────────────────────────────────────────────────────
export function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    high:       "text-rose-500",
    critical:   "text-rose-500",
    medium:     "text-amber-500",
    needs_work: "text-amber-500",
    low:        "text-emerald-500",
    review:     "text-brand-400",
  };
  return map[priority] ?? "text-slate-400";
}

export function priorityBg(priority: string): string {
  const map: Record<string, string> = {
    high:       "bg-rose-500/10 text-rose-400 border-rose-500/20",
    critical:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
    medium:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
    needs_work: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low:        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    review:     "bg-brand-500/10 text-brand-400 border-brand-500/20",
  };
  return map[priority] ?? "bg-slate-500/10 text-slate-400";
}

export function sessionTypeColor(type: string): string {
  const map: Record<string, string> = {
    learn:     "bg-brand-500/15 text-brand-400",
    review:    "bg-violet-500/15 text-violet-400",
    practice:  "bg-amber-500/15 text-amber-400",
    mock_test: "bg-rose-500/15 text-rose-400",
  };
  return map[type] ?? "bg-slate-500/15 text-slate-400";
}

// ── Subject color palette ─────────────────────────────────────────────────────
const SUBJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#f43f5e", "#3b82f6", "#ec4899",
];
export function subjectColor(index: number): string {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

// ── Local storage helpers ─────────────────────────────────────────────────────
export function safeGetLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSetLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* silent */
  }
}
