"use client";

import { Sparkles, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AIRecommendationsPanel() {
  const { activePlan, lastAnalysis } = useStore();

  const recs: { icon: typeof Sparkles; color: string; bg: string; title: string; body: string }[] = [];

  if (activePlan) {
    const highPriority = activePlan.topic_breakdown?.filter((t) => t.priority === "high") ?? [];
    if (highPriority.length > 0) {
      recs.push({
        icon: AlertTriangle,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        title: "High priority topics",
        body: `Focus on: ${highPriority.slice(0, 2).map((t) => t.topic).join(", ")}`,
      });
    }
    recs.push({
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      title: "Plan is active",
      body: `${activePlan.days_until_exam} days to exam · ${activePlan.total_hours}h scheduled`,
    });
  }

  if (lastAnalysis?.weak_topics?.length > 0) {
    recs.push({
      icon: Lightbulb,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      title: "Weak areas from your notes",
      body: lastAnalysis.weak_topics.slice(0, 2).map((t) => t.topic).join(", "),
    });
  }

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
          <Sparkles size={14} className="text-white" />
        </div>
        <h2 className="font-semibold text-[var(--text-primary)]">AI Recommendations</h2>
      </div>

      {recs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles size={28} className="text-[var(--border)] mb-3" />
          <p className="text-sm font-medium text-[var(--text-primary)]">No recommendations yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed max-w-[180px]">
            Generate a study plan to get personalized AI insights.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <div key={i} className="p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border)] hover:border-indigo-500/25 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", rec.bg)}>
                    <Icon size={13} className={rec.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">{rec.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rec.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
