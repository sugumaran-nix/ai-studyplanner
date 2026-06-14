"use client";

import { useEffect, useRef } from "react";
import { pageEnter, staggerCards } from "@/lib/animations";
import { BarChart3, TrendingUp, Target, BookOpen, Flame } from "lucide-react";
import { cn, subjectColor } from "@/lib/utils";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function AnalyticsPage() {
  const { activePlan, todaySchedule } = useStore();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) pageEnter(pageRef.current);
    staggerCards(".analytics-card", 0.06);
  }, []);

  // Build subject data ONLY from the user's actual plan subjects
  const subjectData = (() => {
    if (!activePlan?.topic_breakdown) return [];
    const grouped: Record<string, { hours: number; topics: number }> = {};
    activePlan.topic_breakdown.forEach((t) => {
      if (!grouped[t.subject]) grouped[t.subject] = { hours: 0, topics: 0 };
      grouped[t.subject].hours += t.estimated_hours;
      grouped[t.subject].topics += 1;
    });
    const maxHours = Math.max(...Object.values(grouped).map((v) => v.hours));
    return Object.entries(grouped).map(([subject, data], i) => ({
      subject,
      total_hours: Math.round(data.hours * 10) / 10,
      topics: data.topics,
      bar_pct: maxHours > 0 ? Math.round((data.hours / maxHours) * 100) : 0,
      color: subjectColor(i),
    }));
  })();

  if (!activePlan) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Your personal study stats</p>
        </div>
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <BarChart3 size={40} className="text-[var(--border)] mb-4" />
          <h2 className="font-semibold text-[var(--text-primary)] text-lg mb-2">No data yet</h2>
          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            Generate a study plan first. Your subjects, hours, and progress appear here — unique to you.
          </p>
          <Link href="/planner" className="mt-5 btn-primary px-6 py-2.5 text-sm inline-block">
            Create My Study Plan →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Stats for: <strong className="text-[var(--text-secondary)]">{activePlan.title}</strong>
        </p>
      </div>

      {/* Summary cards — all real data from user's plan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Days Until Exam",  value: activePlan.days_until_exam,              unit: "days",     icon: Target,    color: "text-indigo-400", bg: "bg-indigo-400/10" },
          { label: "Total Hours",      value: activePlan.total_hours,                  unit: "hrs",      icon: TrendingUp,color: "text-emerald-400",bg: "bg-emerald-400/10" },
          { label: "Your Subjects",    value: subjectData.length,                      unit: "subjects", icon: BookOpen,  color: "text-amber-400",  bg: "bg-amber-400/10" },
          { label: "Total Topics",     value: activePlan.topic_breakdown?.length ?? 0, unit: "topics",   icon: BarChart3, color: "text-violet-400", bg: "bg-violet-400/10" },
        ].map(({ label, value, unit, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 analytics-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">{label}</span>
              <div className={cn("p-1.5 rounded-lg", bg)}>
                <Icon size={13} className={color} />
              </div>
            </div>
            <div className="flex items-end gap-1.5">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)] mb-0.5">{unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Your subjects — only what the user entered */}
      {subjectData.length > 0 && (
        <div className="card p-6 analytics-card">
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Your Subject Breakdown</h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            Based on subjects you entered — every student sees different data here.
          </p>
          <div className="space-y-4">
            {subjectData.map((s) => (
              <div key={s.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="font-medium text-[var(--text-primary)]">{s.subject}</span>
                  </div>
                  <span className="text-[var(--text-muted)]">{s.topics} topics · {s.total_hours}h</span>
                </div>
                <div className="h-2 bg-[var(--bg-raised)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.bar_pct}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic priority list */}
      {activePlan.topic_breakdown?.length > 0 && (
        <div className="card p-6 analytics-card">
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">Topics by Priority</h3>
          <div className="space-y-2">
            {activePlan.topic_breakdown.slice(0, 10).map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-raised)]">
                <span className={cn("badge text-[10px]",
                  t.priority === "high"   ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  t.priority === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                  {t.priority}
                </span>
                <span className="flex-1 text-sm text-[var(--text-primary)] truncate">{t.topic}</span>
                <span className="text-xs text-[var(--text-muted)] shrink-0">{t.subject} · {t.estimated_hours}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI tips from the plan */}
      {activePlan.tips?.length > 0 && (
        <div className="card p-6 analytics-card">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Flame size={16} className="text-amber-400" /> AI Tips for Your Plan
          </h3>
          <ul className="space-y-2.5">
            {activePlan.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <span className="text-indigo-400 shrink-0 mt-0.5">✦</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
