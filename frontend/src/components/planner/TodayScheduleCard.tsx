"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Circle, SkipForward, Clock } from "lucide-react";
import { scheduleApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn, sessionTypeColor } from "@/lib/utils";
import type { ScheduledSession } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TodayScheduleCard() {
  const { activePlan } = useStore();
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);

  // Build today's sessions from the active plan (first day if plan exists)
  const todaySessions: ScheduledSession[] = activePlan?.daily_schedule?.[0]?.sessions?.map((s, i) => ({
    id: `today-${i}`,
    subject: s.subject,
    topic: s.topic,
    scheduled_at: new Date().toISOString(),
    duration_min: s.duration_min,
    status: "pending" as const,
    difficulty: "medium" as const,
    repetition_no: 1,
  })) ?? [];

  const [displaySessions, setDisplaySessions] = useState<ScheduledSession[]>(todaySessions);

  const completed = displaySessions.filter((s) => s.status === "completed").length;
  const progressPct = displaySessions.length > 0
    ? Math.round((completed / displaySessions.length) * 100)
    : 0;

  async function markSession(id: string, status: "completed" | "skipped") {
    setDisplaySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    toast.success(status === "completed" ? "Session completed! 🎉" : "Skipped.");
  }

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Calendar size={18} className="text-indigo-400" />
          <h2 className="font-semibold text-[var(--text-primary)]">Today's Schedule</h2>
        </div>
        {displaySessions.length > 0 && (
          <span className="text-xs text-[var(--text-muted)]">
            {completed}/{displaySessions.length} done
          </span>
        )}
      </div>

      {displaySessions.length > 0 && (
        <div className="h-1.5 bg-[var(--bg-raised)] rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {displaySessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-3xl mb-3">📅</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">No sessions yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
            Generate a study plan to see your daily schedule here
          </p>
          <Link href="/planner" className="btn-primary text-xs px-4 py-2">
            Create Study Plan →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displaySessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onComplete={() => markSession(session.id, "completed")}
              onSkip={() => markSession(session.id, "skipped")}
            />
          ))}
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
    <div className={cn(
      "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200",
      isDone ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
        : isSkipped ? "bg-[var(--bg-raised)] border-[var(--border)] opacity-50"
        : "bg-[var(--bg-raised)] border-[var(--border)] hover:border-indigo-500/30"
    )}>
      <button
        onClick={isDone || isSkipped ? undefined : onComplete}
        disabled={isDone || isSkipped}
        className="shrink-0 transition-transform hover:scale-110"
      >
        {isDone
          ? <CheckCircle2 size={20} className="text-emerald-400" />
          : <Circle size={20} className="text-[var(--text-muted)]" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium text-[var(--text-primary)] truncate", isDone && "line-through")}>
          {session.topic}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--text-muted)]">{session.subject}</span>
          <span className="text-[var(--border)]">·</span>
          <Clock size={10} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">{session.duration_min}m</span>
        </div>
      </div>

      {!isDone && !isSkipped && (
        <button
          onClick={onSkip}
          title="Skip"
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-400/10 transition-all duration-150 shrink-0"
        >
          <SkipForward size={14} />
        </button>
      )}
    </div>
  );
}
