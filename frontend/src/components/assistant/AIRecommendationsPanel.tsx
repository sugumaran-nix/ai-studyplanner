"use client";

import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const RECS = [
  {
    type: "warning",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    title: "Weak area detected",
    body: "Organic Chemistry reactions need more practice. Last review was 6 days ago.",
  },
  {
    type: "tip",
    icon: Lightbulb,
    color: "text-brand-400",
    bg: "bg-brand-400/10",
    title: "Spaced repetition due",
    body: "3 topics from last week are due for review today to lock them into long-term memory.",
  },
  {
    type: "progress",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    title: "On track for exam",
    body: "You're 72% through your study plan with 18 days left. Keep this pace!",
  },
];

export default function AIRecommendationsPanel() {
  return (
    <div className="card p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-1.5 rounded-lg bg-gradient-brand">
          <Sparkles size={14} className="text-white" />
        </div>
        <h2 className="font-semibold text-[var(--text-primary)]">AI Recommendations</h2>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {RECS.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)]
                         hover:border-brand-500/25 transition-all duration-200 cursor-default"
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", rec.bg)}>
                  <Icon size={13} className={rec.color} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">
                    {rec.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {rec.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <button className="mt-4 w-full py-2.5 rounded-xl text-xs font-medium
                         bg-brand-500/10 text-brand-400 hover:bg-brand-500/20
                         border border-brand-500/20 transition-all duration-200">
        View all insights →
      </button>
    </div>
  );
}
