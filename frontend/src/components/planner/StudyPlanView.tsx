"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatDate, formatHours, priorityBg, sessionTypeColor } from "@/lib/utils";
import { BookOpen, Target, RotateCcw, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayPlan } from "@/types";

export default function StudyPlanView() {
  const { activePlan, setActivePlan } = useStore();

  if (!activePlan) {
    return (
      <div className="card p-12 text-center">
        <p className="text-[var(--text-muted)] text-sm">
          No plan generated yet.{" "}
          <span className="text-brand-400 cursor-pointer hover:underline">
            Generate your first plan →
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{activePlan.title}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {activePlan.days_until_exam} days remaining · {formatHours(activePlan.total_hours)} total study time
            </p>
          </div>
          <button
            onClick={() => setActivePlan(null)}
            className="btn-ghost text-xs flex items-center gap-1.5 text-rose-400 hover:bg-rose-400/10"
          >
            <RotateCcw size={13} /> Reset Plan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: "Total Days",   value: activePlan.total_days },
            { label: "Total Hours",  value: formatHours(activePlan.total_hours) },
            { label: "Topics",       value: activePlan.topic_breakdown.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--bg-raised)] rounded-xl p-3.5 text-center">
              <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Daily schedule */}
        <div className="xl:col-span-2 space-y-3">
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar size={16} className="text-brand-400" />
            Daily Schedule
          </h3>
          {activePlan.daily_schedule.slice(0, 14).map((day, i) => (
            <DayCard key={day.date} day={day} index={i} />
          ))}
          {activePlan.daily_schedule.length > 14 && (
            <p className="text-xs text-center text-[var(--text-muted)] py-2">
              + {activePlan.daily_schedule.length - 14} more days in your plan
            </p>
          )}
        </div>

        {/* Topic breakdown + tips */}
        <div className="space-y-4">
          {/* Topic breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-4 flex items-center gap-2">
              <Target size={14} className="text-brand-400" />
              Topic Breakdown
            </h3>
            <div className="space-y-2.5">
              {activePlan.topic_breakdown.slice(0, 8).map((t) => (
                <div key={t.topic} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{t.topic}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{t.subject} · {formatHours(t.estimated_hours)}</p>
                  </div>
                  <span className={cn("badge text-[10px]", priorityBg(t.priority))}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI tips */}
          {activePlan.tips.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-violet-400" />
                AI Study Tips
              </h3>
              <ul className="space-y-2">
                {activePlan.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="text-brand-400 shrink-0 mt-0.5">✦</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, index }: { day: DayPlan; index: number }) {
  const [open, setOpen] = useState(index < 3);
  const isToday = day.date === new Date().toISOString().split("T")[0];

  return (
    <div className={cn(
      "card overflow-hidden transition-all duration-200",
      isToday && "border-brand-500/40 shadow-glow"
    )}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-raised)] transition-colors"
      >
        <div className="flex items-center gap-3">
          {isToday && (
            <span className="badge bg-brand-500/15 text-brand-400 border-brand-500/25 text-[10px]">
              TODAY
            </span>
          )}
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {formatDate(day.date, "EEEE, MMM d")}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {day.sessions.length} sessions · {formatHours(day.total_hours)}
          </span>
        </div>
        {open ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-[var(--border)]">
          {day.sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 pt-2">
              <span className={cn("badge text-[10px]", sessionTypeColor(s.session_type))}>
                {s.session_type.replace("_", " ")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">{s.topic}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{s.subject} · {s.duration_min}m</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
