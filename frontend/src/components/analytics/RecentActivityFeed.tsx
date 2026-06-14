"use client";

import { Activity } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function RecentActivityFeed() {
  const { activePlan, lastFileAnalysis, lastAnalysis } = useStore();

  const activities: { icon: string; text: string; color: string; bg: string }[] = [];

  if (activePlan) {
    activities.push({
      icon: "📅",
      text: `Plan created: "${activePlan.title}"`,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    });
  }
  if (lastFileAnalysis) {
    activities.push({
      icon: "📄",
      text: `Uploaded: ${lastFileAnalysis.filename}`,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    });
  }
  if (lastAnalysis) {
    activities.push({
      icon: "🔍",
      text: `Analysis: ${lastAnalysis.weak_topics?.length ?? 0} weak topics found`,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    });
  }

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <Activity size={18} className="text-[var(--text-secondary)]" />
        <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">No activity yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Your actions will show here as you use StudyMind
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className={cn("p-1.5 rounded-lg shrink-0 text-sm", item.bg)}>
                {item.icon}
              </div>
              <span className="flex-1 text-sm text-[var(--text-secondary)] truncate">
                {item.text}
              </span>
              <span className="text-xs text-[var(--text-muted)] shrink-0">Just now</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
