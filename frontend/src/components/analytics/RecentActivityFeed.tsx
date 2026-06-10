"use client";

import { Activity, CheckCircle2, Upload, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const FEED = [
  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", text: "Completed: Calculus – Integration", time: "2h ago" },
  { icon: Upload,       color: "text-brand-400",   bg: "bg-brand-400/10",   text: "Uploaded: Physics Notes Ch.7.pdf", time: "4h ago" },
  { icon: Brain,        color: "text-violet-400",  bg: "bg-violet-400/10",  text: "Analyzed: 3 weak topics found",  time: "4h ago" },
  { icon: Zap,          color: "text-amber-400",   bg: "bg-amber-400/10",   text: "AI Chat: Explained Wave Optics",  time: "Yesterday" },
  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", text: "Completed: Mock Test – Chemistry",time: "Yesterday" },
];

export default function RecentActivityFeed() {
  return (
    <div className="card p-6 h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <Activity size={18} className="text-[var(--text-secondary)]" />
        <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
      </div>

      <div className="space-y-2.5">
        {FEED.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className={cn("p-1.5 rounded-lg shrink-0", item.bg)}>
                <Icon size={13} className={item.color} />
              </div>
              <span className="flex-1 text-sm text-[var(--text-secondary)] truncate">
                {item.text}
              </span>
              <span className="text-xs text-[var(--text-muted)] shrink-0">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
