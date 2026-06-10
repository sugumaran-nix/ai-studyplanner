"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Circle, SkipForward, Clock } from "lucide-react";
import { scheduleApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn, formatHours, sessionTypeColor } from "@/lib/utils";
import type { ScheduledSession, TodaySchedule } from "@/types";
import toast from "react-hot-toast";

const MOCK_SESSIONS: ScheduledSession[] = [
  { id: "s1", subject: "Mathematics", topic: "Calculus – Integration by Parts", scheduled_at: new Date().toISOString(), duration_min: 60, status: "completed", difficulty: "hard", repetition_no: 1 },
  { id: "s2", subject: "Physics", topic: "Wave Optics & Interference", scheduled_at: new Date().toISOString(), duration_min: 45, status: "pending", difficulty: "medium", repetition_no: 1 },
  { id: "s3", subject: "Chemistry", topic: "Organic Reactions – Aldol Condensation", scheduled_at: new Date().toISOString(), duration_min: 50, status: "pending", difficulty: "hard", repetition_no: 2 },
  { id: "s4", subject: "Mathematics", topic: "Spaced Review – Limits & Continuity", scheduled_at: new Date().toISOString(), duration_min: 30, status: "pending", difficulty: "easy", repetition_no: 3 },
];

export default function TodayScheduleCard() {
  const { setTodaySchedule } = useStore();
  const [sessions, setSessions] = useState<ScheduledSession[]>(MOCK_SESSIONS);
  const [loading, setLoading] = useState(false);

  const completed = sessions.filter((s) => s.status === "completed").length;
  const progressPct = sessions.length ? Math.round((completed / sessions.length) * 100) : 0;

  async function markSession(id: string, status: "completed" | "skipped") {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    try {
      await scheduleApi.updateSession(id, { status });
      toast.success(status === "completed" ? "Session completed! 🎉" : "Session skipped.");
    } catch {
      // optimistic — rollback not needed for demo
    }
  }

  return (
    <div className="card p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Calendar size={18} className="text-brand-400" />
          <h2 className="font-semibold text-[var(--text-primary)]">Today's Schedule</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {completed}/{sessions.length} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[var(--bg-raised)] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-brand rounded-full transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Session list */}
      <div className="space-y-2.5">
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            onComplete={() => markSession(session.id, "completed")}
            onSkip={() => markSession(session.id, "skipped")}
          />
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-10 text-[var(--text-muted)] text-sm">
          No sessions scheduled for today.
          <br />
          <span className="text-brand-400 cursor-pointer hover:underline">
            Generate a study plan →
          </span>
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session,
  onComplete,
  onSkip,
}: {
  session: ScheduledSession;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const isDone = session.status === "completed";
  const isSkipped = session.status === "skipped";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200",
        isDone
          ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
          : isSkipped
          ? "bg-[var(--bg-raised)] border-[var(--border)] opacity-50"
          : "bg-[var(--bg-raised)] border-[var(--border)] hover:border-brand-500/30"
      )}
    >
      {/* Status icon */}
      <button
        onClick={isDone || isSkipped ? undefined : onComplete}
        disabled={isDone || isSkipped}
        className="shrink-0 transition-transform hover:scale-110"
      >
        {isDone ? (
          <CheckCircle2 size={20} className="text-emerald-400" />
        ) : (
          <Circle size={20} className="text-[var(--text-muted)]" />
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium text-[var(--text-primary)] truncate",
          isDone && "line-through"
        )}>
          {session.topic}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--text-muted)]">{session.subject}</span>
          <span className="text-[var(--border)]">·</span>
          <Clock size={10} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">{session.duration_min}m</span>
          {session.repetition_no > 1 && (
            <>
              <span className="text-[var(--border)]">·</span>
              <span className="text-[10px] text-violet-400 font-medium">
                Review #{session.repetition_no}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Difficulty badge */}
      <span className={cn(
        "badge text-[10px] hidden sm:inline-flex",
        session.difficulty === "hard"
          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
          : session.difficulty === "medium"
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      )}>
        {session.difficulty}
      </span>

      {/* Skip button */}
      {!isDone && !isSkipped && (
        <button
          onClick={onSkip}
          title="Skip session"
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-400
                     hover:bg-amber-400/10 transition-all duration-150 shrink-0"
        >
          <SkipForward size={14} />
        </button>
      )}
    </div>
  );
}
