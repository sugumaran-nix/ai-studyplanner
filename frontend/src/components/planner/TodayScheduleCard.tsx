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

  const todayStr = new Date().toISOString().split("T")[0];

  // BUG FIX: the original code always used daily_schedule[0] (the very first day),
  // which means users on day 2+ of their plan would always see Day 1 sessions again.
  // Now we find the day whose date matches today. If today isn't in the plan
  // (plan hasn't started yet or has ended), we show the next upcoming day as a fallback.
  const todayPlanDay = activePlan?.daily_schedule?.find((d) => d.date === todayStr)
    ?? activePlan?.daily_schedule?.find((d) => d.date > todayStr)
    ?? activePlan?.daily_schedule?.[0];

  const todaySessions: ScheduledSession[] =
    todayPlanDay?.sessions?.map((s, i) => ({
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
          {todayPlanDay && todayPlanDay.date !== todayStr && (
            <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">
              Next session: {todayPlanDay.date}
            </span>
          )}
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
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
          <Calendar size={28} className="text-[var(--border)]" />
          <p className="text-sm text-[var(--text-muted)]">
            {activePlan
              ? "No sessions scheduled for today."
              : "No active study plan yet."}
          </p>
          {!activePlan && (
            <Link
              href="/planner"
              className="text-xs text-brand-400 hover:underline"
            >
              Create your study plan →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {displaySessions.map((s) => (
            <SessionRow key={s.id} session={s} onMark={markSession} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session,
  onMark,
}: {
  session: ScheduledSession;
  onMark: (id: string, status: "completed" | "skipped") => void;
}) {
  const isDone = session.status === "completed";
  const isSkipped = session.status === "skipped";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
        isDone
          ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
          : isSkipped
          ? "border-[var(--border)] bg-[var(--bg-raised)] opacity-50"
          : "border-[var(--border)] bg-[var(--bg-raised)] hover:border-brand-500/30"
      )}
    >
      <button
        onClick={() => !isDone && !isSkipped && onMark(session.id, "completed")}
        className="shrink-0"
        title={isDone ? "Completed" : "Mark complete"}
        disabled={isDone || isSkipped}
      >
        {isDone ? (
          <CheckCircle2 size={18} className="text-emerald-400" />
        ) : (
          <Circle size={18} className="text-[var(--border)]" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-medium truncate", isDone || isSkipped ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>
          {session.topic}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("badge text-[10px]", sessionTypeColor(session.difficulty))}>
            {session.subject}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
            <Clock size={9} /> {session.duration_min}m
          </span>
        </div>
      </div>

      {!isDone && !isSkipped && (
        <button
          onClick={() => onMark(session.id, "skipped")}
          title="Skip"
          className="shrink-0 text-[var(--text-muted)] hover:text-amber-400 transition-colors"
        >
          <SkipForward size={14} />
        </button>
      )}
    </div>
  );
}
