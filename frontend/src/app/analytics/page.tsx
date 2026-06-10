"use client";

import { useEffect, useRef } from "react";
import { pageEnter, staggerCards, animateProgress } from "@/lib/animations";
import { BarChart3, TrendingUp, Target, Flame } from "lucide-react";
import { cn, subjectColor, formatHours } from "@/lib/utils";
import type { SubjectProgress, ProgressData } from "@/types";

const WEEKLY_DATA: ProgressData[] = [
  { date: "Mon", hours_studied: 3.5, sessions_completed: 4, topics_covered: 3 },
  { date: "Tue", hours_studied: 4.0, sessions_completed: 5, topics_covered: 4 },
  { date: "Wed", hours_studied: 2.5, sessions_completed: 3, topics_covered: 2 },
  { date: "Thu", hours_studied: 5.0, sessions_completed: 6, topics_covered: 5 },
  { date: "Fri", hours_studied: 3.0, sessions_completed: 4, topics_covered: 3 },
  { date: "Sat", hours_studied: 6.0, sessions_completed: 7, topics_covered: 6 },
  { date: "Sun", hours_studied: 4.5, sessions_completed: 5, topics_covered: 4 },
];

const SUBJECT_DATA: SubjectProgress[] = [
  { subject: "Mathematics",  completion_percent: 68, total_hours: 24, sessions_done: 18, color: "#6366f1" },
  { subject: "Physics",      completion_percent: 52, total_hours: 18, sessions_done: 13, color: "#8b5cf6" },
  { subject: "Chemistry",    completion_percent: 41, total_hours: 14, sessions_done: 10, color: "#06b6d4" },
  { subject: "Biology",      completion_percent: 75, total_hours: 12, sessions_done: 9,  color: "#10b981" },
];

const MAX_HOURS = Math.max(...WEEKLY_DATA.map((d) => d.hours_studied));

export default function AnalyticsPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) pageEnter(pageRef.current);
    staggerCards(".analytics-card", 0.06);
  }, []);

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Track your study patterns, progress, and performance.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Week",      value: "28.5h",  sub: "+12% vs last week",  icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Current Streak", value: "7 days", sub: "Personal best: 12",  icon: Flame,      color: "text-amber-400",  bg: "bg-amber-400/10" },
          { label: "Sessions Done",  value: "34",     sub: "6 this week",        icon: Target,     color: "text-brand-400",  bg: "bg-brand-400/10" },
          { label: "Avg/Day",        value: "4.1h",   sub: "Goal: 4h ✓",        icon: BarChart3,  color: "text-violet-400", bg: "bg-violet-400/10" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 analytics-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-muted)] font-medium">{label}</span>
              <div className={cn("p-1.5 rounded-lg", bg)}>
                <Icon size={13} className={color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly bar chart */}
        <div className="lg:col-span-3 card p-6 analytics-card">
          <h3 className="font-semibold text-[var(--text-primary)] mb-6">
            Weekly Study Hours
          </h3>
          <div className="flex items-end gap-2 h-40">
            {WEEKLY_DATA.map((day, i) => {
              const heightPct = (day.hours_studied / MAX_HOURS) * 100;
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {day.hours_studied}h
                  </span>
                  <div className="w-full rounded-t-lg overflow-hidden relative" style={{ height: "100px" }}>
                    <div
                      className={cn(
                        "absolute bottom-0 w-full rounded-t-lg transition-all duration-700",
                        isToday ? "bg-brand-500" : "bg-brand-500/35 hover:bg-brand-500/60"
                      )}
                      style={{
                        height: `${heightPct}%`,
                        animation: `fadeUp 0.6s ease ${i * 0.08}s both`,
                      }}
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium",
                    isToday ? "text-brand-400" : "text-[var(--text-muted)]"
                  )}>
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="lg:col-span-2 card p-6 analytics-card">
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">
            Subject Progress
          </h3>
          <div className="space-y-4">
            {SUBJECT_DATA.map((s) => (
              <SubjectProgressBar key={s.subject} subject={s} />
            ))}
          </div>
        </div>
      </div>

      {/* Session log */}
      <div className="card p-6 analytics-card">
        <h3 className="font-semibold text-[var(--text-primary)] mb-5">
          Study Heatmap (Last 4 Weeks)
        </h3>
        <HeatmapGrid />
      </div>
    </div>
  );
}

function SubjectProgressBar({ subject }: { subject: SubjectProgress }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: subject.color }}
          />
          <span className="font-medium text-[var(--text-primary)]">{subject.subject}</span>
        </div>
        <span className="text-[var(--text-muted)]">
          {subject.completion_percent}% · {subject.total_hours}h
        </span>
      </div>
      <div className="h-2 bg-[var(--bg-raised)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${subject.completion_percent}%`,
            backgroundColor: subject.color,
          }}
        />
      </div>
    </div>
  );
}

function HeatmapGrid() {
  // Generate 28 days of mock activity
  const cells = Array.from({ length: 28 }, (_, i) => ({
    day: i,
    intensity: Math.random(), // 0 = none, 1 = heavy
  }));

  const intensityClass = (v: number) => {
    if (v < 0.2) return "bg-[var(--bg-raised)]";
    if (v < 0.45) return "bg-brand-500/20";
    if (v < 0.7) return "bg-brand-500/50";
    return "bg-brand-500";
  };

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {days.map((d, i) => (
          <div key={i} className="w-7 text-center text-[10px] text-[var(--text-muted)]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => (
          <div
            key={cell.day}
            title={`Day ${cell.day + 1}: ${(cell.intensity * 6).toFixed(1)}h`}
            className={cn("w-7 h-7 rounded-md transition-colors cursor-pointer hover:ring-1 hover:ring-brand-500/40", intensityClass(cell.intensity))}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-[var(--text-muted)]">Less</span>
        {[0.1, 0.35, 0.55, 0.8].map((v) => (
          <div key={v} className={cn("w-3.5 h-3.5 rounded-sm", intensityClass(v))} />
        ))}
        <span className="text-[10px] text-[var(--text-muted)]">More</span>
      </div>
    </div>
  );
}
